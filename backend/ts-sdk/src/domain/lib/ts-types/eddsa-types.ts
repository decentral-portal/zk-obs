
export type EdDSAPublicKeyType = [Uint8Array, Uint8Array];

export type EdDSASignaturePayload = {
    R8: [Uint8Array, Uint8Array],
    S: bigint
}
