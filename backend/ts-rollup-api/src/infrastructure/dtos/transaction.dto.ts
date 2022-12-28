import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TsTxRegisterRequest, TsTxDepositRequest, EdDSASignatureRequestType, TsTxTransferRequest, TsTxWithdrawRequest, TsTxAuctionLendRequest, TsTxAuctionBorrowRequest, TsTxAuctionCancelRequest } from '@ts-sdk/domain/lib/ts-types/ts-req-types';
import { TsSystemAccountAddress, TsTokenAddress, TsTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { PaginationResponse } from './common.dto';

export class RollupRegisterDto implements TsTxRegisterRequest {
    @ApiProperty()
      reqType!: TsTxType;
    @ApiProperty()
      L2AddrFrom!: string;
    @ApiProperty()
      L1Address!: string;
    @ApiPropertyOptional()
      L2TokenAddr!: TsTokenAddress;
    @ApiProperty({
      isArray: true,
      type: String,
    })
      tsPubKey!: [string, string];
    @ApiPropertyOptional()
      amount!: string;
}

export class RollupDepositDto implements TsTxDepositRequest {
    
    @ApiProperty()
      reqType!: TsTxType;
    @ApiPropertyOptional()
      L2AddrFrom!: TsSystemAccountAddress.MINT_ADDR;
    @ApiProperty()
      L2AddrTo!: string;
    @ApiProperty()
      L2TokenAddr!: TsTokenAddress;
    @ApiProperty()
      amount!: string;
    @ApiPropertyOptional()
      nonce!: '0';
    @ApiPropertyOptional()
      eddsaSig!: EdDSASignatureRequestType;
    @ApiPropertyOptional()
      ecdsaSig?: string | undefined;
}

export class RollupTransferDto implements TsTxTransferRequest {
    @ApiProperty()
      reqType!: TsTxType;
    @ApiProperty()
      L2AddrFrom!: string;
    @ApiProperty()
      L2AddrTo!: string;
    @ApiProperty()
      L2TokenAddr!: TsTokenAddress;
    @ApiProperty()
      amount!: string;
    @ApiProperty()
      nonce!: string;
    @ApiProperty()
      eddsaSig!: EdDSASignatureRequestType;
    @ApiPropertyOptional()
      ecdsaSig?: string | undefined;
}

export class RollupWithdrawDto implements TsTxWithdrawRequest {
    @ApiProperty()
      reqType!: TsTxType;
    @ApiProperty()
      L2AddrFrom!: string;
    @ApiProperty()
      L2AddrTo!: TsSystemAccountAddress.WITHDRAW_ADDR;
    @ApiProperty()
      L2TokenAddr!: TsTokenAddress;
    @ApiProperty()
      amount!: string;
    @ApiProperty()
      nonce!: string;
    @ApiProperty()
      eddsaSig!: EdDSASignatureRequestType;
    @ApiPropertyOptional()
      ecdsaSig?: string | undefined;
}

export class RollupAuctionLendDto implements TsTxAuctionLendRequest {
    @ApiProperty()
      reqType!: TsTxType;
    @ApiProperty()
      L2AddrFrom!: string;
    @ApiProperty()
      L2AddrTo!: TsSystemAccountAddress.AUCTION_ADDR;
    @ApiProperty()
      L2TokenAddrLending!: TsTokenAddress;
    @ApiProperty()
      lendingAmt!: string;
    @ApiProperty()
      nonce!: string;
    @ApiProperty()
      maturityDate!: string;
    @ApiProperty()
      expiredTime!: string;
    @ApiProperty()
      interest!: string;
    @ApiProperty()
      eddsaSig!: EdDSASignatureRequestType;
    @ApiPropertyOptional()
      ecdsaSig?: string | undefined;
}

export class RollupAuctionBorrowDto implements TsTxAuctionBorrowRequest {
    @ApiProperty()
      reqType!: TsTxType;
    @ApiProperty()
      L2AddrFrom!: string;
    @ApiProperty()
      L2AddrTo!: TsSystemAccountAddress.AUCTION_ADDR;
    @ApiProperty()
      L2TokenAddrCollateral!: TsTokenAddress;
    @ApiProperty()
      collateralAmt!: string;
    @ApiProperty()
      nonce!: string;
    @ApiProperty()
      maturityDate!: string;
    @ApiProperty()
      expiredTime!: string;
    @ApiProperty()
      interest!: string;
    @ApiProperty()
      L2TokenAddrBorrowing!: TsTokenAddress;
    @ApiProperty()
      borrowingAmt!: string;
    @ApiProperty()
      eddsaSig!: EdDSASignatureRequestType;
    @ApiPropertyOptional()
      ecdsaSig?: string | undefined;
}

export class RollupAuctionCancelDto implements TsTxAuctionCancelRequest {
    @ApiProperty()
      reqType!: TsTxType;
    @ApiProperty()
      L2AddrFrom!: TsSystemAccountAddress.AUCTION_ADDR;
    @ApiProperty()
      L2AddrTo!: string;
    @ApiProperty()
      L2TokenAddrRefunded!: TsTokenAddress;
    @ApiProperty()
      amount!: string;
    @ApiProperty()
      nonce!: string;
    @ApiProperty()
      orderLeafId!: string;
    @ApiProperty()
      eddsaSig!: EdDSASignatureRequestType;
    @ApiPropertyOptional()
      ecdsaSig?: string | undefined;
}

export class RollupTransferRecipt {
    @ApiProperty()
      L2FromAddress!: string;
    @ApiProperty()
      L2ToAddress!: string;
    @ApiProperty()
      L2TokenAddr!: string;
    @ApiProperty()
      amount!: string;
    @ApiProperty()
      nonce!: number;
    @ApiProperty()
      eddsaSig!: string;
    @ApiPropertyOptional()
      ecdsaSig?: string;
    @ApiProperty()
      txHash!: string;
    @ApiProperty()
      blockNumber!: number;
    @ApiProperty()
      blockHash!: string;
    @ApiProperty()
      timestamp!: number;
}

export class RollupAuctionRecipt {
    @ApiProperty()
      L2FromAddress!: string;
    @ApiProperty()
      L2ToAddress!: string;
    @ApiProperty()
      L2TokenAddr!: string;
    @ApiProperty()
      amount!: string;
    @ApiProperty()
      nonce!: number;
    @ApiProperty()
      eddsaSig!: string;
    @ApiPropertyOptional()
      ecdsaSig?: string;
    @ApiProperty()
      txHash!: string;
    @ApiProperty()
      blockNumber!: number;
    @ApiProperty()
      blockHash!: string;
    @ApiProperty()
      timestamp!: number;
}

export class BondTokenBO {
  @ApiProperty()
  bondId!: number;
  @ApiProperty()
  L1Addr!: string;
  @ApiProperty()
  L2Addr!: bigint;
  @ApiProperty()
  underlyingToken!: string;
  @ApiProperty()
  maturityDate!: Date;
  @ApiProperty()
  status!: number;
  @ApiProperty()
  createdAt!: Date;
  @ApiProperty()
  updatedAt!: Date;
}

export class BondTokensResponse implements PaginationResponse<BondTokenBO> {
  @ApiProperty()
  total!: number;
  @ApiProperty()
  perPage!: number;
  @ApiProperty()
  pageNumber!: number;
  @ApiProperty()
  totalPage!: number;
  @ApiProperty({
    type: BondTokenBO,
    isArray: true,
  })
  list!: BondTokenBO[];
}