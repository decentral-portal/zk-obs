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
    event NewL1Request(
        address indexed sender,
        uint64 requestId,
        Operations.OpType opType,
        bytes pubData
    );
    mapping(address => uint16) public tokenIdOf;
    mapping(address => uint32) public accountIdOf;
    mapping(uint64 => L1Request) public l1RequestQueue;
    uint32 public accountNum = 100;
    uint64 public firstL1RequestId;
    uint64 public pendingL1RequestNum;

    struct L1Request {
        bytes32 hashedPubData;
        Operations.OpType opType;
    }

    function deposit(bytes20 l2Addr, address tokenAddr, uint128 amount) external {
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

    function _register(address sender, bytes20 l2Addr) internal {
        uint32 accountId = accountNum;
        ++accountNum;
        accountIdOf[sender] = accountId;
        Operations.Register memory op = Operations.Register({ accountId: accountId, l2Addr: l2Addr });
        bytes memory pubData = Operations.writeRegisterPubData(op);
        _addL1Request(sender, Operations.OpType.REGISTER, pubData);
        emit Register(sender, accountId, l2Addr);

    }

    function _deposit(address sender, uint16 tokenId, uint128 amount) internal {}

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

    
