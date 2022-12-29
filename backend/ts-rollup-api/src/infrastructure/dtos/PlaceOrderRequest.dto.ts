import { ApiProperty } from '@nestjs/swagger';
import { TsTxType } from '@ts-rollup-api/domain/value-objects/tsTxType.enum';

export class EdDSASignatureRequestType {
  @ApiProperty({
    isArray: true,
    type: [String],
    maxLength: 2,
    minLength: 2,
  })
  R8!: string[2];
  @ApiProperty()
  S!: string;
}
export class PlaceOrderRequest {
  @ApiProperty({
    enum: TsTxType,
  })
  reqType!: TsTxType;
  @ApiProperty()
  sender!: string;
  @ApiProperty()
  sellTokenId!: string;
  @ApiProperty()
  sellAmt!: string;
  @ApiProperty()
  nonce!: string;
  @ApiProperty()
  buyTokenId!: string;
  @ApiProperty()
  buyAmt!: string;
  @ApiProperty()
  ecdsaSig!: string;
  @ApiProperty({
    type: EdDSASignatureRequestType,
  })
  eddsaSig!: EdDSASignatureRequestType;
}
