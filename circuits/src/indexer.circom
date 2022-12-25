pragma circom 2.1.2;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/multiplexer.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";
template MultiIndexer_dev(idx_count, arr_len){
    signal input enabled;
    signal input in[arr_len];
    signal input idx;
    signal input arr[idx_count][arr_len];
    signal arr_digest[idx_count][1];
    signal in_digest <== Poseidon(arr_len)(in);
    
    enabled * (1 - enabled) === 0;
    for(var i = 0; i < idx_count; i++)
        arr_digest[i][0] <== Poseidon(arr_len)(arr[i]);
    signal temp[1] <== Multiplexer(1, idx_count)(arr_digest, idx * enabled);
    for(var i = 0; i < arr_len; i++)
        in_digest === (temp[0] - in_digest) * enabled + in_digest;
}
template MultiIndexer(idx_count, arr_len){
    signal input enabled;
    signal input in[arr_len];
    signal input idx;
    signal input arr[idx_count][arr_len];
    
    enabled * (1 - enabled) === 0;
    signal temp[arr_len] <== Multiplexer(arr_len, idx_count)(arr, idx * enabled);
    for(var i = 0; i < arr_len; i++)
        in[i] === (temp[i] - in[i]) * enabled + in[i];
}
template Indexer(idx_count){
    signal input enabled;
    signal input in;
    signal input idx;
    signal input arr[idx_count];

    var arr_[idx_count][1];
    for(var i = 0; i < idx_count; i++)
        arr_[i][0] = arr[i];
    MultiIndexer(idx_count, 1)(enabled, [in], idx, arr_);
}
template Mux(len){
    signal input arr[len];
    signal input in;

    var arr_[len][1];
    for(var i = 0; i < len ;i++)
        arr_[i][0] = arr[i];
    signal temp[1] <== Multiplexer(1, len)(arr_, in);
    signal output out <== temp[0];
}