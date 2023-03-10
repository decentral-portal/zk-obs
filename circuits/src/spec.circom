pragma circom 2.1.2;

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
    return 3;
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
    return 20;//NumOfReqs() * 3;//MaxChunksPerReq();
}
function NumOfOuts(){
    return (NumOfChunks() + 5) \ 6;
}

function OrderTreeHeight(){
    return 8;
}
function AccTreeHeight(){
    return 8;
}
function TokenTreeHeight(){
    return 4;
}