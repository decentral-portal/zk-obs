// SPDX-License-Identifier: MIT
// solhint-disable-next-line
pragma solidity ^0.8.17;

import "./Bytes.sol";
import "hardhat/console.sol";

/// @title ZkOBS operation library
/// @author zkManic
library Operations {
    /// @notice circuit operation type
    enum OpType {
        UNKNOWN,
        REGISTER,
        DEPOSIT,
        TRANSFER,
        WITHDRAW,
        AUCTION_LEND,
        AUCTION_BORROW,
        CANCEL_ORDER,
        SET_EPOCH,
        AUCTION_START,
        AUCTION_MATCH,
        AUCTION_END,
        SECOND_LIMIT_ORDER,
        SECOND_LIMIT_START,
        SECOND_LIMIT_EXCHANGE,
        SECOND_LIMIT_END,
        SECOND_MARKET_ORDER,
        SECOND_MARKET_EXCHANGE,
        SECOND_MARKET_END
    }

    // Byte length definition
    uint8 internal constant OP_TYPE_BYTES = 1;
    uint8 internal constant L2_ADDR_BYTES = 4;
    uint8 internal constant TS_ADDR_BYTES = 20;
    uint8 internal constant L2_TOKEN_ADDR_BYTES = 2;
    uint8 internal constant STATE_AMOUNT_BYTES = 16;

    // Register pubdata
    struct Register {
        uint32 accountId;
        bytes20 l2Addr;
    }

    // Deposit pubdata
    struct Deposit {
        uint32 accountId;
        uint16 tokenId;
        uint128 amount;
    }

    struct Withdraw {
        uint32 accountId;
        uint16 tokenId;
        uint128 amount;
    }

    /// @notice Return the bytes of register object
    /// @param op The register object
    /// @return buf The bytes of register object
    function writeRegisterPubData(Register memory op) internal pure returns (bytes memory buf) {
        return abi.encodePacked(uint8(OpType.REGISTER), op.accountId, op.l2Addr);
    }

    /// @notice Return the bytes of deposit object
    /// @param op The deposit object
    /// @return buf The bytes of deposit object
    function writeDepositPubData(Deposit memory op) internal pure returns (bytes memory buf) {
        return abi.encodePacked(uint8(OpType.DEPOSIT), op.accountId, op.tokenId, op.amount);
    }

    /// @notice Check whether the register request is in the L1 request queue
    /// @param op The register request
    /// @param hashedPubData The hashedPubData of register request
    /// @return isExisted Return true if exists, else return false
    function checkRegisterInL1RequestQueue(Register memory op, bytes32 hashedPubData)
        internal
        pure
        returns (bool isExisted)
    {
        return keccak256(writeRegisterPubData(op)) == hashedPubData;
    }

    /// @notice Check whether the deposit request is in the L1 request queue
    /// @param op The deposit request
    /// @param hashedPubData The hashedPubData of deposit request
    /// @return isExisted Return true if exists, else return false
    function checkDepositInL1RequestQueue(Deposit memory op, bytes32 hashedPubData)
        internal
        pure
        returns (bool isExisted)
    {
        return keccak256(writeDepositPubData(op)) == hashedPubData;
    }

    uint256 internal constant REGISTER_PUBDATA_BYTES =
        OP_TYPE_BYTES + L2_ADDR_BYTES + L2_TOKEN_ADDR_BYTES + STATE_AMOUNT_BYTES + TS_ADDR_BYTES;

    function readRegisterPubdata(bytes memory data) internal pure returns (Register memory register) {
        uint256 offset = OP_TYPE_BYTES;
        (offset, register.accountId) = Bytes.readUInt32(data, offset);
        (offset, ) = Bytes.readUInt16(data, offset);
        (offset, ) = Bytes.readUInt128(data, offset);
        (offset, register.l2Addr) = Bytes.readBytes20(data, offset);
        require(offset == REGISTER_PUBDATA_BYTES, "Read register pubdata error");
    }

    uint256 internal constant DEPOSIT_PUBDATA_BYTES =
        OP_TYPE_BYTES + L2_ADDR_BYTES + L2_TOKEN_ADDR_BYTES + STATE_AMOUNT_BYTES;

    function readDepositPubdata(bytes memory data) internal pure returns (Deposit memory deposit) {
        uint256 offset = OP_TYPE_BYTES;
        (offset, deposit.accountId) = Bytes.readUInt32(data, offset);
        (offset, deposit.tokenId) = Bytes.readUInt16(data, offset);
        (offset, deposit.amount) = Bytes.readUInt128(data, offset);
        require(offset == DEPOSIT_PUBDATA_BYTES, "Read deposit pubdata error");
    }

    uint256 internal constant WITHDRAW_PUBDATA_BYTES =
        OP_TYPE_BYTES + L2_ADDR_BYTES + L2_TOKEN_ADDR_BYTES + STATE_AMOUNT_BYTES;

    function readWithdrawPubdata(bytes memory data) internal pure returns (Withdraw memory withdraw) {
        uint256 offset = OP_TYPE_BYTES;
        (offset, withdraw.accountId) = Bytes.readUInt32(data, offset);
        (offset, withdraw.tokenId) = Bytes.readUInt16(data, offset);
        (offset, withdraw.amount) = Bytes.readUInt128(data, offset);
        require(offset == WITHDRAW_PUBDATA_BYTES, "Read withdraw pubdata error");
    }
}
