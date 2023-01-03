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
template Min(bits){
    signal input in[2];
    signal slt <== LessThan(bits)(in);
    signal output out <== (in[0] - in[1]) * slt + in[1];
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

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    

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

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    

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

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    

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

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
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

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], orderRootFlow[0]);
    ImplyEq()(enabled, r_orderRootFlow[0][1], orderRootFlow[1]);
    ImplyEq()(enabled, r_orderLeafId[0], reqData[ReqIdxArg(4)]);

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
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + r_oriOrderLeaf[0][OLIdxAmount()]); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()] - r_oriOrderLeaf[0][OLIdxAmount()]);
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

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];

    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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
    ImplyEq()(enabled, LessThan(BitsAmount())(
        [reqData[ReqIdxAmount()] + (1 << (BitsAmount() - 1)), 
        r_oriTokenLeaf[0][TLIdxAvlAmt()] + (1 << (BitsAmount() - 1))]
    ), 1); 
    
    /* correctness */
    for(var i = 0; i < LenOfRequest(); i++)
        ImplyEq()(enabled, r_newOrderLeaf[0][i], reqData[i]);
    ImplyEq()(enabled, r_newOrderLeaf[0][OLIdxTxId()], txId);
    ImplyEq()(enabled, r_newOrderLeaf[0][OLIdxAccumulatedBuyAmt()]  , 0);
    ImplyEq()(enabled, r_newOrderLeaf[0][OLIdxAccumulatedSellAmt()] , 0);

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
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], orderRootFlow[0]);
    ImplyEq()(enabled, r_orderRootFlow[0][1], orderRootFlow[1]);
    ImplyEq()(enabled, r_orderLeafId[0], reqData[ReqIdxArg(4)]);

    ImplyEq()(enabled, accountRootFlow[0], accountRootFlow[1]);

    /* legality */
    
    /* correctness */
    for(var i = 0; i < LenOfOL(); i++)
        ImplyEq()(enabled, r_newOrderLeaf[0][i], 0);

    /* channel out */
    for(var i = 0; i < LenOfOL(); i++)
        channelOut[i] <== r_oriOrderLeaf[0][i];
    channelOut[LenOfOL() + 0] <== r_oriOrderLeaf[0][LenOfRequest() + 1];
    channelOut[LenOfOL() + 1] <== r_oriOrderLeaf[0][LenOfRequest() + 2];

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

    /*
        pseudo code:
            INPUT maker, taker
            makerRemainSellAmt := maker.sellAmt - maker.accumulatedSellAmt;
            takerRemainSellAmt := taker.sellAmt - taker.accumulatedSellAmt;

            supMakerBuyAmt := makerRemainSellAmt * maker.buyAmt / maker.sellAmt;
            supTakerBuyAmt := takerRemainSellAmt * maker.sellAmt / maker.buyAmt;
            
            isMatched := maker.sellAmt * taker.sellAmt >= maker.buyAmt * taker.buyAmt;

            matchedSellAmt := Min(makerRemainSellAmt, supTakerBuyAmt);
            matchedBuyAmt  := Min(takerRemainSellAmt, supMakerBuyAmt);
    */

    var makerSellAmt = r_oriOrderLeaf[0][OLIdxAmount()];
    var makerBuyAmt  = r_oriOrderLeaf[0][OLIdxArg(3)];
    var takerSellAmt = channelIn[OLIdxAmount()];
    var takerBuyAmt  = channelIn[OLIdxArg(3)];
    var makerRemainSellAmt = makerSellAmt - r_oriOrderLeaf[0][OLIdxAccumulatedSellAmt()];
    var takerRemainSellAmt = channelIn[OLIdxAmount()] - channelIn[OLIdxAccumulatedSellAmt()];

    signal supMakerBuyAmt;
    (supMakerBuyAmt, _) <== IntDivide(BitsAmount())(makerRemainSellAmt * makerBuyAmt, (makerSellAmt - 1) * enabled + 1);
    signal supTakerBuyAmt;
    (supTakerBuyAmt, _) <== IntDivide(BitsAmount())(takerRemainSellAmt * makerSellAmt, (makerBuyAmt - 1) * enabled + 1);
    signal isMatched <== GreaterEqThan(BitsAmount() * 2)([makerSellAmt * takerSellAmt, makerBuyAmt * takerBuyAmt]);

    signal matchedSellAmt <== Min(BitsAmount())([makerRemainSellAmt, supTakerBuyAmt]);
    signal matchedBuyAmt  <== Min(BitsAmount())([takerRemainSellAmt, supMakerBuyAmt]);

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], orderRootFlow[0]);
    ImplyEq()(enabled, r_orderRootFlow[0][1], orderRootFlow[1]);
    ImplyEq()(enabled, r_orderLeafId[0], reqData[ReqIdxArg(4)]);

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
    ImplyEq()(enabled, 1, isMatched);

    /* correctness */
        //to-do: remove order if cumSellAmt == sellAmt;
    signal isEqual <== IsEqual()([makerSellAmt, r_oriOrderLeaf[0][OLIdxAccumulatedSellAmt()] + matchedSellAmt]);
    for(var i = 0; i < LenOfRequest(); i++)
        ImplyEq()(enabled, r_newOrderLeaf[0][i], (1 - isEqual) * r_oriOrderLeaf[0][i]);
    ImplyEq()(enabled, r_newOrderLeaf[0][OLIdxTxId()], (1 - isEqual) * r_oriOrderLeaf[0][OLIdxTxId()]);
    ImplyEq()(enabled, r_newOrderLeaf[0][OLIdxAccumulatedSellAmt()], (1 - isEqual) * (r_oriOrderLeaf[0][OLIdxAccumulatedSellAmt()] + matchedSellAmt));
    ImplyEq()(enabled, r_newOrderLeaf[0][OLIdxAccumulatedBuyAmt() ], (1 - isEqual) * (r_oriOrderLeaf[0][OLIdxAccumulatedBuyAmt() ] + matchedBuyAmt ));
    
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + matchedBuyAmt); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxAvlAmt()], r_oriTokenLeaf[1][TLIdxAvlAmt()]); 
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxLockedAmt()], r_oriTokenLeaf[1][TLIdxLockedAmt()] - matchedSellAmt);
    
    /* channel out */
    for(var i = 0; i < LenOfRequest(); i++)
        channelOut[i] <== channelIn[i];
    channelOut[OLIdxTxId()] <== channelIn[OLIdxTxId()];
    channelOut[OLIdxAccumulatedSellAmt()] <== channelIn[OLIdxAccumulatedSellAmt()] + matchedBuyAmt;
    channelOut[OLIdxAccumulatedBuyAmt()]  <== channelIn[OLIdxAccumulatedBuyAmt() ] + makerSellAmt;
    channelOut[LenOfOL() + 0] <== channelIn[LenOfOL() + 0];
    channelOut[LenOfOL() + 1] <== channelIn[LenOfOL() + 1];

    /* response */
    resData <== [txId - r_oriOrderLeaf[0][OLIdxTxId()], makerBuyAmt];
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

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()];

    signal matchedSellAmt <== channelIn[OLIdxAccumulatedSellAmt()] - channelIn[LenOfOL() + 0];
    signal matchedBuyAmt  <== channelIn[OLIdxAccumulatedBuyAmt()]  - channelIn[LenOfOL() + 1];
    
    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], orderRootFlow[0]);
    ImplyEq()(enabled, r_orderRootFlow[0][1], orderRootFlow[1]);
    ImplyEq()(enabled, r_orderLeafId[0], reqData[ReqIdxArg(4)]);

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
    signal isEqual <== IsEqual()([channelIn[OLIdxAmount()], channelIn[OLIdxAccumulatedSellAmt()]]);
    for(var i = 0; i < LenOfOL(); i++)
        ImplyEq()(enabled, r_newOrderLeaf[0][i], channelIn[i] * (1 - isEqual));

    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    // get avl amt first
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + matchedBuyAmt); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxAvlAmt()], r_oriTokenLeaf[1][TLIdxAvlAmt()]); 
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxLockedAmt()], r_oriTokenLeaf[1][TLIdxLockedAmt()] - matchedSellAmt);

    /* response */
    resData <== [0, 0];
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
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, orderRootFlow[0], orderRootFlow[1]);
    ImplyEq()(enabled, accountRootFlow[0], accountRootFlow[1]);
    
    /* channel out */
    for(var i = 0; i < LenOfRequest(); i++)
        channelOut[i] <== reqData[i];
    channelOut[OLIdxTxId()] <== txId;
    channelOut[OLIdxAccumulatedSellAmt()] <== 0;
    channelOut[OLIdxAccumulatedBuyAmt()]  <== 0;
    channelOut[LenOfOL() + 0] <== 0;
    channelOut[LenOfOL() + 1] <== 0;
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

    var makerSellAmt = r_oriOrderLeaf[0][OLIdxAmount()];
    var makerBuyAmt  = r_oriOrderLeaf[0][OLIdxArg(3)];
    var takerSellAmt = channelIn[OLIdxAmount()];
    var takerBuyAmt  = channelIn[OLIdxArg(3)];
    var makerRemainSellAmt = makerSellAmt - r_oriOrderLeaf[0][OLIdxAccumulatedSellAmt()];
    var takerRemainSellAmt = channelIn[OLIdxAmount()] - channelIn[OLIdxAccumulatedSellAmt()];

    signal supMakerBuyAmt;
    (supMakerBuyAmt, _) <== IntDivide(BitsAmount())(makerRemainSellAmt * makerBuyAmt, (makerSellAmt - 1) * enabled + 1);
    signal supTakerBuyAmt;
    (supTakerBuyAmt, _) <== IntDivide(BitsAmount())(takerRemainSellAmt * makerSellAmt, (makerBuyAmt - 1) * enabled + 1);
    
    signal matchedSellAmt <== Min(BitsAmount())([makerRemainSellAmt, supTakerBuyAmt]); //maker 
    signal matchedBuyAmt  <== Min(BitsAmount())([takerRemainSellAmt, supMakerBuyAmt]); //maker

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], orderRootFlow[0]);
    ImplyEq()(enabled, r_orderRootFlow[0][1], orderRootFlow[1]);
    ImplyEq()(enabled, r_orderLeafId[0], reqData[ReqIdxArg(4)]);

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

    /* correctness */
        //to-do: remove order if cumSellAmt == sellAmt;
    signal isEqual <== IsEqual()([makerSellAmt, r_oriOrderLeaf[0][OLIdxAccumulatedSellAmt()] + matchedSellAmt]);
    for(var i = 0; i < LenOfRequest(); i++)
        ImplyEq()(enabled, r_newOrderLeaf[0][i], isEqual * r_oriOrderLeaf[0][i]);
    ImplyEq()(enabled, r_newOrderLeaf[0][OLIdxTxId()], isEqual * r_oriOrderLeaf[0][OLIdxTxId()]);
    ImplyEq()(enabled, r_newOrderLeaf[0][OLIdxAccumulatedSellAmt()], isEqual * r_oriOrderLeaf[0][OLIdxAccumulatedSellAmt()] + matchedSellAmt);
    ImplyEq()(enabled, r_newOrderLeaf[0][OLIdxAccumulatedBuyAmt() ], isEqual * r_oriOrderLeaf[0][OLIdxAccumulatedBuyAmt() ] + matchedBuyAmt );
    
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + matchedBuyAmt); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxAvlAmt()], r_oriTokenLeaf[1][TLIdxAvlAmt()]); 
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxLockedAmt()], r_oriTokenLeaf[1][TLIdxLockedAmt()] - matchedSellAmt);
    
    /* channel out */
    for(var i = 0; i < LenOfRequest(); i++)
        channelOut[i] <== channelIn[i];
    channelOut[OLIdxTxId()] <== channelIn[OLIdxTxId()];
    channelOut[OLIdxAccumulatedSellAmt()] <== channelIn[OLIdxAccumulatedSellAmt()] + matchedBuyAmt;
    channelOut[OLIdxAccumulatedBuyAmt()]  <== channelIn[OLIdxAccumulatedBuyAmt() ] + makerSellAmt;
    channelOut[LenOfOL() + 0] <== channelIn[LenOfOL() + 0];
    channelOut[LenOfOL() + 1] <== channelIn[LenOfOL() + 1];

    /* response */
    resData <== [txId - r_oriOrderLeaf[0][OLIdxTxId()], makerBuyAmt];
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

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()];

    signal matchedSellAmt <== channelIn[OLIdxAccumulatedSellAmt()] - channelIn[LenOfOL() + 0];
    signal matchedBuyAmt  <== channelIn[OLIdxAccumulatedBuyAmt()]  - channelIn[LenOfOL() + 1];
    
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
    resData <== [0, 0];
}