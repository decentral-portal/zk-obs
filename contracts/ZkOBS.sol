// SPDX-License-Identifier: MIT
// solhint-disable-next-line
pragma solidity ^0.8.17;

// Open Zeppelin libraries
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "./PoseidonLib.sol";
import "./Operations.sol";
import "./IWETH.sol";
import "./IVerifier.sol";
import "hardhat/console.sol";

/// @title ZkOBS contract
/// @author zkManic
contract ZkOBS is Ownable {
    event Register(address indexed sender, uint32 accountId, uint256 tsPubX, uint256 tsPubY, bytes20 l2Addr);
    event Deposit(address indexed sender, uint32 accountId, uint16 tokenId, uint128 amount);
    event NewL1Request(address indexed sender, uint64 requestId, Operations.OpType opType, bytes pubData);
    event BlockCommitted(uint32 indexed blockNumber);

    struct StoredBlock {
        uint32 blockNumber;
        bytes32 stateRoot;
        uint64 l1RequestNum;
        bytes32 pendingRollupTxHash;
        bytes32 commitment;
        uint256 timestamp;
    }

    struct CommitBlock {
        uint32 blockNumber;
        bytes32 newStateRoot;
        bytes32 newTsRoot;
        bytes publicData;
        uint32[] publicDataOffsets;
        uint256 timestamp;
    }

    struct Proof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[1] commitment;
    }

    bytes32 internal constant EMPTY_STRING_KECCAK = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
    uint8 internal constant CHUNK_BYTES = 12;
    uint256 internal constant REGISTER_BYTES = 4 * CHUNK_BYTES;
    uint256 internal constant INPUT_MASK = (~uint256(0) >> 3);

    PoseidonUnit2 private immutable poseidon2;
    address public immutable wETHAddr;
    address public immutable verifierAddr;

    mapping(address => uint16) public tokenIdOf;
    mapping(address => uint32) public accountIdOf;
    mapping(uint64 => L1Request) public l1RequestQueue;
    mapping(uint32 => bytes32) public storedBlockHashes;
    uint32 public accountNum = 100;
    uint16 public tokenNum;
    uint64 public firstL1RequestId;
    uint64 public pendingL1RequestNum;
    uint64 public committedL1RequestNum;
    uint32 public committedBlockNum;
    uint32 public provedBlockNum;
    uint32 public executedBlockNum;

    struct L1Request {
        bytes32 hashedPubData;
        Operations.OpType opType;
    }

    constructor(
        address wETHAddr_,
        address verifierAddr_,
        bytes32 genesisStateRoot,
        address poseidon2Addr_
    ) {
        wETHAddr = wETHAddr_;
        verifierAddr = verifierAddr_;
        poseidon2 = PoseidonUnit2(poseidon2Addr_);
        StoredBlock memory storedBlock = StoredBlock({
            blockNumber: 0,
            stateRoot: genesisStateRoot,
            l1RequestNum: 0,
            pendingRollupTxHash: EMPTY_STRING_KECCAK,
            commitment: bytes32(0),
            timestamp: 0
        });
        storedBlockHashes[0] = keccak256(abi.encode(storedBlock));
        //! only for test
        tokenNum = 7;
    }

    function addToken(address tokenAddr) external onlyOwner {
        tokenIdOf[tokenAddr] = tokenNum;
        ++tokenNum;
    }

    function registerETH(uint256 tsPubX, uint256 tsPubY) external payable {
        if (accountIdOf[msg.sender] != 0) {
            revert("Account already registered");
        }
        uint16 l2TokenAddr = tokenIdOf[wETHAddr];
        uint128 depositAmount = SafeCast.toUint128(msg.value);
        IWETH(wETHAddr).deposit{ value: msg.value }();

        _register(msg.sender, tsPubX, tsPubY);
        _deposit(msg.sender, l2TokenAddr, depositAmount);
    }

    function registerERC20(
        uint256 tsPubX,
        uint256 tsPubY,
        address tokenAddr,
        uint128 amount
    ) external {
        if (accountIdOf[msg.sender] != 0) {
            revert("Account already registered");
        }
        uint16 tokenId = tokenIdOf[tokenAddr];
        IERC20 token = IERC20(tokenAddr);
        uint256 balanceBefore = token.balanceOf(address(this));
        token.transferFrom(msg.sender, address(this), amount);
        uint256 balanceAfter = token.balanceOf(address(this));
        uint128 depositAmount = SafeCast.toUint128(balanceAfter - balanceBefore);
        require(depositAmount == amount, "Deposit amount inconsistent");

        // register
        if (accountIdOf[msg.sender] == 0) {
            _register(msg.sender, tsPubX, tsPubY);
        }
        // deposit
        _deposit(msg.sender, tokenId, depositAmount);
    }

    function depositETH() external payable {
        if (accountIdOf[msg.sender] == 0) {
            revert("Account not registered");
        }
        uint16 l2TokenAddr = tokenIdOf[wETHAddr];
        uint128 depositAmount = SafeCast.toUint128(msg.value);
        IWETH(wETHAddr).deposit{ value: msg.value }();

        _deposit(msg.sender, l2TokenAddr, depositAmount);
    }

    function depositERC20(address tokenAddr, uint128 amount) external {
        if (accountIdOf[msg.sender] == 0) {
            revert("Account not registered");
        }
        uint16 tokenId = tokenIdOf[tokenAddr];
        IERC20 token = IERC20(tokenAddr);
        uint256 balanceBefore = token.balanceOf(address(this));
        token.transferFrom(msg.sender, address(this), amount);
        uint256 balanceAfter = token.balanceOf(address(this));
        uint128 depositAmount = SafeCast.toUint128(balanceAfter - balanceBefore);
        require(depositAmount == amount, "Deposit amount inconsistent");

        _deposit(msg.sender, tokenId, depositAmount);
    }

    function checkRegisterL1Request(Operations.Register memory register, uint64 requestId)
        public
        view
        returns (bool isExisted)
    {
        L1Request memory req = l1RequestQueue[requestId];
        require(req.opType == Operations.OpType.REGISTER, "OpType not matched");
        require(
            Operations.checkRegisterInL1RequestQueue(register, req.hashedPubData),
            "Register request not existed in L1 request queue"
        );
        return true;
    }

    function checkDepositL1Request(Operations.Deposit memory deposit, uint64 requestId)
        public
        view
        returns (bool isExisted)
    {
        L1Request memory req = l1RequestQueue[requestId];
        require(req.opType == Operations.OpType.DEPOSIT, "OpType not matched");
        require(
            Operations.checkDepositInL1RequestQueue(deposit, req.hashedPubData),
            "Deposit request not existed in priority queue"
        );
        return true;
    }

    function _register(
        address sender,
        uint256 tsPubX,
        uint256 tsPubY
    ) internal {
        bytes20 l2Addr = bytes20(uint160(poseidon2.poseidon([tsPubX, tsPubY])));
        uint32 accountId = accountNum;
        ++accountNum;
        accountIdOf[sender] = accountId;
        Operations.Register memory op = Operations.Register({ accountId: accountId, l2Addr: l2Addr });
        bytes memory pubData = Operations.writeRegisterPubData(op);
        _addL1Request(sender, Operations.OpType.REGISTER, pubData);
        emit Register(sender, accountId, tsPubX, tsPubY, l2Addr);
    }

    function _deposit(
        address sender,
        uint16 tokenId,
        uint128 amount
    ) internal {
        uint32 accountId = accountIdOf[sender];
        Operations.Deposit memory op = Operations.Deposit({ accountId: accountId, tokenId: tokenId, amount: amount });
        bytes memory pubData = Operations.writeDepositPubData(op);
        _addL1Request(sender, Operations.OpType.DEPOSIT, pubData);
        emit Deposit(sender, accountId, tokenId, amount);
    }

    function _addL1Request(
        address sender,
        Operations.OpType opType,
        bytes memory pubData
    ) internal {
        uint64 nextL1RequestId = firstL1RequestId + pendingL1RequestNum;
        bytes32 hashedPubData = keccak256(pubData);
        l1RequestQueue[nextL1RequestId] = L1Request({ hashedPubData: hashedPubData, opType: opType });
        ++pendingL1RequestNum;
        emit NewL1Request(sender, nextL1RequestId, opType, pubData);
    }

    function commitBlocks(StoredBlock memory lastCommittedBlock, CommitBlock[] memory newBlocks) external {
        console.log("commit blocks");
        require(
            storedBlockHashes[committedBlockNum] == keccak256(abi.encode(lastCommittedBlock)),
            "Commited block inconsistency"
        );
        console.log("in commitBlocks()");
        for (uint32 i = 0; i < newBlocks.length; ++i) {
            console.log("[lastCommittedBlock]");
            console.log("blockNum:");
            console.log(lastCommittedBlock.blockNumber);
            console.log("stateRoot:");
            console.logBytes32(lastCommittedBlock.stateRoot);
            console.log("commitment:");
            console.logBytes32(lastCommittedBlock.commitment);
            lastCommittedBlock = _commitOneBlock(lastCommittedBlock, newBlocks[i]);
            console.log("[newBlock]");
            console.log("blockNum:");
            console.log(lastCommittedBlock.blockNumber);
            console.log("stateRoot:");
            console.logBytes32(lastCommittedBlock.stateRoot);
            console.log("commitment:");
            console.logBytes32(lastCommittedBlock.commitment);
            committedL1RequestNum += lastCommittedBlock.l1RequestNum;
            storedBlockHashes[lastCommittedBlock.blockNumber] = keccak256(abi.encode(lastCommittedBlock));
            emit BlockCommitted(lastCommittedBlock.blockNumber);
        }

        committedBlockNum += uint32(newBlocks.length);
        require(
            committedL1RequestNum <= pendingL1RequestNum,
            "The number of total committed priority requests needs to be less than or equal to the number of total pending priority requests"
        );

        committedBlockNum = committedBlockNum;
        committedL1RequestNum = committedL1RequestNum;
    }

    function _commitOneBlock(StoredBlock memory previousBlock, CommitBlock memory newBlock)
        internal
        view
        returns (StoredBlock memory storedNewBlock)
    {
        {
            require(
                newBlock.timestamp >= previousBlock.timestamp,
                "Timestamp of the new block needs to be greater than or equal to the previous block"
            );
        }

        (
            bytes32 pendingRollupTxHash,
            uint64 committedL1RequestNum_,
            bytes memory rollupTxOffsetCommitment
        ) = _collectRollupRequests(newBlock);

        // create commitment for verification
        bytes32 commitment = _createBlockCommitment(previousBlock, newBlock, rollupTxOffsetCommitment);
        return
            StoredBlock(
                newBlock.blockNumber,
                newBlock.newStateRoot,
                committedL1RequestNum_,
                pendingRollupTxHash,
                commitment,
                newBlock.timestamp
            );
    }

    function _collectRollupRequests(CommitBlock memory newBlock)
        internal
        view
        returns (
            bytes32 processableRollupTxHash,
            uint64 processedL1RequestNum,
            bytes memory offsetCommitment
        )
    {
        bytes memory publicData = newBlock.publicData;
        uint64 uncommittedL1RequestNum = firstL1RequestId + committedL1RequestNum;
        processedL1RequestNum = 0;
        processableRollupTxHash = EMPTY_STRING_KECCAK;

        require(publicData.length % CHUNK_BYTES == 0, "Public data length should be evenly divided by CHUNK_BYTES");
        offsetCommitment = new bytes(publicData.length / CHUNK_BYTES);
        for (uint256 i = 0; i < newBlock.publicDataOffsets.length; i++) {
            uint256 offset = newBlock.publicDataOffsets[i];
            require(offset < publicData.length, "Offset should be less than public data length");
            require(offset % CHUNK_BYTES == 0, "Offset should be evenly divided by CHUNK_BYTES");
            uint256 chunkId = offset / CHUNK_BYTES;
            require(offsetCommitment[chunkId] == 0x00, "Offset should not be set before");
            offsetCommitment[chunkId] = bytes1(0x01);

            Operations.OpType opType = Operations.OpType(uint8(publicData[offset]));
            if (opType == Operations.OpType.REGISTER) {
                bytes memory rollupData = Bytes.slice(publicData, offset, REGISTER_BYTES);
                (Operations.Register memory register, Operations.Deposit memory deposit) = Operations
                    .readRegisterPubdata(rollupData);
                checkRegisterL1Request(register, uncommittedL1RequestNum + processedL1RequestNum);
                processedL1RequestNum++;
                checkDepositL1Request(deposit, uncommittedL1RequestNum + processedL1RequestNum);
                processedL1RequestNum++;
                // processableRollupTxHash = keccak256(abi.encodePacked(processableRollupTxHash, rollupData));
            }
        }
    }

    function _createBlockCommitment(
        StoredBlock memory previousBlock,
        CommitBlock memory newBlock,
        bytes memory offsetCommitment
    ) internal view returns (bytes32 commitment) {
        bytes memory pubdata = abi.encodePacked(offsetCommitment, newBlock.publicData);
        console.log("in createBlockCommitment()");
        console.log("commitmentMessage:");
        console.logBytes(abi.encodePacked(previousBlock.stateRoot, newBlock.newStateRoot, newBlock.newTsRoot, pubdata));
        // console.log("oriStateRoot:");
        // console.logBytes32(previousBlock.stateRoot);
        // console.log("newStateRoot:");
        // console.logBytes32(newBlock.newStateRoot);
        // console.log("newTsRoot:");
        // console.logBytes32(newBlock.newTsRoot);
        // console.log("");
        // console.log("isCriticalChunk:");
        // console.logBytes(pubdata);
        commitment = sha256(
            abi.encodePacked(previousBlock.stateRoot, newBlock.newStateRoot, newBlock.newTsRoot, pubdata)
        );
        // console.log("calculated commitment:");
        // console.logBytes32(commitment);
        // console.log("uint256(commitment):");
        // console.log(uint256(commitment));
        // console.log("uint256(commitment) & INPUT_MASK:");
        // console.log(uint256(commitment) & INPUT_MASK);
    }
