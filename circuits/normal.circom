pragma circom 2.1.2;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/multiplexer.circom";
include "../node_modules/circomlib/circuits/eddsaposeidon.circom";
include "../node_modules/circomlib/circuits/sha256/sha256.circom";
include "./src/merkle_tree_poseidon.circom";
include "./src/spec.circom";
include "./src/type.circom";
include "./src/indexer.circom";
include "./src/request.circom";
include "./src/fp.circom";

template Chunkify(){
    signal input reqData[LenOfRequest()];
    signal input resData[LenOfResponse()];
    signal input r_chunks[MaxChunksPerReq()];

    signal Temp[4];
    Temp[0] <== Mux(2)([reqData[ReqIdxL2AddrSigner()], reqData[ReqIdxArg(0)]], Mux(8)([1, 1, 1, 0, 1, 0, 0, 1],reqData[ReqIdxReqType()]));
    Temp[1] <== Fix2Float()(reqData[ReqIdxAmount()]);
    Temp[2] <== Fix2Float()(resData[0]);
    Temp[3] <== Fix2Float()(resData[1]);

    signal A <== 
        reqData[ReqIdxReqType()] * (1 << (8 * 6)) + 
        Temp[0] * (1 << (8 * 2)) + 
        reqData[ReqIdxL2TokenAddr()];
    signal B_0 <== reqData[ReqIdxAmount()];
    signal B_1 <== Temp[1] * (1 << (8 * 11));
    signal B_2 <== 
        Temp[1] * (1 << (8 * 11)) + 
        reqData[ReqIdxArg(0)] * (1 << (8 * 7));
    signal B_3 <==
        Temp[2] * (1 << (8 * 11)) + 
        reqData[ReqIdxArg(3)] * (1 << (8 * 9)) +
        Temp[3] * (1 << (8 * 4));

    signal B <== Mux(5)([B_0, B_1, B_2, B_3, 0], Mux(8)([3, 0, 0, 2, 0, 1, 1, 1], reqData[ReqIdxReqType()]));

    signal C_0 <== reqData[ReqIdxArg(1)];
    signal C <== Mux(2)([C_0, 0], Mux(8)([1, 0, 1, 1, 1, 1, 1, 1], reqData[ReqIdxReqType()]));

    signal n2B_AB[8 * 23] <== Num2Bits(8 * 23)(A * (1 << (8 * 16)) + B);
    signal n2B_C[8 * 20] <== Num2Bits(8 * 20)(C);

    /* bit_arr := n2B_AB.reverse + n2B_C.reverse */
    var bit_arr[MaxChunksPerReq() * BitsChunk()];
    for(var i = 0; i < 8 * 23; i++)
        bit_arr[8 * 23 - 1 - i] = n2B_AB[i];
    for(var i = 0; i < 8 * 20; i++)
        bit_arr[8 * 43 - 1 - i] = n2B_C[i];
    for(var i = 8 * 43; i < MaxChunksPerReq(); i++)
        bit_arr[i] = 0;

    signal Temp2[MaxChunksPerReq()];
    for(var i = 0; i < MaxChunksPerReq(); i++){
        var t[BitsChunk()];
        for(var j = 0; j < BitsChunk(); j++)
            t[j] = bit_arr[BitsChunk() * (i + 1) - 1 - j];
        Temp2[i] <== Bits2Num(BitsChunk())(t);
    }
}
template DoRequest(){
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
    signal input sigR[2];
    signal input sigS;

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
    
    signal input r_chunks[MaxChunksPerReq()];

    signal output channelOut[LenOfChannel()];
    signal resData[LenOfResponse()];

    signal isPuesdoReq <== Mux(8)([1, 1, 1, 0, 0, 0, 0, 1],reqData[ReqIdxReqType()]);//to-do: extract as a func

    signal slt <== LessThan(4)([reqData[ReqIdxReqType()], ReqTypeCount()]);

    signal digest <== Poseidon(LenOfRequest())(reqData);

    signal temp[ReqTypeCount()][LenOfChannel()];
    signal temp2[ReqTypeCount()][LenOfResponse()];

    slt === 1;

    /* verify sig */
    EdDSAPoseidonVerifier()(
        1 - isPuesdoReq,
        tsPubKey[0], tsPubKey[1], sigS, sigR[0], sigR[1],
        digest
    );
    reqData[ReqIdxL2AddrSigner()] === (0 - reqData[ReqIdxL2AddrSigner()]) * isPuesdoReq + reqData[ReqIdxL2AddrSigner()];

    /*  */
    nullifierTreeId * (1 - nullifierTreeId) === 0;

    /* dispatch */
    (temp[0] , temp2[0] ) <== DoReqUnknow               ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumUnknow()              ]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    (temp[1] , temp2[1] ) <== DoReqRegister             ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumRegister()            ]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    (temp[2] , temp2[2] ) <== DoReqDeposit              ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumDeposit()             ]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    (temp[3] , temp2[3] ) <== DoReqTransfer             ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumTransfer()            ]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    (temp[4] , temp2[4] ) <== DoReqWithdraw             ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumWithdraw()            ]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    (temp[5] , temp2[5] ) <== DoReqSecondLimitOrder     ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondLimitOrder()    ]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    (temp[6] , temp2[6] ) <== DoReqSecondLimitStart     ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondLimitStart()    ]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    (temp[7] , temp2[7] ) <== DoReqSecondLimitExchange  ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondLimitExchange() ]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    (temp[8] , temp2[8] ) <== DoReqSecondLimitEnd       ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondLimitEnd()      ]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    (temp[9] , temp2[9] ) <== DoReqSecondMarketOrder    ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondMarketOrder()   ]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    (temp[10], temp2[10]) <== DoReqSecondMarketExchange ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondMarketExchange()]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    (temp[11], temp2[11]) <== DoReqSecondMarketEnd      ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondMarketEnd()     ]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    (temp[12], temp2[12]) <== DoReqCancel               ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumCancel()              ]), channelIn, orderRootFlow, accountRootFlow, nullifierRootFlow, epochFlow, reqData, tsPubKey, txId, nullifierTreeId, nullifierElemId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, r_nullifierLeafId, r_oriNullifierLeaf, r_newNullifierLeaf, r_nullifierRootFlow, digest);
    channelOut <== Multiplexer(LenOfChannel(), ReqTypeCount())(temp, reqData[ReqIdxReqType()]);
    resData <== Multiplexer(LenOfResponse(), ReqTypeCount())(temp2, reqData[ReqIdxReqType()]);

    /* calc chunks */
    Chunkify()(reqData, resData, r_chunks);
}
template UpdateMKT(leaf_len, tree_height){
    signal input oriRoot;
    signal input oriLeaf[leaf_len];
    signal input newRoot;
    signal input newLeaf[leaf_len];
    signal input leafId;
    signal input mkPrf[tree_height];
    VerifyExists(tree_height)(leafId, Poseidon(leaf_len)(oriLeaf), mkPrf, oriRoot);
    VerifyExists(tree_height)(leafId, Poseidon(leaf_len)(newLeaf), mkPrf, newRoot);
}
template CalcCommitment(){
    signal input oriStateRoot;
    signal input newStateRoot;
    signal input newTsRoot;
    signal input chunks[NumOfChunks()];
    signal input isCriticalChunk[NumOfChunks()];
    signal output commitment;
    
    component n2b_chunks[NumOfChunks()];
    for(var i = 0; i < NumOfChunks(); i++){
        n2b_chunks[i] = Num2Bits(BitsChunk());
        n2b_chunks[i].in <== chunks[i];
    }
    component sha256 = Sha256(256 * 3 + (BitsChunk() + 8) * (NumOfChunks()));
    signal n2b_oriStateRoot[254] <== Num2Bits_strict()(oriStateRoot);
    signal n2b_newStateRoot[254] <== Num2Bits_strict()(newStateRoot);
    signal n2b_newTsRoot[254] <== Num2Bits_strict()(newTsRoot);
    for(var i = 0; i < 254; i++){
        sha256.in[256 * 1 - 1 - i] <== n2b_oriStateRoot[i];
        sha256.in[256 * 2 - 1 - i] <== n2b_newStateRoot[i];
        sha256.in[256 * 3 - 1 - i] <== n2b_newTsRoot[i];
    }
    for(var i = 254; i < 256; i++){
        sha256.in[256 * 1 - 1 - i] <== 0;
        sha256.in[256 * 2 - 1 - i] <== 0;
        sha256.in[256 * 3 - 1 - i] <== 0;
    }
    for(var i = 0; i < NumOfChunks(); i++){
        sha256.in[(256 * 3) + (8 * (i + 1)) - 1 - 0] <== isCriticalChunk[i];
        for(var j = 1; j < 8; j++)
            sha256.in[(256 * 3) + (8 * (i + 1)) - 1 - j] <== 0;
        for(var j = 0; j < BitsChunk(); j++)
            sha256.in[(256 * 3) + (8 * NumOfChunks()) + (BitsChunk() * (i + 1)) - 1 - j] <== n2b_chunks[i].out[j];
    }
    component b2n_commitment = Bits2Num(253);
    for(var i = 0; i < 253; i++)
        b2n_commitment.in[i] <== sha256.out[255 - i];
    commitment <== b2n_commitment.out;
}
template Normal(order_tree_height, acc_tree_height, token_tree_height, nullifier_tree_height){
    signal input orderRootFlow[NumOfReqs() + 1];
    signal input accountRootFlow[NumOfReqs() + 1];
    signal input nullifierRootFlow[2][NumOfReqs() + 1];
    signal input epochFlow[2][NumOfReqs() + 1];

    signal input reqData[NumOfReqs()][LenOfRequest()];
    signal input tsPubKey[NumOfReqs()][2];
    signal input oriTxNum;
    signal input nullifierTreeId[NumOfReqs()];
    signal input nullifierElemId[NumOfReqs()];
    signal input sigR[NumOfReqs()][2];
    signal input sigS[NumOfReqs()];

    signal input r_accountLeafId[NumOfReqs()][MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[NumOfReqs()][MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[NumOfReqs()][MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[NumOfReqs()][MaxAccUnitsPerReq()][2];
    signal input r_accountMkPrf[NumOfReqs()][MaxAccUnitsPerReq()][acc_tree_height];

    signal input r_tokenLeafId[NumOfReqs()][MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[NumOfReqs()][MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[NumOfReqs()][MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[NumOfReqs()][MaxTokenUnitsPerReq()][2];
    signal input r_tokenMkPrf[NumOfReqs()][MaxTokenUnitsPerReq()][token_tree_height];

    signal input r_orderLeafId[NumOfReqs()][MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[NumOfReqs()][MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[NumOfReqs()][MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[NumOfReqs()][MaxOrderUnitsPerReq()][2];
    signal input r_orderMkPrf[NumOfReqs()][MaxOrderUnitsPerReq()][order_tree_height];

    signal input r_nullifierLeafId[NumOfReqs()][MaxNullifierUnitsPerReq()];
    signal input r_oriNullifierLeaf[NumOfReqs()][MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_newNullifierLeaf[NumOfReqs()][MaxNullifierUnitsPerReq()][LenOfNL()];
    signal input r_nullifierRootFlow[NumOfReqs()][MaxNullifierUnitsPerReq()][2];
    signal input r_nullifierMkPrf[NumOfReqs()][MaxNullifierUnitsPerReq()][nullifier_tree_height];

    signal input isCriticalChunk[NumOfChunks()];
    signal input r_chunks[NumOfReqs()][MaxChunksPerReq()];
    signal input o_chunks[NumOfChunks()];

    signal newNullifierRoot <== Poseidon(2)([nullifierRootFlow[0][NumOfReqs()], nullifierRootFlow[0][NumOfReqs()]]);

    signal oriStateRoot <== Poseidon(3)([orderRootFlow[0], accountRootFlow[0], oriTxNum]);
    signal newStateRoot <== Poseidon(3)([orderRootFlow[NumOfReqs()], accountRootFlow[NumOfReqs()], oriTxNum + NumOfReqs()]);
    signal newTsRoot <== Poseidon(3)([newNullifierRoot, oriTxNum + NumOfReqs(), orderRootFlow[NumOfReqs()]]);
    signal output commitment;

    signal chunkCount[NumOfReqs()];
    signal chunkCounter[NumOfReqs() + 1];
    signal chunkMasks[NumOfReqs()][MaxChunksPerReq()];

    signal channelData[NumOfReqs() + 1][LenOfChannel()];
    
    var txId[NumOfReqs()];
    for(var i = 0; i < NumOfReqs(); i++)
        txId[i] = oriTxNum + i;

    chunkCounter[0] <== 0;
    channelData[0] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for(var i = 0; i < NumOfReqs(); i++){
        channelData[i + 1] <== DoRequest()(
            channelData[i],
            [orderRootFlow[i], orderRootFlow[i + 1]], 
            [accountRootFlow[i], accountRootFlow[i + 1]], 
            [[nullifierRootFlow[0][i], nullifierRootFlow[0][i + 1]], [nullifierRootFlow[1][i], nullifierRootFlow[1][i + 1]]], 
            [[epochFlow[0][i], epochFlow[0][i + 1]], [epochFlow[1][i], epochFlow[1][i + 1]]], 
            reqData[i], tsPubKey[i], txId[i], nullifierTreeId[i], nullifierElemId[i], sigR[i], sigS[i], 
            r_orderLeafId[i], r_oriOrderLeaf[i], r_newOrderLeaf[i], r_orderRootFlow[i], 
            r_accountLeafId[i], r_oriAccountLeaf[i], r_newAccountLeaf[i], r_accountRootFlow[i], 
            r_tokenLeafId[i], r_oriTokenLeaf[i], r_newTokenLeaf[i], r_tokenRootFlow[i], 
            r_nullifierLeafId[i], r_oriNullifierLeaf[i], r_newNullifierLeaf[i], r_nullifierRootFlow[i], 
            r_chunks[i]
        );
        
        /* interface btwn do_req n mk_units  */
            //to-do: replace "MaxXxxxUnitsPerReq()" with log_2(MaxXxxxUnitsPerReq()).
            //to-do: optimaize the complexity of interface.
        chunkCount[i]       <== Mux(8)([0, 9, 5, 5, 5, 3, 3, 3], reqData[i][ReqIdxReqType()]);//to-do: extract as a func
        if(i < NumOfReqs())
            chunkCounter[i + 1] <== chunkCounter[i] + chunkCount[i];
        for(var j = 0; j < MaxChunksPerReq(); j++){
            chunkMasks[i][j] <== LessThan(MaxChunksPerReq())([j, chunkCount[i]]);
            Indexer(NumOfChunks())(chunkMasks[i][j], r_chunks[i][j], chunkCounter[i] + j, o_chunks);
            if(j == 0)
                Indexer(NumOfChunks())(chunkMasks[i][j], Mux(8)([0, 1, 1, 0, 1, 0, 0, 0], reqData[i][ReqIdxReqType()]), chunkCounter[i] + j
                , isCriticalChunk);
            else
                Indexer(NumOfChunks())(chunkMasks[i][j], 0, chunkCounter[i] + j, isCriticalChunk);
        }
    }
    channelData[NumOfReqs()] === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    for(var i = 0; i < NumOfReqs(); i++)
        for(var j = 0; j < MaxOrderUnitsPerReq(); j++)
            UpdateMKT(LenOfOL(), order_tree_height)(r_orderRootFlow[i][j][0], r_oriOrderLeaf[i][j], r_orderRootFlow[i][j][1], r_newOrderLeaf[i][j], r_orderLeafId[i][j], r_orderMkPrf[i][j]);
    for(var i = 0; i < NumOfReqs(); i++)
        for(var j = 0; j < MaxAccUnitsPerReq(); j++)
            UpdateMKT(LenOfAL(), acc_tree_height)(r_accountRootFlow[i][j][0], r_oriAccountLeaf[i][j], r_accountRootFlow[i][j][1], r_newAccountLeaf[i][j], r_accountLeafId[i][j], r_accountMkPrf[i][j]);
    for(var i = 0; i < NumOfReqs(); i++)
        for(var j = 0; j < MaxTokenUnitsPerReq(); j++)
            UpdateMKT(LenOfTL(), token_tree_height)(r_tokenRootFlow[i][j][0], r_oriTokenLeaf[i][j], r_tokenRootFlow[i][j][1], r_newTokenLeaf[i][j], r_tokenLeafId[i][j], r_tokenMkPrf[i][j]);
    
    
    //verify the remaining chunks are default
    component isDefaultChunk[NumOfChunks()];
    for(var i = 0; i < NumOfChunks(); i++){
        isDefaultChunk[i] = GreaterEqThan(NumOfChunks());
        isDefaultChunk[i].in <== [i, chunkCounter[NumOfReqs()]];
        o_chunks[i] === (0 - o_chunks[i]) * isDefaultChunk[i].out + o_chunks[i];
        isCriticalChunk[i] === (0 - isCriticalChunk[i]) * isDefaultChunk[i].out + isCriticalChunk[i];
    }
    commitment <== CalcCommitment()(
        oriStateRoot,
        newStateRoot,
        newTsRoot,
        o_chunks,
        isCriticalChunk
    );
}