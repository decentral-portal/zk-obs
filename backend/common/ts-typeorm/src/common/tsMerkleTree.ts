import { BytesLike } from 'ethers';

export abstract class TsMerkleTree<T> {
  // treeHeight for extend
  protected treeHeigt!: number;
  private lastLevel!: number;
  private levelsDefaultHash!: Map<number, string>;
  public hashFunc!: (x: BytesLike| BytesLike[]) => string;
  constructor(treeHeight: number, hashFunc: ((x: BytesLike| BytesLike[]) => string)) {
    console.log({
      treeHeight,
    });
    this.treeHeigt = Number(treeHeight);
    this.hashFunc = hashFunc;
    this.lastLevel = Number(this.treeHeigt);
    // this.setLevelDefaultHash();
  }
  abstract getDefaultRoot(): string;
  abstract getLeafDefaultVavlue(): string;
  abstract updateLeaf(leafId: bigint, value: any, otherPayload: any): void;
  abstract getLeaf(leaf_id: bigint, otherPayload: any): Promise<T|null>;
  abstract getMerklerProof(leaf_id: bigint): Promise<bigint[]>;
  getProofIds(leaf_id: bigint) {
    const prf: bigint[] = [];
    const height = this.treeHeigt;
    const leafStart = leaf_id + (1n <<  BigInt(height));
    for (let i = leafStart; i > 1n; i = i >> 1n) {
      if ( i % 2n == 0n) {
        prf.push(i + 1n);
      } else {
        prf.push(i - 1n);
      } 
    }
    return prf;
  }
  abstract getRoot(otherPayload: any): any; 
  /**
   * calculate levels default Hash
   */
  setLevelDefaultHash() {
    this.levelsDefaultHash = new Map<number, string>();
    this.levelsDefaultHash.set(this.lastLevel, this.getLeafDefaultVavlue());
    for(let level = this.lastLevel-1; level >= 0 ; level--) {
      const prevLevelHash = this.levelsDefaultHash.get(level+1);
      if (prevLevelHash != undefined) {
        this.levelsDefaultHash.set(level, this.hashFunc([prevLevelHash, prevLevelHash]));
      }
    }
  }
  getLeafIdInTree(leafId: bigint) {
    return leafId + (1n << BigInt(this.treeHeigt));
  }
  getLastLevel() {
    return this.lastLevel;
  }
  getDefaultHashByLevel(level: number):string {
    const result = this.levelsDefaultHash.get(level);
    return result? result : '';
  }
}