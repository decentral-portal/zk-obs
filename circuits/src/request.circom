pragma circom 2.0.2;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/multiplexer.circom";
include "../../node_modules/circomlib/circuits/gates.circom";

template ImplyEq(){
    signal input enabled;
    signal input in_0;
    signal input in_1;
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
    /* calc the supremum of sailAmt, buyAmt */
    signal input sailAmt;
    signal input sailPrice;
    signal input buyPrice;
    signal output supBuyAmt; 
    (supBuyAmt, _) <== IntDivide(BitsAmount())(sailAmt * sailPrice, buyPrice);
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
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, orderRootFlow[0], orderRootFlow[1]);
    ImplyEq()(enabled, accountRootFlow[0], accountRootFlow[1]);
    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);
    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);
}
template DoReqSetEpoch(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;
    //to-do: increase epoch?
    // verify slt the other epoch
    // +=2

    /* conn to the units*/
    ImplyEq()(enabled, orderRootFlow[0], orderRootFlow[1]);
    ImplyEq()(enabled, accountRootFlow[0], accountRootFlow[1]);
    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);
    ImplyEq()(enabled * (1 - reqData[ReqIdxArg(0)]), epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled * (1 - reqData[ReqIdxArg(0)]), epochFlow[1][0], epochFlow[1][1]);
    ImplyEq()(enabled, Mux(2)([epochFlow[0][1], epochFlow[1][1]], reqData[ReqIdxArg(0)]), reqData[ReqIdxArg(1)]);
}
template DoReqRegister(){
    /* reqData[ReqIdxArg(1)] := tsAddr */
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    

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

    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);

    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);

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
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    

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

    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);
    
    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);

    /* legality */
    //Verified by contract. !!

    /* correctness */
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + reqData[ReqIdxAmount()]); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
}
template DoReqTransfer(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, orderRootFlow[0], orderRootFlow[1]);

    ImplyEq()(enabled, r_accountRootFlow[0][0], accountRootFlow[0]);
    ImplyEq()(enabled, r_accountRootFlow[0][1], r_accountRootFlow[1][0]);
    ImplyEq()(enabled, r_accountRootFlow[1][1], accountRootFlow[1]);

    ImplyEq()(enabled, r_accountLeafId[0], reqData[ReqIdxL2AddrSigner()]);
    ImplyEq()(enabled, r_accountLeafId[1], reqData[ReqIdxArg(0)]);

    ImplyEq()(enabled, r_tokenRootFlow[0][0], r_oriAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenRootFlow[0][1], r_newAccountLeaf[0][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenLeafId[0], reqData[ReqIdxL2TokenAddr()]);

    ImplyEq()(enabled, r_tokenRootFlow[1][0], r_oriAccountLeaf[1][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenRootFlow[1][1], r_newAccountLeaf[1][ALIdxTokenRoot()]);
    ImplyEq()(enabled, r_tokenLeafId[1], reqData[ReqIdxL2TokenAddr()]);

    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);
    
    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);

    /* legality */
    ImplyEq()(enabled, r_oriAccountLeaf[0][ALIdxTsAddr()], TsPubKey2TsAddr()(tsPubKey));
    ImplyEq()(enabled, r_oriAccountLeaf[0][ALIdxNonce()], reqData[ReqIdxNonce()]);
    ImplyEq()(enabled, LessThan(BitsAmount())([reqData[ReqIdxAmount()] + (1 << (BitsAmount() - 1)), r_oriTokenLeaf[0][TLIdxAvlAmt()] + (1 << (BitsAmount() - 1))]), 1);  

    /* correctness */
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()] + 1);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] - reqData[ReqIdxAmount()]); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
    
    ImplyEq()(enabled, r_newAccountLeaf[1][ALIdxTsAddr()], r_oriAccountLeaf[1][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[1][ALIdxNonce()], r_oriAccountLeaf[1][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxAvlAmt()], r_oriTokenLeaf[1][TLIdxAvlAmt()] + reqData[ReqIdxAmount()]); 
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxLockedAmt()], r_oriTokenLeaf[1][TLIdxLockedAmt()]);
}
template DoReqWithdraw(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
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

    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);
    
    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);

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
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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

    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);
    
    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);

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
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    signal leafId;
    (_, leafId) <== IntDivide(25)(digest, (1 << 24)); //!! nullifier tree height;
    signal epoch <== Mux(2)([epochFlow[0][0],epochFlow[1][0]], nullifierTreeId);

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

    ImplyEq()(enabled * (1 - nullifierTreeId), nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled * (1 - nullifierTreeId), nullifierRootFlow[1][0], nullifierRootFlow[1][1]);
    ImplyEq()(enabled, r_nullifierRootFlow[0][0], Mux(2)([nullifierRootFlow[0][0], nullifierRootFlow[1][0]], nullifierTreeId));
    ImplyEq()(enabled, r_nullifierRootFlow[0][1], Mux(2)([nullifierRootFlow[0][1], nullifierRootFlow[1][1]], nullifierTreeId));
    ImplyEq()(enabled, r_nullifierLeafId[0], leafId);
    
    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);

    /* legality */
    ImplyEq()(enabled, r_oriAccountLeaf[0][ALIdxTsAddr()], TsPubKey2TsAddr()(tsPubKey));
    ImplyEq()(enabled, r_oriOrderLeaf[0][OLIdxReqType()], ReqTypeNumUnknow());
    ImplyEq()(enabled, r_oriAccountLeaf[0][ALIdxNonce()], reqData[ReqIdxNonce()]);
    ImplyEq()(enabled, LessThan(BitsAmount())([reqData[ReqIdxAmount()] + (1 << (BitsAmount() - 1)), r_oriTokenLeaf[0][TLIdxAvlAmt()] + (1 << (BitsAmount() - 1))]), 1); 
    ImplyEq()(enabled, epoch, reqData[ReqIdxArg(5)]);
    for(var i = 0; i < LenOfNL(); i++)
        ImplyEq()(enabled, IsEqual()([r_oriNullifierLeaf[0][i], digest]), 0);
    ImplyEq()(enabled, Mux(LenOfNL())(r_oriNullifierLeaf[0], nullifierElemId), 0);

    /* correctness */
    for(var i = 0; i < LenOfRequest(); i++)
        ImplyEq()(enabled, r_newOrderLeaf[0][i], reqData[i]);
    ImplyEq()(enabled, r_newOrderLeaf[0][LenOfRequest()], txId);

    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()] + 1);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] - reqData[ReqIdxAmount()]); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()] + reqData[ReqIdxAmount()]); 

    for(var i = 0; i < LenOfNL(); i++)
        ImplyEq()(enabled, r_newNullifierLeaf[0][i], Mux(2)([r_oriNullifierLeaf[0][i], digest],IsEqual()([i, nullifierElemId])));
}
template DoReqSecondLimitStart(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, r_orderRootFlow[0][0], orderRootFlow[0]);
    ImplyEq()(enabled, r_orderRootFlow[0][1], orderRootFlow[1]);
    ImplyEq()(enabled, r_orderLeafId[0], reqData[ReqIdxArg(1)]);

    ImplyEq()(enabled, accountRootFlow[0], accountRootFlow[1]);

    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);

    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);

    /* legality */
    
    /* correctness */
    for(var i = 0; i < LenOfOL(); i++)
        ImplyEq()(enabled, r_newOrderLeaf[0][i], 0);

    /* channel out */
    for(var i = 0; i < LenOfRequest(); i++)
        channelOut[i] <== r_oriOrderLeaf[0][i];
    for(var i = LenOfRequest(); i < LenOfChannel(); i++)
        channelOut[i] <== 0;
}
template DoReqSecondLimitExchange(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()];
    signal output resData[LenOfResponse()];

    var takerSailAmt = r_oriOrderLeaf[0][ReqIdxAmount()];
    var makerSailAmt = channelIn[ReqIdxAmount()];

    signal temp[2] <== [r_oriOrderLeaf[0][ReqIdxArg(0)] * channelIn[ReqIdxArg(1)], channelIn[ReqIdxArg(0)] * r_oriOrderLeaf[0][ReqIdxArg(1)]];
    signal isMatched <== GreaterEqThan(BitsAmount())([temp[0] * enabled, temp[1] * enabled]);//to-do: bits
    signal supBuyAmtMaker, supBuyAmtTaker;
    signal matchedBuyAmt, matchedSailAmt;

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

    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);

    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);

    /* legality */
    ImplyEq()(enabled, channelIn[ReqIdxReqType()], ReqTypeNumSecondLimitOrder());
    ImplyEq()(enabled, channelIn[ReqIdxL2TokenAddr()], r_oriOrderLeaf[0][ReqIdxArg(3)]);
    ImplyEq()(enabled, channelIn[ReqIdxArg(3)], r_oriOrderLeaf[0][ReqIdxL2TokenAddr()]);

    ImplyEq()(enabled, r_oriOrderLeaf[0][ReqIdxReqType()], ReqTypeNumSecondLimitOrder());
    ImplyEq()(enabled, 1, isMatched);

    /* correctness */
    supBuyAmtTaker <== CalcSupAmt()(takerSailAmt * enabled, r_oriOrderLeaf[0][ReqIdxArg(0)] * enabled, r_oriOrderLeaf[0][ReqIdxArg(1)] * enabled);
    supBuyAmtMaker <== CalcSupAmt()(makerSailAmt * enabled, r_oriOrderLeaf[0][ReqIdxArg(1)] * enabled, r_oriOrderLeaf[0][ReqIdxArg(0)] * enabled);
    matchedSailAmt <== Mux(2)([makerSailAmt, supBuyAmtTaker], LessThan(BitsAmount())([makerSailAmt * enabled, supBuyAmtTaker * enabled]));
    matchedBuyAmt  <== Mux(2)([supBuyAmtMaker, takerSailAmt], LessThan(BitsAmount())([makerSailAmt * enabled, supBuyAmtTaker * enabled]));
    for(var i = 0; i < LenOfOL(); i++){
        if(i == OLIdxAmount())
            ImplyEq()(enabled, r_newOrderLeaf[0][i], Fix2Float()(takerSailAmt - matchedSailAmt));
        else
            ImplyEq()(enabled, r_newOrderLeaf[0][i], r_oriOrderLeaf[0][i]);
    }
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + matchedBuyAmt); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxAvlAmt()], r_oriTokenLeaf[1][TLIdxAvlAmt()]); 
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxLockedAmt()], r_oriTokenLeaf[1][TLIdxLockedAmt()] - matchedSailAmt);
    
    /* channel out */
    for(var i = 0; i < LenOfRequest(); i++){
        if(i == OLIdxAmount())
            channelOut[i] <== makerSailAmt - matchedBuyAmt;
        else
            channelOut[i] <== r_oriOrderLeaf[0][i];
    }
    channelOut[LenOfRequest()] <== channelIn[LenOfRequest()] + matchedSailAmt;
    for(var i = LenOfRequest() + 1; i < LenOfChannel(); i++)
        channelOut[i] <== 0;

    /* response */
    resData <== [matchedSailAmt, matchedBuyAmt];
}
template DoReqSecondLimitEnd(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()];

    signal matchedSailAmt <== r_oriOrderLeaf[0][OLIdxAmount()] - channelIn[ReqIdxAmount()];
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

    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);

    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);

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
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxLockedAmt()], r_oriTokenLeaf[1][TLIdxLockedAmt()] - matchedSailAmt);

    /* response */
    resData <== [matchedSailAmt, matchedBuyAmt];
}
template DoReqSecondMarketOrder(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];

    signal input orderRootFlow[2];
    signal input accountRootFlow[2];
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()];
    signal output resData[LenOfResponse()] <== [0, 0];
    channelIn === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    

    /* enabled be a boolean */
    enabled * (enabled - 1) === 0;

    /* conn to the units*/
    ImplyEq()(enabled, orderRootFlow[0], orderRootFlow[1]);
    ImplyEq()(enabled, accountRootFlow[0], accountRootFlow[1]);
    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);
    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);
    
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
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()];
    signal output resData[LenOfResponse()];

    var takerSailAmt = r_oriOrderLeaf[0][ReqIdxAmount()];
    var makerSailAmt = channelIn[ReqIdxAmount()];

    signal temp[2] <== [r_oriOrderLeaf[0][ReqIdxArg(0)] * channelIn[ReqIdxArg(1)], channelIn[ReqIdxArg(0)] * r_oriOrderLeaf[0][ReqIdxArg(1)]];
    signal isMatched <== GreaterEqThan(BitsAmount())([temp[0] * enabled, temp[1] * enabled]);//to-do: bits
    signal supBuyAmtMaker, supBuyAmtTaker;
    signal matchedBuyAmt, matchedSailAmt;

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

    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);

    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);

    /* legality */
    ImplyEq()(enabled, channelIn[ReqIdxReqType()], ReqTypeNumSecondMarketOrder());
    ImplyEq()(enabled, channelIn[ReqIdxL2TokenAddr()], r_oriOrderLeaf[0][ReqIdxArg(3)]);
    ImplyEq()(enabled, channelIn[ReqIdxArg(3)], r_oriOrderLeaf[0][ReqIdxL2TokenAddr()]);

    ImplyEq()(enabled, r_oriOrderLeaf[0][ReqIdxReqType()], ReqTypeNumSecondMarketOrder());

    /* correctness */
    supBuyAmtTaker <== CalcSupAmt()(takerSailAmt * enabled, r_oriOrderLeaf[0][ReqIdxArg(0)] * enabled, r_oriOrderLeaf[0][ReqIdxArg(1)] * enabled);
    supBuyAmtMaker <== CalcSupAmt()(makerSailAmt * enabled, r_oriOrderLeaf[0][ReqIdxArg(1)] * enabled, r_oriOrderLeaf[0][ReqIdxArg(0)] * enabled);
    matchedSailAmt <== Mux(2)([makerSailAmt, supBuyAmtTaker], LessThan(BitsAmount())([makerSailAmt * enabled, supBuyAmtTaker * enabled]));
    matchedBuyAmt  <== Mux(2)([supBuyAmtMaker, takerSailAmt], LessThan(BitsAmount())([makerSailAmt * enabled, supBuyAmtTaker * enabled]));
    for(var i = 0; i < LenOfOL(); i++){
        if(i == OLIdxAmount())
            ImplyEq()(enabled, r_newOrderLeaf[0][i], Fix2Float()(takerSailAmt - matchedSailAmt));
        else
            ImplyEq()(enabled, r_newOrderLeaf[0][i], r_oriOrderLeaf[0][i]);
    }
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + matchedBuyAmt); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxAvlAmt()], r_oriTokenLeaf[1][TLIdxAvlAmt()]); 
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxLockedAmt()], r_oriTokenLeaf[1][TLIdxLockedAmt()] - matchedSailAmt);
    
    /* channel out */
    for(var i = 0; i < LenOfRequest(); i++){
        if(i == OLIdxAmount())
            channelOut[i] <== makerSailAmt - matchedBuyAmt;
        else
            channelOut[i] <== r_oriOrderLeaf[0][i];
    }
    channelOut[LenOfRequest()] <== channelIn[LenOfRequest()] + matchedSailAmt;
    channelOut[LenOfRequest() + 1] <== channelIn[LenOfRequest() + 1] + (channelIn[OLIdxAmount()] - channelOut[OLIdxAmount()]);
    for(var i = LenOfRequest() + 2; i < LenOfChannel(); i++)
        channelOut[i] <== 0;

    /* response */
    resData <== [matchedSailAmt, matchedBuyAmt];
}
template DoReqSecondMarketEnd(){
    signal input enabled;

    signal input channelIn[LenOfChannel()];
    
    signal input orderRootFlow[2];
    signal input accountRootFlow[2];
    signal input nullifierRootFlow[2][2];
    signal input epochFlow[2][2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
    signal input nullifierTreeId;
    signal input nullifierElemId;

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

    signal input r_nullifierLeafId[MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[MaxNullifierUnitsPerReq()][2];
    
    signal input digest;

    signal output channelOut[LenOfChannel()] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    signal output resData[LenOfResponse()];

    signal matchedBuyAmt <== channelIn[LenOfRequest()];
    signal matchedSailAmt <== channelIn[LenOfRequest() + 1];
    
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

    ImplyEq()(enabled, nullifierRootFlow[0][0], nullifierRootFlow[0][1]);
    ImplyEq()(enabled, nullifierRootFlow[1][0], nullifierRootFlow[1][1]);

    ImplyEq()(enabled, epochFlow[0][0], epochFlow[0][1]);
    ImplyEq()(enabled, epochFlow[1][0], epochFlow[1][1]);

    /* legality */
    ImplyEq()(enabled, channelIn[ReqIdxReqType()], ReqTypeNumSecondMarketOrder());
    
    /* correctness */
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxTsAddr()], r_oriAccountLeaf[0][ALIdxTsAddr()]);
    ImplyEq()(enabled, r_newAccountLeaf[0][ALIdxNonce()], r_oriAccountLeaf[0][ALIdxNonce()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxAvlAmt()], r_oriTokenLeaf[0][TLIdxAvlAmt()] + matchedBuyAmt); 
    ImplyEq()(enabled, r_newTokenLeaf[0][TLIdxLockedAmt()], r_oriTokenLeaf[0][TLIdxLockedAmt()]);
    
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxAvlAmt()], r_oriTokenLeaf[1][TLIdxAvlAmt()]); 
    ImplyEq()(enabled, r_newTokenLeaf[1][TLIdxLockedAmt()], r_oriTokenLeaf[1][TLIdxLockedAmt()] - matchedSailAmt);

    /* response */
    resData <== [matchedSailAmt, matchedBuyAmt];
}