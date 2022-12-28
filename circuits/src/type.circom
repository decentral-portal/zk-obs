pragma circom 2.0.2;
/*
*   "OL" means: OrderLeaf;
*   "AL" means: AccountLeaf;
*   "TL" means: TokenLeaf;
*/
/* Request */
function LenOfRequest(){
    return 10;
}
function ReqIdxReqType(){
    return 0;
}
function ReqIdxL2AddrSigner(){
    return 1;
}
function ReqIdxL2TokenAddr(){
    return 2;
}
function ReqIdxAmount(){
    return 3;
}
function ReqIdxNonce(){
    return 4;
}
function ReqIdxArg(i){
    return i + 5;
}

function ReqTypeCount(){
    return 12;
}
function ReqTypeNumUnknow(){
    return 0;
}
function ReqTypeNumRegister(){
    return 1;
}
function ReqTypeNumDeposit(){
    return 2;
}
function ReqTypeNumWithdraw(){
    return 3;
}
function ReqTypeNumSecondLimitOrder(){
    return 4;
}
function ReqTypeNumSecondLimitStart(){
    return 5;
}
function ReqTypeNumSecondLimitExchange(){
    return 6;
}
function ReqTypeNumSecondLimitEnd(){
    return 7;
}
function ReqTypeNumSecondMarketOrder(){
    return 8;
}
function ReqTypeNumSecondMarketExchange(){
    return 9;
}
function ReqTypeNumSecondMarketEnd(){
    return 10;
}
function ReqTypeNumCancel(){
    return 11;
}

/* NullifierLeaf */
function LenOfNL(){
    return 8;
}

/* TokenLeaf */
function LenOfTL(){
    return 2;
}
function TLIdxAvlAmt(){
    return 0;
}
function TLIdxLockedAmt(){
    return 1;
}

/* AccountLeaf */
function LenOfAL(){
    return 3;
}
function ALIdxTsAddr(){
    return 0;
}
function ALIdxNonce(){
    return 1;
}
function ALIdxTokenRoot(){
    return 2;
}

/* OrderLeaf */
function LenOfOL(){
    return LenOfRequest() + 1; // > req.concate([tx_id])
}
function OLIdxReqType(){
    return ReqIdxReqType();
}
function OLIdxL2AddrSigner(){
    return ReqIdxL2AddrSigner();
}
function OLIdxL2TokenAddr(){
    return ReqIdxL2TokenAddr();
}
function OLIdxAmount(){
    return ReqIdxAmount();
}
function OLIdxArg(idx){
    return ReqIdxArg(idx);
}

/* Channel */
function LenOfChannel(){
    return LenOfRequest() + 3;
}

/* Response */
function LenOfResponse(){
    return 2;
}

/* Bits */
function BitsReqType(){
    return 128;
}
function BitsL2Addr(){
    return 128;
}
function BitsTokenAddr(){
    return 128;
}
function BitsAmount(){
    return 126;
}
function BitsNonce(){
    return 32;
}
function BitsTsAddr(){
    return 160;
}
function BitsTime(){
    return 64;
}
function BitsPrice(){
    return 64;
}
function BitsInterest(){
    return 64;
}
function BitsChunk(){
    return 8 * 12;
}