export interface TsRollupBaseType {
    reqType: string,
    reqDatas: [string, string, string, string, string],
    reqSigS: string,
    reqSigR8: [string, string],
    reqSigMsg: string,

    tokenLeafIdFrom: string,
    tokenLeafIdTo: string,
    txL2TokenAddr: string,
    txAmount: string,
    txL2AddrFrom: string,
    txL2AddrTo: string,
    
    tsPubKeyFrom: string,
    txNonce: string,
    oriNonceFrom: string,
    newNonceFrom: string,

    oriL2TokenAddrFrom: string,
    newL2TokenAddrFrom: string,
    oriAmountFrom: string;
    newAmountFrom: string;

    tsPubKeyTo: string,
    oriNonceTo: string,
    newNonceTo: string,

    oriAmountTo: string,
    newAmountTo: string,

    oriL2TokenAddrTo: string,
    newL2TokenAddrTo: string,

    isCriticalChunk: string[],
    o_chunks: string[],
}

export interface TsRollupAuctionBaseType {
    orderLeafId: string,
    oriOrderLeaf: string,
}

export interface TsRollupAuctionStateType {
    orderRootFlow: string,
    orderMerkleProofTo: string[],
}

export interface TsRollupStateType {
    oriTokenRootFrom: string,
    oriTokenRootTo: string,
    accountMerkleProofFrom: string,
    accountMerkleProofTo: string,
    tokenMerkleProofFrom: string,
    tokenMerkleProofTo: string,
    newTokenRootFrom: string,
    newTokenRootTo: string,
    accountRootFlow: string,
}

export interface TsRollupCircuitInputItemType extends TsRollupBaseType, TsRollupStateType, TsRollupAuctionBaseType, TsRollupAuctionStateType {}

export type TsRollupCircuitInputType = {
    [key in keyof TsRollupCircuitInputItemType]: Array<TsRollupCircuitInputItemType[key]>;
}

// Register Circuit Input
export interface TsRollupRegisterType {
    L2TokenAddr: string;
    amount: string;
    L2Addr: string;
    tsPubKey: [string, string];
}

export interface TsRollupRegisterStateType {
    accountRootFlow: string;
    accountMerkleProof: string[];
}
export interface TsRollupRegisterInputItemType extends TsRollupRegisterType, TsRollupRegisterStateType {}

export type TsRollupRegisterCircuitInputType = {
    [key in keyof TsRollupRegisterInputItemType]: Array<TsRollupRegisterInputItemType[key]>;
}