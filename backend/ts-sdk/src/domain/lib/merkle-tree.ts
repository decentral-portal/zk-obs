import { BytesLike, keccak256 } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import MerkleTree from 'merkletreejs';

export function toMerkleTreeLeaf(depth: number, datas: any[], defaultValue: BytesLike, hash = keccak256) {
  const leafs = new Array(Math.pow(2, depth)).fill(defaultValue);
  datas.forEach((data, i) => {
    leafs[i] = hash(data);
  });
  return leafs;
}
export function getMerkleTree(leafs : string[], hash = keccak256): MerkleTree {
  return new MerkleTree(leafs, hash, {
    hashLeaves: false,
    isBitcoinTree: false,
    sortLeaves: false,
    sortPairs: true,
    sort: false,
  });
}

export function getMyMerkleTree(leafs : string[], depth: number, hash = keccak256) {
  return new MyMerkleTree(leafs, depth, hash);
}

export function getProof(
  merkleTree: MerkleTree,
  data: BytesLike,
  hash = keccak256
) {
  const leaf = hash(data);
  return merkleTree
    .getProof(leaf)
    .map(x => x.data.toString('hex'));
}

export function getMerkleRoot(merkleTree: MerkleTree) {
  const rootHash = merkleTree
    .getRoot()
    .toString('hex');

  return rootHash;
}

// export function treeVerify(merkleTree: MerkleTree, parameters: any[]) {
// const leaf = keccak256(claimAddress);     const proof = getProof(merkleTree,
// ])     const root = merkleTree         .getRoot()         .toString('hex');
// return merkleTree.verify(proof, leaf, root); }

export class MyMerkleTree {
  public depth = 8;
  public nodes: string[] = [];
  public leafs: string[] = [];
  private hash: (x: BytesLike) => string = keccak256;
  public defaultLeaf = '0x00';
  private idx_first_leaf_ = 0;

  constructor(leafs: string[], depth: number, hash: (x: BytesLike) => string) {
    this.depth = depth;
    this.leafs = leafs;
    this.hash = hash;
    this.idx_first_leaf_ = Math.pow(2, this.depth) - 1;

    this.parse();
  }

  private parse() {
    const nodes = new Array(Math.pow(2, this.depth + 1) - 1).fill(this.defaultLeaf);
    for(let i = 0; i < this.leafs.length; i++) {
      nodes[i + this.idx_first_leaf_] = this.leafs[i];
    }

    for(let i = this.idx_first_leaf_ - 1; i >= 0; --i){
      const inputs = [nodes[(i + 1) * 2 - 1], nodes[(i + 1) * 2]];
      nodes[i] = this.hash(inputs);
    }
    this.nodes = nodes;
  }

  public getRoot() {
    return this.nodes[0];
  }

  public getProof(leaf: string){
    for(let i = this.idx_first_leaf_; i < this.nodes.length; i++) {

    }
    const leafIdx = this.leafs.indexOf(leaf);
    if(leafIdx === -1) {
      throw new Error('leaf not found');
    }
    const proof: string[] = new Array(this.depth);

    for(let j = 0, i = leafIdx + this.idx_first_leaf_ + 1; i > 1; i = Math.floor(i / 2)) {
      const ii = (i % 2 === 0 ? i + 1: i - 1) - 1;
      proof[j++] = this.nodes[ii];
    }
    return proof;
  }
}
