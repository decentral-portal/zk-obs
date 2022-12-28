pragma circom 2.1.2;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/multiplexer.circom";
include "../../node_modules/circomlib/circuits/gates.circom";

template ImplyEq(){
    /* verify: (if "enabled", then in_0 == in_1) */
    signal input enabled;
    signal input in_0;
    signal input in_1;
    (enabled) * (1 - enabled) === 0;
    in_0 === (in_1 - in_0) * enabled + in_0;
}
template IntDivide(bits_divisor){
    signal input dividend;
    signal input divisor;
    signal output quotient;
    signal output remainder;
    (quotient, remainder) <-- (dividend \ divisor, dividend % divisor);
    quotient * divisor + remainder === dividend;
    signal slt <== LessThan(bits_divisor)([remainder, divisor]);
    slt === 1;
    signal n2b[253 - bits_divisor] <== Num2Bits(253 - bits_divisor)(quotient);
}
template CalcSupAmt(){
    /* calc the supremum of sellAmt, buyAmt */
    signal input sellAmt;
    signal input sellPrice;
    signal input buyPrice;
    signal output supBuyAmt; 
    (supBuyAmt, _) <== IntDivide(BitsAmount())(sellAmt * sellPrice, buyPrice);
}
template TsPubKey2TsAddr(){
    signal input in[2];
    signal temp <== Poseidon(2)(in);
    signal n2B[254] <== Num2Bits_strict()(temp);
    var t[160];
    for(var i = 0; i < 160; i++)
        t[i] = n2B[i];

    signal output out <== Bits2Num(160)(t);
}
template DoReqUnknow(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];

    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;

    signal input r_orderLeafId[MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[MaxOrderUnitsPerReq()][2];

    signal input r_accountLeafId[MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[MaxAccUnitsPerReq()][2];

    signal input r_tokenLeafId[MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[MaxTokenUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, orderRootFlow[0], orderRootFlow[1]);
    ImplyEq()(enabled, accountRootFlow[0], accountRootFlow[1]);
}
template DoReqRegister(){
    /* reqData[ReqIdxArg(1)] := tsAddr */
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;

    signal input r_orderLeafId[MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[MaxOrderUnitsPerReq()][2];

    signal input r_accountLeafId[MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[MaxAccUnitsPerReq()][2];

    signal input r_tokenLeafId[MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[MaxTokenUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, orderRootFlow[0], orderRootFlow[1]);

    ImplyEq()(enabled, r_accountRootFlow[0][0], accountRootFlow[0]);
    ImplyEq()(enabled, r_accountRootFlow[0][1], accountRootFlow[1]);
    ImplyEq()(enabled, r_accountLeafId[0], reqData[ReqIdxArg(0)]);

    ImplyEq()(enabled, r_tokenRootFlow[0][0], r_oriAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenRootFlow[0][1], r_newAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenLeafId[0], reqData[ReqIdxL2TokenAddr()]);

    /* legality */
    //Verified by contract. !!

    /* correctness */
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], reqData[ReqIdxArg(1)]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + reqData[ReqIdxAmount()]); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
}
template DoReqDeposit(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;

    signal input r_orderLeafId[MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[MaxOrderUnitsPerReq()][2];

    signal input r_accountLeafId[MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[MaxAccUnitsPerReq()][2];

    signal input r_tokenLeafId[MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[MaxTokenUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, orderRootFlow[0], orderRootFlow[1]);

    ImplyEq()(enabled, r_accountRootFlow[0][0], accountRootFlow[0]);
    ImplyEq()(enabled, r_accountRootFlow[0][1], accountRootFlow[1]);
    ImplyEq()(enabled, r_accountLeafId[0], reqData[ReqIdxArg(0)]);

    ImplyEq()(enabled, r_tokenRootFlow[0][0], r_oriAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenRootFlow[0][1], r_newAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenLeafId[0], reqData[ReqIdxL2TokenAddr()]);

    /* legality */
    //Verified by contract. !!

    /* correctness */
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + reqData[ReqIdxAmount()]); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
}
template DoReqWithdraw(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;

    signal input r_orderLeafId[MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[MaxOrderUnitsPerReq()][2];

    signal input r_accountLeafId[MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[MaxAccUnitsPerReq()][2];

    signal input r_tokenLeafId[MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[MaxTokenUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, orderRootFlow[0], orderRootFlow[1]);

    ImplyEq()(enabled, r_accountRootFlow[0][0], accountRootFlow[0]);
    ImplyEq()(enabled, r_accountRootFlow[0][1], accountRootFlow[1]);
    ImplyEq()(enabled, r_accountLeafId[0], reqData[ReqIdxL2AddrSigner()]);

    ImplyEq()(enabled, r_tokenRootFlow[0][0], r_oriAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenRootFlow[0][1], r_newAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenLeafId[0], reqData[ReqIdxL2TokenAddr()]);

    /* legality */
    ImplyEq()(enabled, r_oriAccountLeaf[0][ALIdxTsAddr()], TsPubKey2TsAddr()(tsPubKey));
    ImplyEq()(enabled, r_oriAccountLeaf[0][ALIdxNonce()], reqData[ReqIdxNonce()]);
    ImplyEq()(enabled, LessThan(BitsAmount())([reqData[ReqIdxAmount()] + (1 << (BitsAmount() - 1)), r_oriTokenLeaf[0][TLIdxAvlAmt()] + (1 << (BitsAmount() - 1))]), 1); 

    /* correctness */
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()] + 1);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] - reqData[ReqIdxAmount()]); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
}
template DoReqCancel(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;

    signal input r_orderLeafId[MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[MaxOrderUnitsPerReq()][2];

    signal input r_accountLeafId[MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[MaxAccUnitsPerReq()][2];

    signal input r_tokenLeafId[MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[MaxTokenUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], orderRootFlow[0]);
    ImplyEq()(enabled, r_orderRootFlow[0][1], orderRootFlow[1]);
    ImplyEq()(enabled, r_orderLeafId[0], reqData[ReqIdxArg(1)]);

    ImplyEq()(enabled, r_accountRootFlow[0][0], accountRootFlow[0]);
    ImplyEq()(enabled, r_accountRootFlow[0][1], accountRootFlow[1]);
    ImplyEq()(enabled, r_accountLeafId[0], r_oriOrderLeaf[0][OLIdxL2AddrSigner()]);

    ImplyEq()(enabled, r_tokenRootFlow[0][0], r_oriAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenRootFlow[0][1], r_newAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenLeafId[0], r_oriOrderLeaf[0][OLIdxL2TokenAddr()]);

    /* legality */
    
    /* correctness */
    for(var i = 0; i < LenOfOL(); i++)
        ImplyEq()(enabled, r_newOrderLeaf[0][i], 0);

    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + reqData[ReqIdxAmount()]); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()] - reqData[ReqIdxAmount()]);
}
template DoReqSecondLimitOrder(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;

    signal input r_orderLeafId[MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[MaxOrderUnitsPerReq()][2];

    signal input r_accountLeafId[MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[MaxAccUnitsPerReq()][2];

    signal input r_tokenLeafId[MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[MaxTokenUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    signal leafId;
    (_, leafId) <== IntDivide(25)(digest, (1 << NullifierTreeHeight())); 

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], orderRootFlow[0]);
    ImplyEq()(enabled, r_orderRootFlow[0][1], orderRootFlow[1]);

    ImplyEq()(enabled, r_accountRootFlow[0][0], accountRootFlow[0]);
    ImplyEq()(enabled, r_accountRootFlow[0][1], accountRootFlow[1]);
    ImplyEq()(enabled, r_accountLeafId[0], reqData[ReqIdxL2AddrSigner()]);

    ImplyEq()(enabled, r_tokenRootFlow[0][0], r_oriAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenRootFlow[0][1], r_newAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenLeafId[0], reqData[ReqIdxL2TokenAddr()]);

    /* legality */
    ImplyEq()(enabled, r_oriAccountLeaf[0][ALIdxTsAddr()], TsPubKey2TsAddr()(tsPubKey));
    ImplyEq()(enabled, r_oriOrderLeaf[0][OLIdxReqType()], ReqTypeNumUnknow());
    ImplyEq()(enabled, r_oriAccountLeaf[0][ALIdxNonce()], reqData[ReqIdxNonce()] + 1);
    ImplyEq()(enabled, LessThan(BitsAmount())([reqData[ReqIdxAmount()] + (1 << (BitsAmount() - 1)), r_oriTokenLeaf[0][TLIdxAvlAmt()] + (1 << (BitsAmount() - 1))]), 1); 
    
    /* correctness */
    for(var i = 0; i < LenOfRequest(); i++)
        ImplyEq()(enabled, r_newOrderLeaf[0][i], reqData[i]);
    ImplyEq()(enabled, r_newOrderLeaf[0][LenOfRequest()], txId);

    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()] + 1);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] - reqData[ReqIdxAmount()]); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()] + reqData[ReqIdxAmount()]); 

}
template DoReqSecondLimitStart(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;

    signal input r_orderLeafId[MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[MaxOrderUnitsPerReq()][2];

    signal input r_accountLeafId[MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[MaxAccUnitsPerReq()][2];

    signal input r_tokenLeafId[MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[MaxTokenUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()];
    signal output resData[LenOfResponse()];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], orderRootFlow[0]);
    ImplyEq()(enabled, r_orderRootFlow[0][1], orderRootFlow[1]);
    ImplyEq()(enabled, r_orderLeafId[0], reqData[ReqIdxArg(1)]);

    ImplyEq()(enabled, accountRootFlow[0], accountRootFlow[1]);

    /* legality */
    
    /* correctness */
    for(var i = 0; i < LenOfOL(); i++)
        ImplyEq()(enabled, r_newOrderLeaf[0][i], 0);

    /* channel out */
    for(var i = 0; i < LenOfRequest(); i++)
        channelOut[i] <== r_oriOrderLeaf[0][i];
    for(var i = LenOfRequest(); i < LenOfChannel(); i++)
        channelOut[i] <== 0;

    /* response */    
    resData <== [r_oriOrderLeaf[0][LenOfRequest()], 0];
}
template DoReqSecondLimitExchange(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;

    signal input r_orderLeafId[MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[MaxOrderUnitsPerReq()][2];

    signal input r_accountLeafId[MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[MaxAccUnitsPerReq()][2];

    signal input r_tokenLeafId[MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[MaxTokenUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()];
    signal output resData[LenOfResponse()];
    signal supBuyAmtTaker, newSupBuyAmtTaker;

    var makerSellAmt = r_oriOrderLeaf[0][ReqIdxAmount()];
    var supBuyAmtMaker = r_oriOrderLeaf[0][ReqIdxArg(3)];
    var takerSellAmt = channelIn[ReqIdxAmount()];
    (supBuyAmtTaker, _) <== IntDivide(BitsAmount())(takerSellAmt * makerSellAmt, supBuyAmtMaker);

    signal temp[2] <== [channelIn[ReqIdxAmount()] * r_oriOrderLeaf[0][ReqIdxAmount()], channelIn[ReqIdxArg(3)] * r_oriOrderLeaf[0][ReqIdxArg(3)]];
    signal isMatched <== GreaterEqThan(BitsAmount())([temp[1] * enabled, temp[0] * enabled]);
    signal matchedBuyAmt, matchedSellAmt;

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], orderRootFlow[0]);
    ImplyEq()(enabled, r_orderRootFlow[0][1], orderRootFlow[1]);
    ImplyEq()(enabled, r_orderLeafId[0], reqData[ReqIdxArg(1)]);

    ImplyEq()(enabled, r_accountRootFlow[0][0], accountRootFlow[0]);
    ImplyEq()(enabled, r_accountRootFlow[0][1], accountRootFlow[1]);
    ImplyEq()(enabled, r_accountLeafId[0], r_oriOrderLeaf[0][OLIdxL2AddrSigner()]);

    ImplyEq()(enabled, r_tokenRootFlow[0][0], r_oriAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenRootFlow[0][1], r_tokenRootFlow[1][0]);
    ImplyEq()(enabled, r_tokenRootFlow[1][1], r_newAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenLeafId[0], r_oriOrderLeaf[0][OLIdxArg(3)]);
    ImplyEq()(enabled, r_tokenLeafId[1], r_oriOrderLeaf[0][OLIdxL2TokenAddr()]);

    /* legality */
    ImplyEq()(enabled, channelIn[ReqIdxReqType()], ReqTypeNumSecondLimitOrder());
    ImplyEq()(enabled, channelIn[ReqIdxL2TokenAddr()], r_oriOrderLeaf[0][ReqIdxArg(3)]);
    ImplyEq()(enabled, channelIn[ReqIdxArg(3)], r_oriOrderLeaf[0][ReqIdxL2TokenAddr()]);

    ImplyEq()(enabled, r_oriOrderLeaf[0][ReqIdxReqType()], ReqTypeNumSecondLimitOrder());
    ImplyEq()(enabled, 1, isMatched);

    /* correctness */
    matchedSellAmt <== Mux(2)([makerSellAmt, supBuyAmtTaker], LessThan(BitsAmount())([makerSellAmt * enabled, supBuyAmtTaker * enabled]));
    matchedBuyAmt  <== Mux(2)([supBuyAmtMaker, takerSellAmt], LessThan(BitsAmount())([makerSellAmt * enabled, supBuyAmtTaker * enabled]));
    for(var i = 0; i < LenOfOL(); i++){
        if(i == OLIdxAmount())
            ImplyEq()(enabled, r_newOrderLeaf[0][i], makerSellAmt - matchedSellAmt);
        else if(i == OLIdxArg(3))
            ImplyEq()(enabled, r_newOrderLeaf[0][i], supBuyAmtMaker - matchedBuyAmt);
        else
            ImplyEq()(enabled, r_newOrderLeaf[0][i], r_oriOrderLeaf[0][i]);
    }
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + matchedBuyAmt); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxAvlAmt()], r_oriTokenLeaf[1][TLIdxAvlAmt()]); 
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxLockedAmt()], r_oriTokenLeaf[1][TLIdxLockedAmt()] - matchedSellAmt);
    
    /* channel out */
    for(var i = 0; i < LenOfRequest(); i++){
        if(i == OLIdxAmount())
            channelOut[i] <== takerSellAmt - matchedBuyAmt;
        else if(i == OLIdxArg(3)){
            (newSupBuyAmtTaker, _) <== IntDivide(BitsAmount())(channelOut[OLIdxAmount()] * channelIn[ReqIdxArg(3)], takerSellAmt);
            channelOut[i] <== supBuyAmtMaker + matchedSellAmt;
        }
        else
            channelOut[i] <== r_oriOrderLeaf[0][i];
    }
    channelOut[LenOfRequest()] <== channelIn[LenOfRequest()] + matchedSellAmt;
    for(var i = LenOfRequest() + 1; i < LenOfChannel(); i++)
        channelOut[i] <== 0;

    /* response */
    resData <== [txId - r_oriOrderLeaf[0][LenOfRequest()], supBuyAmtMaker];
}
template DoReqSecondLimitEnd(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;

    signal input r_orderLeafId[MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[MaxOrderUnitsPerReq()][2];

    signal input r_accountLeafId[MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[MaxAccUnitsPerReq()][2];

    signal input r_tokenLeafId[MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[MaxTokenUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()];

    signal matchedSellAmt <== r_oriOrderLeaf[0][OLIdxAmount()] - channelIn[ReqIdxAmount()];
    signal matchedBuyAmt <== r_oriOrderLeaf[0][LenOfRequest()];
    
    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], orderRootFlow[0]);
    ImplyEq()(enabled, r_orderRootFlow[0][1], orderRootFlow[1]);
    ImplyEq()(enabled, r_orderLeafId[0], reqData[ReqIdxArg(1)]);

    ImplyEq()(enabled, r_accountRootFlow[0][0], accountRootFlow[0]);
    ImplyEq()(enabled, r_accountRootFlow[0][1], accountRootFlow[1]);
    ImplyEq()(enabled, r_accountLeafId[0], r_oriOrderLeaf[0][OLIdxL2AddrSigner()]);

    ImplyEq()(enabled, r_tokenRootFlow[0][0], r_oriAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenRootFlow[0][1], r_tokenRootFlow[1][0]);
    ImplyEq()(enabled, r_tokenRootFlow[1][1], r_newAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenLeafId[0], r_oriOrderLeaf[0][OLIdxL2TokenAddr()]);
    ImplyEq()(enabled, r_tokenLeafId[1], r_oriOrderLeaf[0][OLIdxArg(3)]);

    /* legality */
    ImplyEq()(enabled, channelIn[ReqIdxReqType()], ReqTypeNumSecondLimitOrder());
    for(var i = 0; i < LenOfOL(); i++)
        ImplyEq()(enabled, r_oriOrderLeaf[0][i], 0);
    
    /* correctness */
    for(var i = 0; i < LenOfOL(); i++)
        ImplyEq()(enabled, r_newOrderLeaf[0][i], channelIn[i]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + matchedBuyAmt); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxAvlAmt()], r_oriTokenLeaf[1][TLIdxAvlAmt()]); 
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxLockedAmt()], r_oriTokenLeaf[1][TLIdxLockedAmt()] - matchedSellAmt);

    /* response */
    resData <== [matchedSellAmt, matchedBuyAmt];
}
template DoReqSecondMarketOrder(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];

    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;

    signal input r_orderLeafId[MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[MaxOrderUnitsPerReq()][2];

    signal input r_accountLeafId[MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[MaxAccUnitsPerReq()][2];

    signal input r_tokenLeafId[MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[MaxTokenUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, orderRootFlow[0], orderRootFlow[1]);
    ImplyEq()(enabled, accountRootFlow[0], accountRootFlow[1]);
    
    /* channel out */
    for(var i = 0; i < LenOfRequest(); i++)
        channelOut[i] <== r_oriOrderLeaf[0][i];
    for(var i = LenOfRequest(); i < LenOfChannel(); i++)
        channelOut[i] <== 0;
}
template DoReqSecondMarketExchange(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;

    signal input r_orderLeafId[MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[MaxOrderUnitsPerReq()][2];

    signal input r_accountLeafId[MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[MaxAccUnitsPerReq()][2];

    signal input r_tokenLeafId[MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[MaxTokenUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()];
    signal output resData[LenOfResponse()];
    signal supBuyAmtTaker;

    var makerSellAmt = r_oriOrderLeaf[0][ReqIdxAmount()];
    var supBuyAmtMaker = r_oriOrderLeaf[0][ReqIdxArg(3)];
    var takerSellAmt = channelIn[ReqIdxAmount()];
    (supBuyAmtTaker, _) <== IntDivide(BitsAmount())(takerSellAmt * makerSellAmt, supBuyAmtMaker);

    signal matchedBuyAmt, matchedSellAmt;

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], orderRootFlow[0]);
    ImplyEq()(enabled, r_orderRootFlow[0][1], orderRootFlow[1]);
    ImplyEq()(enabled, r_orderLeafId[0], reqData[ReqIdxArg(1)]);

    ImplyEq()(enabled, r_accountRootFlow[0][0], accountRootFlow[0]);
    ImplyEq()(enabled, r_accountRootFlow[0][1], accountRootFlow[1]);
    ImplyEq()(enabled, r_accountLeafId[0], r_oriOrderLeaf[0][OLIdxL2AddrSigner()]);

    ImplyEq()(enabled, r_tokenRootFlow[0][0], r_oriAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenRootFlow[0][1], r_tokenRootFlow[1][0]);
    ImplyEq()(enabled, r_tokenRootFlow[1][1], r_newAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenLeafId[0], r_oriOrderLeaf[0][OLIdxArg(3)]);
    ImplyEq()(enabled, r_tokenLeafId[1], r_oriOrderLeaf[0][OLIdxL2TokenAddr()]);

    /* legality */
    ImplyEq()(enabled, channelIn[ReqIdxReqType()], ReqTypeNumSecondMarketOrder());
    ImplyEq()(enabled, channelIn[ReqIdxL2TokenAddr()], r_oriOrderLeaf[0][ReqIdxArg(3)]);
    ImplyEq()(enabled, channelIn[ReqIdxArg(3)], r_oriOrderLeaf[0][ReqIdxL2TokenAddr()]);

    ImplyEq()(enabled, r_oriOrderLeaf[0][ReqIdxReqType()], ReqTypeNumSecondLimitOrder());

    /* correctness */
    matchedSellAmt <== Mux(2)([makerSellAmt, supBuyAmtTaker], LessThan(BitsAmount())([makerSellAmt * enabled, supBuyAmtTaker * enabled]));
    matchedBuyAmt  <== Mux(2)([supBuyAmtMaker, takerSellAmt], LessThan(BitsAmount())([makerSellAmt * enabled, supBuyAmtTaker * enabled]));
    for(var i = 0; i < LenOfOL(); i++){
        if(i == OLIdxAmount())
            ImplyEq()(enabled, r_newOrderLeaf[0][i], makerSellAmt - matchedSellAmt);
        else if(i == OLIdxArg(3))
            ImplyEq()(enabled, r_newOrderLeaf[0][i], supBuyAmtMaker - matchedBuyAmt);
        else
            ImplyEq()(enabled, r_newOrderLeaf[0][i], r_oriOrderLeaf[0][i]);
    }
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + matchedBuyAmt); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxAvlAmt()], r_oriTokenLeaf[1][TLIdxAvlAmt()]); 
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxLockedAmt()], r_oriTokenLeaf[1][TLIdxLockedAmt()] - matchedSellAmt);
    
    /* channel out */
    for(var i = 0; i < LenOfRequest(); i++){
        if(i == OLIdxAmount())
            channelOut[i] <== makerSellAmt - matchedBuyAmt;
        else if(i == OLIdxArg(3))
            channelOut[i] <== supBuyAmtMaker + matchedSellAmt;
        else
            channelOut[i] <== r_oriOrderLeaf[0][i];
    }
    channelOut[LenOfRequest()] <== channelIn[LenOfRequest()] + matchedSellAmt;
    for(var i = LenOfRequest() + 1; i < LenOfChannel(); i++)
        channelOut[i] <== 0;

    /* response */
    resData <== [txId - r_oriOrderLeaf[0][LenOfRequest()], supBuyAmtMaker];
}
template DoReqSecondMarketEnd(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;

    signal input r_orderLeafId[MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[MaxOrderUnitsPerReq()][2];

    signal input r_accountLeafId[MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[MaxAccUnitsPerReq()][2];

    signal input r_tokenLeafId[MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[MaxTokenUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()];

    signal matchedBuyAmt <== channelIn[LenOfRequest()];
    signal matchedSellAmt <== channelIn[LenOfRequest() + 1];
    
    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], r_orderRootFlow[0][1]);

    ImplyEq()(enabled, r_accountRootFlow[0][0], accountRootFlow[0]);
    ImplyEq()(enabled, r_accountRootFlow[0][1], accountRootFlow[1]);
    ImplyEq()(enabled, r_accountLeafId[0], r_oriOrderLeaf[0][OLIdxL2AddrSigner()]);

    ImplyEq()(enabled, r_tokenRootFlow[0][0], r_oriAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenRootFlow[0][1], r_tokenRootFlow[1][0]);
    ImplyEq()(enabled, r_tokenRootFlow[1][1], r_newAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenLeafId[0], r_oriOrderLeaf[0][OLIdxL2TokenAddr()]);
    ImplyEq()(enabled, r_tokenLeafId[1], r_oriOrderLeaf[0][OLIdxArg(3)]);

    /* legality */
    ImplyEq()(enabled, channelIn[ReqIdxReqType()], ReqTypeNumSecondMarketOrder());
    
    /* correctness */
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + matchedBuyAmt); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxAvlAmt()], r_oriTokenLeaf[1][TLIdxAvlAmt()]); 
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxLockedAmt()], r_oriTokenLeaf[1][TLIdxLockedAmt()] - matchedSellAmt);

    /* response */
    resData <== [matchedSellAmt, matchedBuyAmt];
}