// 0x0d6189feb875b747242eb678f56f3d907bc192e620231c7c04e7000829efcfb20d31a2ea0bd50134432c6d5c59ec5a680fce07665a4d78f68236907043d307bb1d7ceec9060995e2c3d935f6f9f998a8ffdbbc0072d4cd6c27172392543d9a7101000000000000000001000000640007000000000000000000000000009896807b81e481dc3124d55ffed523a839ee8446b648640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0x0d6189feb875b747242eb678f56f3d907bc192e620231c7c04e7000829efcfb20d31a2ea0bd50134432c6d5c59ec5a680fce07665a4d78f68236907043d307bb1d7ceec9060995e2c3d935f6f9f998a8ffdbbc0072d4cd6c27172392543d9a710100000000000000000100000064000700000000000000000000000000989680db3b49d1bdd96586f6c1d06cedc7946f0064f34a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    function proveBlocks(StoredBlock[] memory committedBlocks, Proof[] memory proof) external {
        console.log("in prove blocks");
        uint32 currentProvedBlockNum = provedBlockNum;
        for (uint256 i = 0; i < committedBlocks.length; i++) {
            console.log(committedBlocks[i].blockNumber);
            console.logBytes32(committedBlocks[i].commitment);
            console.log(committedBlocks[i].l1RequestNum);
            console.logBytes32(committedBlocks[i].pendingRollupTxHash);
            console.logBytes32(committedBlocks[i].stateRoot);
            console.log(committedBlocks[i].timestamp);
            require(keccak256(abi.encode(committedBlocks[i])) == storedBlockHashes[currentProvedBlockNum + 1], "o1");
            _proveOneBlock(committedBlocks[i], proof[i]);
            ++currentProvedBlockNum;
        }

        require(currentProvedBlockNum <= committedBlockNum, "Proved block number exceeds committed block number");
        provedBlockNum = currentProvedBlockNum;
    }

    function _proveOneBlock(StoredBlock memory committedBlock, Proof memory proof) internal view {
        IVerifier verifier = IVerifier(verifierAddr);
        require(verifier.verifyProof(proof.a, proof.b, proof.c, proof.commitment), "Invalid proof");
        console.log("in prove one block");
        console.log("proof commitment:");
        console.log(proof.commitment[0] & INPUT_MASK);
        console.log("committed block commitment:");
        console.log(uint256(committedBlock.commitment) & INPUT_MASK);
        require(
            proof.commitment[0] & INPUT_MASK == uint256(committedBlock.commitment) & INPUT_MASK,
            "commitment inconsistency"
        );
    }
}
