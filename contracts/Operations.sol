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
        FORCED_WITHDRAW,
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
    uint8 internal constant ACCOUNT_ID_BYTES = 4;
    uint8 internal constant TS_ADDR_BYTES = 20;
    uint8 internal constant TOKEN_ID_BYTES = 2;
    uint8 internal constant STATE_AMOUNT_BYTES = 16;
    uint8 internal constant TIME_BYTES = 4;

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

    struct ForcedWithdraw {
        uint32 accountId;
        uint16 tokenId;
        uint128 amount;
    }

    struct AuctionEnd {
        uint32 accountId;
        uint16 collateralTokenId;
        uint128 collateralAmt;
        uint16 debtTokenId;
        uint128 debtAmt;
        uint32 maturityTime;
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

    /// @notice Return the bytes of forced withdraw object
    /// @param op The forced withdraw object
    /// @return buf The bytes of forced withdraw object
    function writeForcedWithdrawPubData(ForcedWithdraw memory op) internal pure returns (bytes memory buf) {
        return abi.encodePacked(uint8(OpType.FORCED_WITHDRAW), op.accountId, op.tokenId, uint128(0));
    }

    /// @notice Check whether the register request is in the L1 request queue
    /// @param op The register request
    /// @param hashedPubData The hashedPubData of register request
    /// @return isExisted Return true if exists, else return false
    function isRegisterInL1RequestQueue(Register memory op, bytes32 hashedPubData)
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
    function isDepositInL1RequestQueue(Deposit memory op, bytes32 hashedPubData)
        internal
        pure
        returns (bool isExisted)
    {
        return keccak256(writeDepositPubData(op)) == hashedPubData;
    }

    /// @notice Check whether the forced withdraw request is in the L1 request queue
    /// @param op The forced withdraw request
    /// @param hashedPubData The hashedPubData of forced withdraw request
    /// @return isExisted Return true if exists, else return false
    function isForcedWithdrawInL1RequestQueue(ForcedWithdraw memory op, bytes32 hashedPubData)
        internal
        pure
        returns (bool isExisted)
    {
        return keccak256(writeForcedWithdrawPubData(op)) == hashedPubData;
    }

    uint256 internal constant REGISTER_PUBDATA_BYTES =
        OP_TYPE_BYTES + ACCOUNT_ID_BYTES + TOKEN_ID_BYTES + STATE_AMOUNT_BYTES + TS_ADDR_BYTES;

    function readRegisterPubdata(bytes memory data) internal pure returns (Register memory register) {
        uint256 offset = OP_TYPE_BYTES;
        (offset, register.accountId) = Bytes.readUInt32(data, offset);
        //! Remove it for phase6
        (offset, ) = Bytes.readUInt16(data, offset);
        (offset, ) = Bytes.readUInt128(data, offset);
        (offset, register.l2Addr) = Bytes.readBytes20(data, offset);
        require(offset == REGISTER_PUBDATA_BYTES, "Read register pubdata error");
    }

    uint256 internal constant DEPOSIT_PUBDATA_BYTES =
        OP_TYPE_BYTES + ACCOUNT_ID_BYTES + TOKEN_ID_BYTES + STATE_AMOUNT_BYTES;

    function readDepositPubdata(bytes memory data) internal pure returns (Deposit memory deposit) {
        uint256 offset = OP_TYPE_BYTES;
        (offset, deposit.accountId) = Bytes.readUInt32(data, offset);
        (offset, deposit.tokenId) = Bytes.readUInt16(data, offset);
        (offset, deposit.amount) = Bytes.readUInt128(data, offset);
        require(offset == DEPOSIT_PUBDATA_BYTES, "Read deposit pubdata error");
    }

    uint256 internal constant WITHDRAW_PUBDATA_BYTES =
        OP_TYPE_BYTES + ACCOUNT_ID_BYTES + TOKEN_ID_BYTES + STATE_AMOUNT_BYTES;

    function readWithdrawPubdata(bytes memory data) internal pure returns (Withdraw memory withdraw) {
        uint256 offset = OP_TYPE_BYTES;
        (offset, withdraw.accountId) = Bytes.readUInt32(data, offset);
        (offset, withdraw.tokenId) = Bytes.readUInt16(data, offset);
        (offset, withdraw.amount) = Bytes.readUInt128(data, offset);
        require(offset == WITHDRAW_PUBDATA_BYTES, "Read withdraw pubdata error");
    }

    uint256 internal constant FORCED_WITHDRAW_PUBDATA_BYTES =
        OP_TYPE_BYTES + ACCOUNT_ID_BYTES + TOKEN_ID_BYTES + STATE_AMOUNT_BYTES;

    function readForcedWithdrawPubdata(bytes memory data) internal pure returns (ForcedWithdraw memory forcedWithdraw) {
        uint256 offset = OP_TYPE_BYTES;
        (offset, forcedWithdraw.accountId) = Bytes.readUInt32(data, offset);
        (offset, forcedWithdraw.tokenId) = Bytes.readUInt16(data, offset);
        (offset, forcedWithdraw.amount) = Bytes.readUInt128(data, offset);
        require(offset == FORCED_WITHDRAW_PUBDATA_BYTES, "Read forced withdraw pubdata error");
    }

    uint256 internal constant AUCTIONEND_PUBDATA_BYTES =
        OP_TYPE_BYTES +
            ACCOUNT_ID_BYTES +
            TOKEN_ID_BYTES +
            STATE_AMOUNT_BYTES +
            TOKEN_ID_BYTES +
            STATE_AMOUNT_BYTES +
            TIME_BYTES;

    function readAuctionEndPubdata(bytes memory data) internal pure returns (AuctionEnd memory auctionEnd) {
        uint256 offset = OP_TYPE_BYTES;
        (offset, auctionEnd.accountId) = Bytes.readUInt32(data, offset);
        (offset, auctionEnd.collateralTokenId) = Bytes.readUInt16(data, offset);
        (offset, auctionEnd.collateralAmt) = Bytes.readUInt128(data, offset);
        (offset, auctionEnd.debtTokenId) = Bytes.readUInt16(data, offset);
        (offset, auctionEnd.debtAmt) = Bytes.readUInt128(data, offset);
        (offset, auctionEnd.maturityTime) = Bytes.readUInt32(data, offset);
        require(offset == AUCTIONEND_PUBDATA_BYTES, "Read auction end pubdata error");
    }
}
