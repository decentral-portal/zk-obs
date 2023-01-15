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
    event ReceivedETH(address indexed sender, uint256 amount);
    event TokenWhitelisted(address indexed token, uint16 tokenId);
    event Register(address indexed sender, uint32 accountId, uint256 tsPubX, uint256 tsPubY, bytes20 l2Addr);
    event Deposit(address indexed sender, uint32 accountId, uint16 tokenId, uint128 amount);
    event Withdraw(address indexed sender, uint32 accountId, uint16 tokenId, uint128 amount);
    event NewL1Request(address indexed sender, uint64 requestId, Operations.OpType opType, bytes pubData);
    event BlockCommitted(uint32 indexed blockNumber);
    event BlockProved(uint32 indexed blockNumber);
    event BlockExecuted(uint32 indexed blockNumber);
    event UpdateLoan(
        uint32 accountId,
        uint32 maturityTime,
        uint16 debtTokenId,
        uint16 collateralTokenId,
        uint128 debtAmt,
        uint128 collateralAmt
    );

    struct StoredBlock {
        uint32 blockNumber;
        uint64 l1RequestNum;
        bytes32 pendingRollupTxHash;
        bytes32 commitment;
        bytes32 stateRoot;
        uint256 timestamp;
    }

    struct CommitBlock {
        uint32 blockNumber;
        bytes32 newStateRoot;
        bytes32 newTsRoot;
        uint256 timestamp;
        bytes publicData;
        uint32[] publicDataOffsets;
    }

    struct ExecuteBlock {
        StoredBlock storedBlock;
        bytes[] pendingRollupTxPubdata;
    }

    struct Proof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[1] commitment;
    }

    struct L1Request {
        bytes32 hashedPubData;
        Operations.OpType opType;
    }

    struct Loan {
        uint32 accountId;
        uint32 maturityTime;
        uint16 debtTokenId;
        uint16 collateralTokenId;
        uint128 debtAmt;
        uint128 collateralAmt;
    }

    bytes32 internal constant EMPTY_STRING_KECCAK = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
    uint8 internal constant CHUNK_BYTES = 12;
    uint256 internal constant REGISTER_BYTES = 4 * CHUNK_BYTES;
    uint256 internal constant DEPOSIT_BYTES = 2 * CHUNK_BYTES;
    uint256 internal constant WITHDRAW_BYTES = 2 * CHUNK_BYTES;
    uint256 internal constant FORCED_WITHDRAW_BYTES = 2 * CHUNK_BYTES;
    uint256 internal constant AUCTIONEND_BYTES = 4 * CHUNK_BYTES;
    uint256 internal constant INPUT_MASK = (~uint256(0) >> 3);
    uint8 internal constant RESERVED_TOKEN_NUM = 1;

    PoseidonUnit2 private immutable poseidon2;
    address public immutable wETHAddr;
    address public immutable verifierAddr;

    mapping(address => uint16) public tokenIdOf;
    mapping(uint16 => address) public tokenAddrOf;
    mapping(address => uint32) public accountIdOf;
    mapping(uint32 => address) public addressOf;
    mapping(uint64 => L1Request) public l1RequestQueue;
    mapping(uint32 => bytes32) public storedBlockHashes;
    mapping(bytes22 => uint128) public pendingBalances;
    mapping(bytes12 => Loan) public loanOf;

    uint32 public accountNum = 100;
    uint16 public tokenNum;
    uint64 public firstL1RequestId;
    uint64 public pendingL1RequestNum;
    uint64 public committedL1RequestNum;
    uint32 public committedBlockNum;
    uint32 public provedBlockNum;
    uint32 public executedBlockNum;

    receive() external payable {
        emit ReceivedETH(msg.sender, msg.value);
    }

    constructor(
        address wETHAddr_,
        address verifierAddr_,
        bytes32 genesisStateRoot,
        address poseidon2Addr
    ) {
        wETHAddr = wETHAddr_;
        verifierAddr = verifierAddr_;
        poseidon2 = PoseidonUnit2(poseidon2Addr);
        StoredBlock memory storedBlock = StoredBlock({
            blockNumber: 0,
            stateRoot: genesisStateRoot,
            l1RequestNum: 0,
            pendingRollupTxHash: EMPTY_STRING_KECCAK,
            commitment: bytes32(0),
            timestamp: 0
        });
        storedBlockHashes[0] = keccak256(abi.encode(storedBlock));
        tokenNum = RESERVED_TOKEN_NUM;
        tokenIdOf[wETHAddr] = tokenNum;
        emit TokenWhitelisted(wETHAddr, tokenNum);
        ++tokenNum;
    }

    function addToken(address tokenAddr) external onlyOwner {
        require(tokenIdOf[tokenAddr] == 0, "Token already registered");
        tokenIdOf[tokenAddr] = tokenNum;
        tokenAddrOf[tokenNum] = tokenAddr;
        emit TokenWhitelisted(tokenAddr, tokenNum);
        ++tokenNum;
    }

    function registerETH(uint256 tsPubX, uint256 tsPubY) external payable {
        require(accountIdOf[msg.sender] == 0, "Account already registered");

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
        require(accountIdOf[msg.sender] == 0, "Account already registered");
        uint16 tokenId = tokenIdOf[tokenAddr];
        IERC20 token = IERC20(tokenAddr);
        uint256 balanceBefore = token.balanceOf(address(this));
        token.transferFrom(msg.sender, address(this), amount);
        uint256 balanceAfter = token.balanceOf(address(this));
        uint128 depositAmount = SafeCast.toUint128(balanceAfter - balanceBefore);
        require(depositAmount == amount, "Deposit amount inconsistent");

        _register(msg.sender, tsPubX, tsPubY);
        _deposit(msg.sender, tokenId, depositAmount);
    }

    function depositETH() external payable {
        require(accountIdOf[msg.sender] != 0, "Account not registered");
        uint16 l2TokenAddr = tokenIdOf[wETHAddr];
        uint128 depositAmount = SafeCast.toUint128(msg.value);
        IWETH(wETHAddr).deposit{ value: msg.value }();

        _deposit(msg.sender, l2TokenAddr, depositAmount);
    }

    function depositERC20(address tokenAddr, uint128 amount) external {
        require(accountIdOf[msg.sender] != 0, "Account not registered");
        uint16 tokenId = tokenIdOf[tokenAddr];
        IERC20 token = IERC20(tokenAddr);
        uint256 balanceBefore = token.balanceOf(address(this));
        token.transferFrom(msg.sender, address(this), amount);
        uint256 balanceAfter = token.balanceOf(address(this));
        uint128 depositAmount = SafeCast.toUint128(balanceAfter - balanceBefore);
        require(depositAmount == amount, "Deposit amount inconsistent");

        _deposit(msg.sender, tokenId, depositAmount);
    }

    function withdrawETH(uint128 amount) external payable {
        require(accountIdOf[msg.sender] != 0, "Account not registered");
        uint16 tokenId = tokenIdOf[wETHAddr];
        _withdraw(msg.sender, tokenId, amount);
        IWETH(wETHAddr).withdraw(uint256(amount));
        (bool success, ) = payable(msg.sender).call{ value: amount }("");
        require(success, "Transfer failed");
    }

    function withdrawERC20(address tokenAddr, uint128 amount) external {
        require(accountIdOf[msg.sender] != 0, "Account not registered");
        uint16 tokenId = tokenIdOf[tokenAddr];
        _withdraw(msg.sender, tokenId, amount);
        IERC20(tokenAddr).transfer(msg.sender, amount);
    }

    function checkRegisterL1Request(Operations.Register memory register, uint64 requestId)
        public
        view
        returns (bool isExisted)
    {
        L1Request memory req = l1RequestQueue[requestId];
        require(req.opType == Operations.OpType.REGISTER, "OpType not matched");
        require(
            Operations.isRegisterInL1RequestQueue(register, req.hashedPubData),
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
            Operations.isDepositInL1RequestQueue(deposit, req.hashedPubData),
            "Deposit request not existed in L1 request queue"
        );
        return true;
    }

    function checkForcedWithdrawL1Request(Operations.ForcedWithdraw memory forcedWithdraw, uint64 requestId)
        public
        view
        returns (bool isExisted)
    {
        L1Request memory req = l1RequestQueue[requestId];
        require(req.opType == Operations.OpType.FORCED_WITHDRAW, "OpType not matched");
        require(
            Operations.isForcedWithdrawInL1RequestQueue(forcedWithdraw, req.hashedPubData),
            "Forced withdraw request not existed in L1 request queue"
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
        addressOf[accountId] = sender;
        console.log("in _register()");
        console.log(accountId);
        console.logBytes20(l2Addr);
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
        console.log("in _deposit()");
        console.log(accountId);
        console.log(tokenId);
        console.log(amount);
        bytes memory pubData = Operations.writeDepositPubData(op);
        _addL1Request(sender, Operations.OpType.DEPOSIT, pubData);
        emit Deposit(sender, accountId, tokenId, amount);
    }

    function _withdraw(
        address sender,
        uint16 tokenId,
        uint128 amount
    ) internal {
        uint32 accountId = accountIdOf[sender];
        bytes22 key = _packAddressAndTokenId(addressOf[accountId], tokenId);
        uint128 pendingBalance = pendingBalances[key];
        require(pendingBalance >= amount, "Withdraw amount exceeds pending balance");
        pendingBalances[key] = pendingBalance - amount;
        emit Withdraw(sender, accountId, tokenId, amount);
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
        console.log("commitBlocks");
        console.log(committedBlockNum);
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
        require(
            newBlock.timestamp >= previousBlock.timestamp,
            "Timestamp of the new block needs to be greater than or equal to the previous block"
        );

        (
            bytes32 pendingRollupTxHash,
            uint64 committedL1RequestNum_,
            bytes memory rollupTxOffsetCommitment
        ) = _collectRollupRequests(newBlock);

        // create commitment for verification
        bytes32 commitment = _createBlockCommitment(previousBlock, newBlock, rollupTxOffsetCommitment);
        console.log("[commit blocks]");
        console.log("block number:");
        console.log(newBlock.blockNumber);
        console.log("commitment:");
        console.logBytes32(commitment);
        console.log("l1 request num:");
        console.log(committedL1RequestNum_);
        console.log("pending rollup tx hash:");
        console.logBytes32(pendingRollupTxHash);
        console.log("state root:");
        console.logBytes32(newBlock.newStateRoot);
        console.log("timestamp:");
        console.log(newBlock.timestamp);
        return
            StoredBlock(
                newBlock.blockNumber,
                committedL1RequestNum_,
                pendingRollupTxHash,
                commitment,
                newBlock.newStateRoot,
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
            // console.log("opType:");
            // console.log(uint8(publicData[offset]));
            if (opType == Operations.OpType.REGISTER) {
                bytes memory rollupData = Bytes.slice(publicData, offset, REGISTER_BYTES);
                Operations.Register memory register = Operations.readRegisterPubdata(rollupData);
                checkRegisterL1Request(register, uncommittedL1RequestNum + processedL1RequestNum);
                ++processedL1RequestNum;
                //checkDepositL1Request(deposit, uncommittedL1RequestNum + processedL1RequestNum);
                // ++processedL1RequestNum;
                // processableRollupTxHash = keccak256(abi.encodePacked(processableRollupTxHash, rollupData));
            } else if (opType == Operations.OpType.DEPOSIT) {
                bytes memory rollupData = Bytes.slice(publicData, offset, DEPOSIT_BYTES);
                // console.log("rollupdata:");
                // console.log(offset);
                // console.logBytes(rollupData);
                Operations.Deposit memory deposit = Operations.readDepositPubdata(rollupData);
                checkDepositL1Request(deposit, uncommittedL1RequestNum + processedL1RequestNum);
                ++processedL1RequestNum;
            } else {
                bytes memory pubdata;
                if (opType == Operations.OpType.WITHDRAW) {
                    pubdata = Bytes.slice(publicData, offset, WITHDRAW_BYTES);
                } else if (opType == Operations.OpType.FORCED_WITHDRAW) {
                    pubdata = Bytes.slice(publicData, offset, FORCED_WITHDRAW_BYTES);
                    Operations.ForcedWithdraw memory forcedWithdrawReq = Operations.readForcedWithdrawPubdata(pubdata);
                    checkForcedWithdrawL1Request(forcedWithdrawReq, uncommittedL1RequestNum + processedL1RequestNum);
                    ++processedL1RequestNum;
                } else if (opType == Operations.OpType.AUCTION_END) {
                    pubdata = Bytes.slice(publicData, offset, AUCTIONEND_BYTES);
                } else {
                    revert("Unsupported operation type");
                }
                processableRollupTxHash = keccak256(abi.encodePacked(processableRollupTxHash, pubdata));
            }
            // else if (opType == Operations.OpType.WITHDRAW) {
            //     bytes memory pubdata = Bytes.slice(publicData, offset, WITHDRAW_BYTES);
            //     console.log("in collectRollupRequest");
            //     console.log("ori hash:");
            //     console.logBytes32(processableRollupTxHash);
            //     console.log("pubdata:");
            //     console.logBytes(pubdata);
            //     processableRollupTxHash = keccak256(abi.encodePacked(processableRollupTxHash, pubdata));
            //     console.log("new hash:");
            //     console.logBytes32(processableRollupTxHash);
            // }
        }
    }

    function _createBlockCommitment(
        StoredBlock memory previousBlock,
        CommitBlock memory newBlock,
        bytes memory offsetCommitment
    ) internal pure returns (bytes32 commitment) {
        bytes memory pubdata = abi.encodePacked(offsetCommitment, newBlock.publicData);
        // console.log("[in createBlockCommitment]");
        // console.logBytes(abi.encodePacked(previousBlock.stateRoot, newBlock.newStateRoot, newBlock.newTsRoot, pubdata));
        commitment = sha256(
            abi.encodePacked(previousBlock.stateRoot, newBlock.newStateRoot, newBlock.newTsRoot, pubdata)
        );
    }

    // 0x280f97ccf6ca348227c9d0ccff97b0bd90016ef3ece6a24c8cad6e1474bc6ba11229d7608dc4f2d03c7d872a7d8627ade6c3a59ec81ea0d06c56a344909aced62e364414d101f44eae889eec07ab51b1c5b5172051aaff071473504eafe38171010000000000000000040000006400010000000014000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    // 0x280f97ccf6ca348227c9d0ccff97b0bd90016ef3ece6a24c8cad6e1474bc6ba11229d7608dc4f2d03c7d872a7d8627ade6c3a59ec81ea0d06c56a344909aced62e364414d101f44eae889eec07ab51b1c5b5172051aaff071473504eafe3817100040000006400010800000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    function proveBlocks(StoredBlock[] memory committedBlocks, Proof[] memory proof) external {
        uint32 currentProvedBlockNum = provedBlockNum;
        for (uint256 i = 0; i < committedBlocks.length; i++) {
            console.log("[prove blocks]");
            console.log("block number:");
            console.log(committedBlocks[i].blockNumber);
            console.log("commitment:");
            console.logBytes32(committedBlocks[i].commitment);
            console.log("l1 request num:");
            console.log(committedBlocks[i].l1RequestNum);
            console.log("pending rollup tx hash:");
            console.logBytes32(committedBlocks[i].pendingRollupTxHash);
            console.log("state root:");
            console.logBytes32(committedBlocks[i].stateRoot);
            console.log("timestamp:");
            console.log(committedBlocks[i].timestamp);
            require(keccak256(abi.encode(committedBlocks[i])) == storedBlockHashes[currentProvedBlockNum + 1], "o1");
            _proveOneBlock(committedBlocks[i], proof[i]);
            emit BlockProved(committedBlocks[i].blockNumber);
            ++currentProvedBlockNum;
        }

        require(currentProvedBlockNum <= committedBlockNum, "Proved block number exceeds committed block number");
        provedBlockNum = currentProvedBlockNum;
    }

    function _proveOneBlock(StoredBlock memory committedBlock, Proof memory proof) internal view {
        IVerifier verifier = IVerifier(verifierAddr);
        require(verifier.verifyProof(proof.a, proof.b, proof.c, proof.commitment), "Invalid proof");
        // console.log("proof.commitment[0]:");
        // console.log(proof.commitment[0]);
        // console.log("proof.commitment[0] & INPUT_MASK:");
        // console.log(proof.commitment[0] & INPUT_MASK);
        // console.log("committedBlock.commitment:");
        // console.log(uint256(committedBlock.commitment));
        // console.log("committedBlock.commitment & INPUT_MASK:");
        // console.log(uint256(committedBlock.commitment) & INPUT_MASK);
        // console.log("INPUT_MASK");
        // console.log(INPUT_MASK);
        require(
            proof.commitment[0] & INPUT_MASK == uint256(committedBlock.commitment) & INPUT_MASK,
            "commitment inconsistency"
        );
    }

    function executeBlocks(ExecuteBlock[] memory pendingBlocks) external {
        uint64 executedL1RequestNum = 0;
        uint32 blockNum = uint32(pendingBlocks.length);
        for (uint32 i = 0; i < pendingBlocks.length; ++i) {
            _executeOneBlock(pendingBlocks[i], i);
            executedL1RequestNum += pendingBlocks[i].storedBlock.l1RequestNum;
            emit BlockExecuted(pendingBlocks[i].storedBlock.blockNumber);
        }
        firstL1RequestId += executedL1RequestNum;
        committedL1RequestNum -= executedL1RequestNum;
        pendingL1RequestNum -= executedL1RequestNum;

        executedBlockNum += blockNum;
        require(executedBlockNum <= provedBlockNum, "Executed block number exceeds proved block number");
    }

    function _executeOneBlock(ExecuteBlock memory executeBlock, uint32 blockId) internal {
        require(
            keccak256(abi.encode(executeBlock.storedBlock)) == storedBlockHashes[executeBlock.storedBlock.blockNumber],
            "o2"
        );
        require(executeBlock.storedBlock.blockNumber == executedBlockNum + blockId + 1, "o3");
        bytes32 pendingRollupTxHash = EMPTY_STRING_KECCAK;
        for (uint32 i = 0; i < executeBlock.pendingRollupTxPubdata.length; ++i) {
            bytes memory pubData = executeBlock.pendingRollupTxPubdata[i];
            Operations.OpType opType = Operations.OpType(uint8(pubData[0]));

            if (opType == Operations.OpType.WITHDRAW) {
                Operations.Withdraw memory withdrawReq = Operations.readWithdrawPubdata(pubData);
                _increasePendingBalance(withdrawReq.accountId, withdrawReq.tokenId, withdrawReq.amount);
            } else if (opType == Operations.OpType.FORCED_WITHDRAW) {
                Operations.ForcedWithdraw memory forcedWithdrawReq = Operations.readForcedWithdrawPubdata(pubData);
                _increasePendingBalance(
                    forcedWithdrawReq.accountId,
                    forcedWithdrawReq.tokenId,
                    forcedWithdrawReq.amount
                );
            } else if (opType == Operations.OpType.AUCTION_END) {
                Operations.AuctionEnd memory auctionEnd = Operations.readAuctionEndPubdata(pubData);
                _updateLoan(auctionEnd);
            } else {
                revert("Invalid opType");
            }
            pendingRollupTxHash = keccak256(abi.encodePacked(pendingRollupTxHash, pubData));
        }

        //require(pendingRollupTxHash == executeBlock.storedBlock.pendingRollupTxHash, "o4");
    }

    function _increasePendingBalance(
        uint32 accountId,
        uint16 tokenId,
        uint128 amount
    ) internal {
        bytes22 key = _packAddressAndTokenId(addressOf[accountId], tokenId);
        uint128 pendingBalance = pendingBalances[key];
        pendingBalances[key] = pendingBalance + amount;
    }

    function _packAddressAndTokenId(address addr, uint16 tokenId) internal pure returns (bytes22) {
        return bytes22((uint176(uint160(addr)) | (uint176(tokenId) << 160)));
    }

    function getLoanId(
        uint32 accountId,
        uint32 maturityTime,
        uint16 debtTokenId,
        uint16 collateralTokenId
    ) public pure returns (bytes12) {
        return
            bytes12(
                uint96(collateralTokenId) |
                    (uint96(debtTokenId) << 16) |
                    (uint96(maturityTime) << 32) |
                    (uint96(accountId) << 64)
            );
    }

    function _updateLoan(Operations.AuctionEnd memory auctionEnd) internal {
        bytes12 loanId = getLoanId(
            auctionEnd.accountId,
            auctionEnd.maturityTime,
            auctionEnd.debtTokenId,
            auctionEnd.collateralTokenId
        );

        Loan memory loan = loanOf[loanId];
        loan.accountId = auctionEnd.accountId;
        loan.debtTokenId = auctionEnd.debtTokenId;
        loan.collateralTokenId = auctionEnd.collateralTokenId;
        loan.maturityTime = auctionEnd.maturityTime;
        loan.debtAmt += auctionEnd.debtAmt;
        loan.collateralAmt += auctionEnd.collateralAmt;
        loanOf[loanId] = loan;

        emit UpdateLoan(
            loan.accountId,
            loan.maturityTime,
            loan.debtTokenId,
            loan.collateralTokenId,
            loan.debtAmt,
            loan.collateralAmt
        );
    }
}
