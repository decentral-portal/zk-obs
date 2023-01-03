import { ApiProperty } from '@nestjs/swagger';

export class EdDSASignatureRequestType {
  @ApiProperty({
    isArray: true,
    type: String,
    maxItems: 2,
    minItems: 2
  })
  R8!: string[];
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
