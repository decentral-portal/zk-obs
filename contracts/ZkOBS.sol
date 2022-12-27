// SPDX-License-Identifier: MIT
// solhint-disable-next-line
pragma solidity ^0.8.17;

// Open Zeppelin libraries
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "./Operations.sol";
import "hardhat/console.sol";

/// @title ZkOBS contract
/// @author zkManic
contract ZkOBS is Ownable {
    event Register(address indexed sender, uint32 accountId, bytes20 l2Addr);
    event Deposit(address indexed sender, uint32 accountId, uint16 tokenId, uint128 amount);
    event NewL1Request(
        address indexed sender,
        uint64 requestId,
        Operations.OpType opType,
        bytes pubData
    );

    struct StoredBlock {
        uint32 blockNumber;
        bytes32 stateRoot;
        uint64 l1RequestNum;
        bytes32 pendingRollupTxHash;
        bytes32 commitment;
        uint256 timestamp;
    }

    bytes32 internal constant EMPTY_STRING_KECCAK = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
    address public immutable wETHAddr;

    mapping(address => uint16) public tokenIdOf;
    mapping(address => uint32) public accountIdOf;
    mapping(uint64 => L1Request) public l1RequestQueue;
    mapping(uint32 => bytes32) public storedBlockHashes;
    uint32 public accountNum = 100;
    uint16 public tokenNum;
    uint64 public firstL1RequestId;
    uint64 public pendingL1RequestNum;

    struct L1Request {
        bytes32 hashedPubData;
        Operations.OpType opType;
    }

    constructor(address wETHAddr_, bytes32 genesisStateRoot) {
        wETHAddr = wETHAddr_;
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

    function register(bytes20 l2Addr, address tokenAddr, uint128 amount) external {
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

    function deposit(address tokenAddr, uint128 amount) external {
        if(accountIdOf[msg.sender] == 0) {
            revert("Account not registered");
        }
        uint16 tokenId = tokenIdOf[tokenAddr];
        IERC20 token = IERC20(tokenAddr);
        uint256 balanceBefore = token.balanceOf(address(this));
        token.transferFrom(msg.sender, address(this), amount);
        uint256 balanceAfter = token.balanceOf(address(this));
        uint128 depositAmount = SafeCast.toUint128(balanceAfter - balanceBefore);
        require(depositAmount == amount, "Deposit amount inconsistent");
        // deposit
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

    function _deposit(address sender, uint16 tokenId, uint128 amount) internal {
        uint32 accountId = accountIdOf[sender];
        Operations.Deposit memory op = Operations.Deposit({ accountId: accountId, tokenId: tokenId, amount: amount });
        bytes memory pubData = Operations.writeDepositPubData(op);
        _addL1Request(sender, Operations.OpType.DEPOSIT, pubData);
        emit Deposit(sender, accountId, tokenId, amount);
    }

    function _addL1Request(address sender, Operations.OpType opType, bytes memory pubData) internal {
        uint64 nextL1RequestId = firstL1RequestId + pendingL1RequestNum;
        bytes32 hashedPubData = keccak256(pubData);
        l1RequestQueue[nextL1RequestId] = L1Request({
            hashedPubData: hashedPubData,
            opType: opType
        });
        ++pendingL1RequestNum;
        emit NewL1Request(sender, nextL1RequestId, opType, pubData);
    }
}