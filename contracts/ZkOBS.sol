// SPDX-License-Identifier: MIT
// solhint-disable-next-line
pragma solidity ^0.8.17;

// Open Zeppelin libraries
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "./Operations.sol";
import "./IWETH.sol";
import "hardhat/console.sol";

/// @title ZkOBS contract
/// @author zkManic
contract ZkOBS is Ownable {
    event Register(address indexed sender, uint32 accountId, bytes20 l2Addr);
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
    uint8 internal constant CHUNK_BYTES = 5;
    uint256 internal constant REGISTER_BYTES = 9 * CHUNK_BYTES;
    uint256 internal constant INPUT_MASK = (~uint256(0) >> 3);

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
        bytes32 genesisStateRoot
    ) {
        wETHAddr = wETHAddr_;
        verifierAddr = verifierAddr_;
        StoredBlock memory storedBlock = StoredBlock({
            blockNumber: 0,
            stateRoot: genesisStateRoot,
            l1RequestNum: 0,
            pendingRollupTxHash: EMPTY_STRING_KECCAK,
            commitment: bytes32(0),
            timestamp: 0
        });
        storedBlockHashes[0] = keccak256(abi.encode(storedBlock));
    }

    function addToken(address tokenAddr) external onlyOwner {
        tokenIdOf[tokenAddr] = tokenNum;
        ++tokenNum;
    }

    function registerETH(bytes20 l2Addr) external payable {
        if (accountIdOf[msg.sender] != 0) {
            revert("Account already registered");
        }
        uint16 l2TokenAddr = tokenIdOf[wETHAddr];
        uint128 depositAmount = SafeCast.toUint128(msg.value);
        IWETH(wETHAddr).deposit{ value: msg.value }();

        _register(msg.sender, l2Addr);
        _deposit(msg.sender, l2TokenAddr, depositAmount);
    }

    function registerERC20(
        bytes20 l2Addr,
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
            _register(msg.sender, l2Addr);
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

    function _register(address sender, bytes20 l2Addr) internal {
        uint32 accountId = accountNum;
        ++accountNum;
        accountIdOf[sender] = accountId;
        Operations.Register memory op = Operations.Register({ accountId: accountId, l2Addr: l2Addr });
        bytes memory pubData = Operations.writeRegisterPubData(op);
        _addL1Request(sender, Operations.OpType.REGISTER, pubData);
        emit Register(sender, accountId, l2Addr);
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
        require(
            storedBlockHashes[committedBlockNum] == keccak256(abi.encode(lastCommittedBlock)),
            "Commited block inconsistency"
        );

        for (uint32 i = 0; i < newBlocks.length; ++i) {
            lastCommittedBlock = _commitOneBlock(lastCommittedBlock, newBlocks[i]);
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
    ) internal pure returns (bytes32 commitment) {
        // * circuit = sha256(oriStateRoot, newStateRoot, tsRoot, slot0, slot1, ..., slot255)
        bytes32 tsRoot = 0x218aa75509f1dbc6f8aba270fad8212d0e6afa426c7e85eff9f889aae138a278;

        bytes memory pubdata = abi.encodePacked(offsetCommitment, newBlock.publicData);
        commitment = sha256(abi.encodePacked(previousBlock.stateRoot, newBlock.newStateRoot, tsRoot, pubdata));
    }
}
