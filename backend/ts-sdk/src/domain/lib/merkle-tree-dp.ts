import {BigNumber, BytesLike} from 'ethers';
export const DEFAULT_LEAF = '0x00';
export class TsMerkleTree {
  public nodes: string[] = [];
  public treeHeight = 8;
  private hash: (x : BytesLike) => string = (x : BytesLike) => '';
  private defaultLeaf: string;

  constructor(
    leafs : string[],
    treeHeight : number,
    hash : (x : BytesLike) => string,
    defaultLeaf = DEFAULT_LEAF,
  ) {
    this.treeHeight = treeHeight;
    this.hash = hash;
    this.defaultLeaf = defaultLeaf;
    // console.time(`Init Merkle tree depth=${treeHeight}, leafs=${leafs.length}`);
    this.parse();
        
    leafs.forEach((leaf, i) => {
      this.updateLeafNode(i, leaf);
    });
    // console.timeEnd(`Init Merkle tree depth=${treeHeight}, leafs=${leafs.length}`);
  }

  private parse() {
    const nodes = new Array(Math.pow(2, this.treeHeight + 1)).fill(this.defaultLeaf);
    for (let i = Math.pow(2, this.treeHeight) - 1; i > 0; --i) {
      nodes[i] = this.hash([
        nodes[i * 2],
        nodes[i * 2 + 1]
      ]);
    }
    this.nodes = nodes;
  }

  getRoot() {
    return this.nodes[1];
  }

  getLeaf(leaf_id : number) {
    return this.nodes[leaf_id + (1 << this.treeHeight)];
  }

  getProof(leaf_id : number) {
    const prf = [];
    for (let i = leaf_id + (1 << this.treeHeight); i > 1; i = Math.floor(i / 2)) {
      prf.push(this.nodes[
        [
          i + 1,
          i - 1
        ][i % 2]
      ]);
    }
            
    return prf;
  }

  updateLeafNode(leaf_id : number, value : string) {
    const prf = this.getProof(leaf_id);
    const leaf_node_id = leaf_id + (1 << this.treeHeight);
    this.nodes[leaf_node_id] = value;
    for (let i = leaf_node_id, j = 0; i > 1; i = Math.floor(i / 2)) {
      const r: any = [
        [
          this.nodes[i], prf[j]
        ],
        [
          prf[j], this.nodes[i]
        ]
      ][i % 2];
      this.nodes[Math.floor(i / 2)] = this.hash(r);
      j++;
    }
  }

  // verifyProof(leaf_id: number, proof: string[]) {
  //     const leaf_node_id = leaf_id + (1 << this.treeHeight);
  //     const hashes = [];
  //     hashes.push(this.hash([

  //     ]))
  //     for (let i = 0; i < proof.length; i++) {
  //         const node = proof[i]
  //         let data: any = null
  //         let isLeftNode = null
  //     }
                
  //     for (let i = leaf_node_id, j = 0; i > 1; i = Math.floor(i / 2)) {
  //         const r: any = [
  //             [
  //                 this.nodes[i], prf[j]
  //             ],
  //             [
  //                 prf[j], this.nodes[i]
  //             ]
  //         ][i % 2];
  //         this.nodes[Math.floor(i / 2)] = this.hash(r);
  //         j++;
  //     }
  //     return h === this.getRoot();
  // }

}
