pragma circom 2.0.2;
/* not yet set */

function MinChunksPerReq(){
    return 5;
}
function MaxOrderUnitsPerReq(){
    return 1;
}
function MaxAccUnitsPerReq(){
    return 2;
}
function MaxTokenUnitsPerReq(){
    return 2;
}
function MaxNullifierUnitsPerReq(){
    return 1;
}
function MaxChunksPerReq(){
    return 9;
}

function NumOfReqs(){
    return 10;
}
function NumOfOrderUnits(){
    return NumOfReqs() * MaxOrderUnitsPerReq();
}
function NumOfAccUnits(){
    return NumOfReqs() * MaxAccUnitsPerReq();
}
function NumOfTokenUnits(){
    return NumOfReqs() * MaxTokenUnitsPerReq();
}
function NumOfChunks(){
    return NumOfReqs() * 3;//MaxChunksPerReq();
}
function NumOfOuts(){
    return (NumOfChunks() + 5) \ 6;
}