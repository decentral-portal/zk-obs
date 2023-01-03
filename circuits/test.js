const input = [
    
"1856910059434725370427932672",
"1856910059432473570614837248"
]

input.map(e => BigInt(e).toString(2)).forEach(e => console.log(e));
console.log(BigInt("0b0000100000000000000000000000000000000001"));
console.log(BigInt("34359738369").toString(2).padStart(40,"0"));