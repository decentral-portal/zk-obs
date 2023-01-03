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

template AllocReqData(){
    /* 
        Verify the signals in reqData be legally allocated or not.
        the input signals of template "LessThan", ... in circomlib need to be verified in advance for legality of alloc.
    */
    signal input reqData[LenOfRequest()];
    var bits[LenOfRequest()] = [BitsReqType(), BitsL2Addr(), BitsTokenAddr(), BitsAmount(), BitsNonce(), BitsL2Addr(), BitsTsAddr(), BitsPrice(), BitsTokenAddr(), 32];
    for(var i = 0; i < LenOfRequest(); i++)
        _ <== Num2Bits(bits[i])(i);
}
template Chunkify(){
    /* Please have a look at table "req_zkOBS" & "pubdata_zkOBS" in "https://docs.google.com/spreadsheets/d/15IM55Kg9z--yAdKQ4thVJd6Wtp0yuOorXLqi1TxBhg4/edit#gid=1909711629" */
    signal input reqData[LenOfRequest()];
    signal input resData[LenOfResponse()];
    signal input r_chunks[MaxChunksPerReq()];

    signal Temp[4];
    Temp[0] <== Mux(3)([reqData[ReqIdxL2AddrSigner()], reqData[ReqIdxArg(0)], resData[0]], Mux(ReqTypeCount())([1, 1, 1, 0, 0, 2, 2, 2, 0, 2, 2, 2],reqData[ReqIdxReqType()]));
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
    signal B_4 <== Temp[3] * (1 << (8 * 13));

    signal B <== Mux(6)([B_0, B_1, B_2, B_3, B_4, 0], Mux(ReqTypeCount())([5, 0, 0, 0, 1, 5, 4, 5, 1, 4, 5, 5], reqData[ReqIdxReqType()]));

    signal C_0 <== reqData[ReqIdxArg(1)];
    signal C <== Mux(2)([C_0, 0], Mux(ReqTypeCount())([1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], reqData[ReqIdxReqType()]));

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
        log(r_chunks[i]);
        log(Temp2[i]);
        log("===========");
        r_chunks[i] === Temp2[i];
    }
}
template DoRequest(){
    /* foreach req do: */
    signal input channelIn[LenOfChannel()];

    signal input orderRootFlow[2];
    signal input accountRootFlow[2];

    signal input reqData[LenOfRequest()];
    signal input tsPubKey[2];
    signal input txId;
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
    
    signal input r_chunks[MaxChunksPerReq()];

    signal output channelOut[LenOfChannel()];
    signal resData[LenOfResponse()];

    signal isPuesdoReq <== Mux(ReqTypeCount())([1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1],reqData[ReqIdxReqType()]);//to-do: extract as a func

    signal slt <== LessThan(4)([reqData[ReqIdxReqType()], ReqTypeCount()]);

    signal digest <== Poseidon(LenOfRequest())(reqData);

    signal temp[ReqTypeCount()][LenOfChannel()];
    signal temp2[ReqTypeCount()][LenOfResponse()];

    /* verify reqType is not "undefined" */
    slt === 1;

    /* alloc reqData */
    AllocReqData()(reqData);

    /* verify sig */
    EdDSAPoseidonVerifier()(
        1 - isPuesdoReq,
        tsPubKey[0], tsPubKey[1], sigS, sigR[0], sigR[1],
        digest
    );
    reqData[ReqIdxL2AddrSigner()] === (0 - reqData[ReqIdxL2AddrSigner()]) * isPuesdoReq + reqData[ReqIdxL2AddrSigner()];

    /* 
        dispatch & verify:
            1.  conn        : alloc circuit unit to verify mk prf
            2.  legality    : e.g. isSufficient, nonce
            3.  correctness : verify correctness of new state, which calc by backend
    */
    (temp[0] , temp2[0] ) <== DoReqUnknow               ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumUnknow()              ]), channelIn, orderRootFlow, accountRootFlow, reqData, tsPubKey, txId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, digest);
    (temp[1] , temp2[1] ) <== DoReqRegister             ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumRegister()            ]), channelIn, orderRootFlow, accountRootFlow, reqData, tsPubKey, txId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, digest);
    (temp[2] , temp2[2] ) <== DoReqDeposit              ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumDeposit()             ]), channelIn, orderRootFlow, accountRootFlow, reqData, tsPubKey, txId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, digest);
    (temp[3] , temp2[3] ) <== DoReqWithdraw             ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumWithdraw()            ]), channelIn, orderRootFlow, accountRootFlow, reqData, tsPubKey, txId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, digest);
    (temp[4] , temp2[4] ) <== DoReqSecondLimitOrder     ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondLimitOrder()    ]), channelIn, orderRootFlow, accountRootFlow, reqData, tsPubKey, txId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, digest);
    (temp[5] , temp2[5] ) <== DoReqSecondLimitStart     ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondLimitStart()    ]), channelIn, orderRootFlow, accountRootFlow, reqData, tsPubKey, txId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, digest);
    (temp[6] , temp2[6] ) <== DoReqSecondLimitExchange  ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondLimitExchange() ]), channelIn, orderRootFlow, accountRootFlow, reqData, tsPubKey, txId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, digest);
    (temp[7] , temp2[7] ) <== DoReqSecondLimitEnd       ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondLimitEnd()      ]), channelIn, orderRootFlow, accountRootFlow, reqData, tsPubKey, txId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, digest);
    (temp[8] , temp2[8] ) <== DoReqSecondMarketOrder    ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondMarketOrder()   ]), channelIn, orderRootFlow, accountRootFlow, reqData, tsPubKey, txId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, digest);
    (temp[9] , temp2[9] ) <== DoReqSecondMarketExchange ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondMarketExchange()]), channelIn, orderRootFlow, accountRootFlow, reqData, tsPubKey, txId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, digest);
    (temp[10], temp2[10]) <== DoReqSecondMarketEnd      ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumSecondMarketEnd()     ]), channelIn, orderRootFlow, accountRootFlow, reqData, tsPubKey, txId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, digest);
    (temp[11], temp2[11]) <== DoReqCancel               ()(IsEqual()([reqData[ReqIdxReqType()], ReqTypeNumCancel()              ]), channelIn, orderRootFlow, accountRootFlow, reqData, tsPubKey, txId, r_orderLeafId, r_oriOrderLeaf, r_newOrderLeaf, r_orderRootFlow, r_accountLeafId, r_oriAccountLeaf, r_newAccountLeaf, r_accountRootFlow, r_tokenLeafId, r_oriTokenLeaf, r_newTokenLeaf, r_tokenRootFlow, digest);
    channelOut <== Multiplexer(LenOfChannel(), ReqTypeCount())(temp, reqData[ReqIdxReqType()]);
    resData <== Multiplexer(LenOfResponse(), ReqTypeCount())(temp2, reqData[ReqIdxReqType()]);

    /* calc chunks */
    Chunkify()(reqData, resData, r_chunks);
}
template UpdateMKT(leaf_len, tree_height){
    /* atomically, verify ori state & update new state */
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
    /* calc commitment := sha256(oriStateRoot | newStateRoot | newTsRoot | ...isCriticalChunk | ...chunks) */
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
    log("commitment", commitment);
}
template Normal(){
    /* the main circuits */
    signal output commitment;

    signal input orderRootFlow[NumOfReqs() + 1];
    signal input accountRootFlow[NumOfReqs() + 1];

    signal input reqData[NumOfReqs()][LenOfRequest()];
    signal input tsPubKey[NumOfReqs()][2];
    signal input oriTxNum;
    signal input sigR[NumOfReqs()][2];
    signal input sigS[NumOfReqs()];

    /*
        for example:
            register: 1 accUnit, 1 tokenUnit, 0 orderUnit
            borrowend: 1 accUnit, 2 tokenUnit (sell & buy), 1 orderUnit
    */
    signal input r_accountLeafId[NumOfReqs()][MaxAccUnitsPerReq()];
    signal input r_oriAccountLeaf[NumOfReqs()][MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_newAccountLeaf[NumOfReqs()][MaxAccUnitsPerReq()][LenOfAL()];
    signal input r_accountRootFlow[NumOfReqs()][MaxAccUnitsPerReq()][2];
    signal input r_accountMkPrf[NumOfReqs()][MaxAccUnitsPerReq()][AccTreeHeight()];

    signal input r_tokenLeafId[NumOfReqs()][MaxTokenUnitsPerReq()];
    signal input r_oriTokenLeaf[NumOfReqs()][MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_newTokenLeaf[NumOfReqs()][MaxTokenUnitsPerReq()][LenOfTL()];
    signal input r_tokenRootFlow[NumOfReqs()][MaxTokenUnitsPerReq()][2];
    signal input r_tokenMkPrf[NumOfReqs()][MaxTokenUnitsPerReq()][TokenTreeHeight()];

    signal input r_orderLeafId[NumOfReqs()][MaxOrderUnitsPerReq()];
    signal input r_oriOrderLeaf[NumOfReqs()][MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_newOrderLeaf[NumOfReqs()][MaxOrderUnitsPerReq()][LenOfOL()];
    signal input r_orderRootFlow[NumOfReqs()][MaxOrderUnitsPerReq()][2];
    signal input r_orderMkPrf[NumOfReqs()][MaxOrderUnitsPerReq()][OrderTreeHeight()];

    signal input isCriticalChunk[NumOfChunks()];// isCriticalChunk[i]:boolean := (is the first chunk of "deposit", "withdraw", "register")
    signal input r_chunks[NumOfReqs()][MaxChunksPerReq()];// chunks calc from req. dynamic arr is not allowed in circom
    signal input o_chunks[NumOfChunks()];// chunks used to calc commitment

    signal oriTsRoot <== Poseidon(2)([orderRootFlow[0], oriTxNum]);
    signal newTsRoot <== Poseidon(2)([orderRootFlow[NumOfReqs()], oriTxNum + NumOfReqs()]);
    signal oriStateRoot <== Poseidon(2)([oriTsRoot, accountRootFlow[0]]);
    signal newStateRoot <== Poseidon(2)([newTsRoot, accountRootFlow[NumOfReqs()]]);
    
    signal chunkCount[NumOfReqs()];
    signal chunkCounter[NumOfReqs() + 1];
    signal chunkMasks[NumOfReqs()][MaxChunksPerReq()];

    signal channelData[NumOfReqs() + 1][LenOfChannel()];
    
    var txId[NumOfReqs()];
    for(var i = 0; i < NumOfReqs(); i++)
        txId[i] = oriTxNum + i;

    // chunkCounter[i + 1] := the len of o_chunk after push calldata of first i req
    // template "DoRequest()" input channelData[i] and output channelData[i + 1]. Some reqs are be required to be atomical.
    chunkCounter[0] <== 0;
    channelData[0] <== [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for(var i = 0; i < NumOfReqs(); i++){
        /* verify legality and correctness for each req */
        channelData[i + 1] <== DoRequest()(
            channelData[i],
            [orderRootFlow[i], orderRootFlow[i + 1]], 
            [accountRootFlow[i], accountRootFlow[i + 1]],  
            reqData[i], tsPubKey[i], txId[i], sigR[i], sigS[i], 
            r_orderLeafId[i], r_oriOrderLeaf[i], r_newOrderLeaf[i], r_orderRootFlow[i], 
            r_accountLeafId[i], r_oriAccountLeaf[i], r_newAccountLeaf[i], r_accountRootFlow[i], 
            r_tokenLeafId[i], r_oriTokenLeaf[i], r_newTokenLeaf[i], r_tokenRootFlow[i], 
            r_chunks[i]
        );
        
        /* interface btwn r_chunks & o_chunks  */
            //to-do: replace "MaxXxxxUnitsPerReq()" with log_2(MaxXxxxUnitsPerReq()).
            //to-do: optimaize the complexity of interface.
        chunkCount[i]       <== Mux(ReqTypeCount())([0, 4, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], reqData[i][ReqIdxReqType()]);//to-do: extract as a func
        if(i < NumOfReqs())
            chunkCounter[i + 1] <== chunkCounter[i] + chunkCount[i];
        for(var j = 0; j < MaxChunksPerReq(); j++){
            chunkMasks[i][j] <== LessThan(MaxChunksPerReq())([j, chunkCount[i]]);
            Indexer(NumOfChunks())(chunkMasks[i][j], r_chunks[i][j], chunkCounter[i] + j, o_chunks);
            if(j == 0)
                Indexer(NumOfChunks())(chunkMasks[i][j], Mux(ReqTypeCount())([0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], reqData[i][ReqIdxReqType()]), chunkCounter[i] + j, isCriticalChunk);
            else
                Indexer(NumOfChunks())(chunkMasks[i][j], 0, chunkCounter[i] + j, isCriticalChunk);
        }
    }
    channelData[NumOfReqs()] === [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    for(var i = 0; i < NumOfReqs(); i++)
        for(var j = 0; j < MaxOrderUnitsPerReq(); j++)
            UpdateMKT(LenOfOL(), OrderTreeHeight())(r_orderRootFlow[i][j][0], r_oriOrderLeaf[i][j], r_orderRootFlow[i][j][1], r_newOrderLeaf[i][j], r_orderLeafId[i][j], r_orderMkPrf[i][j]);
    for(var i = 0; i < NumOfReqs(); i++)
        for(var j = 0; j < MaxAccUnitsPerReq(); j++)
            UpdateMKT(LenOfAL(), AccTreeHeight())(r_accountRootFlow[i][j][0], r_oriAccountLeaf[i][j], r_accountRootFlow[i][j][1], r_newAccountLeaf[i][j], r_accountLeafId[i][j], r_accountMkPrf[i][j]); 
    for(var i = 0; i < NumOfReqs(); i++)
        for(var j = 0; j < MaxTokenUnitsPerReq(); j++)
            UpdateMKT(LenOfTL(), TokenTreeHeight())(r_tokenRootFlow[i][j][0], r_oriTokenLeaf[i][j], r_tokenRootFlow[i][j][1], r_newTokenLeaf[i][j], r_tokenLeafId[i][j], r_tokenMkPrf[i][j]);
    
    
    //verify the remaining o_chunks are "noop"
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
