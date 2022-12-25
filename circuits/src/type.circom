pragma circom 2.0.2;
/*
*   "OL" means: OrderLeaf;
*   "AL" means: AccountLeaf;
*   "TL" means: TokenLeaf;
*   "NL" means: NullifierLeaf;
*/
/* Request */
function LenOfRequest(){
    return 11;
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
    return 13;
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
function ReqTypeNumTransfer(){
    return 3;
}
function ReqTypeNumWithdraw(){
    return 4;
}
function ReqTypeNumSecondLimitOrder(){
    return 5;
}
function ReqTypeNumSecondLimitStart(){
    return 6;
}
function ReqTypeNumSecondLimitExchange(){
    return 7;
}
function ReqTypeNumSecondLimitEnd(){
    return 8;
}
function ReqTypeNumSecondMarketOrder(){
    return 9;
}
function ReqTypeNumSecondMarketExchange(){
    return 10;
}
function ReqTypeNumSecondMarketEnd(){
    return 11;
}
function ReqTypeNumCancel(){
    return 12;
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
function BitsAmount(){
    return 128;
}
function BitsTime(){
    return 64;
}
function BitsInterest(){
    return 64;
}
function BitsChunk(){
    return 8 * 12;
}


function InterestLimit(){
    return 1 << BitsInterest() - 1;
}