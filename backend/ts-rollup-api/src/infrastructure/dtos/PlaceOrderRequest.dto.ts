import { ApiProperty } from '@nestjs/swagger';
import { TsTxType } from '@ts-rollup-api/domain/value-objects/tsTxType.enum';

export class EdDSASignatureRequestType {
  @ApiProperty({
    isArray: true,
    type: [String],
  })
  R8!: string[];
  @ApiProperty()
  S!: string;
}
export class PlaceOrderRequest {
  @ApiProperty({
    enum: TsTxType,
  })
  reqType!: TsTxType;
  @ApiProperty()
  accountId!: string;
  @ApiProperty()
  buyAmt!: string;
  @ApiProperty()
  L2TokenAddrBuy!: string;
  @ApiProperty()
  sellAmt!: string;
  @ApiProperty()
  L2TokenAddrSell!: string;
  @ApiProperty()
  nonce!: string;
  @ApiProperty()
  ecdsaSig!: string;
  @ApiProperty({
    type: EdDSASignatureRequestType,
  })
  eddsaSig!: EdDSASignatureRequestType;
}
