import { ApiProperty } from '@nestjs/swagger';
import { TsTxType } from '@ts-rollup-api/domain/value-objects/tsTxType.enum';

export class EdDSASignatureRequestType {
  @ApiProperty({
    isArray: true,
    type: String,
    maxItems: 2,
    minItems: 2
  })
  R8!: String[];
  @ApiProperty()
  S!: string;
}
export class PlaceOrderRequest {
  @ApiProperty()
  reqType!: string;
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
