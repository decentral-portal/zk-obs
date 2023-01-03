import { Injectable } from '@nestjs/common';
import { TsAccountTreeService } from './tsAccountTree.service';
import { TsTokenTreeService } from './tsTokenTree.service';

@Injectable()
export class ObsMerkleTreeService {
  constructor(
    private readonly obsTokenTreeService: TsTokenTreeService,
    private readonly obsAccountTreeService: TsAccountTreeService,
  ) {}
  // update State Merkle tree
  async updateStateTree(accountId: bigint, tokenId: bigint, lockedAmt: bigint, availableAmt: bigint) 
  {
    // first update token tree
    await this.obsTokenTreeService.updateLeaf(tokenId, {
      leafId: tokenId.toString(),
      accountId: accountId.toString(),
      lockedAmt: lockedAmt.toString(),
      availableAmt: availableAmt.toString()
    });
    // get tokenRoot hash as AccountLeafNode.hash
    const [tokenRoot, accountLeaf] = await Promise.all([
      this.obsTokenTreeService.getRoot(accountId.toString()), 
      this.obsAccountTreeService.getLeaf(accountId)
    ]);
    // update account tree
    await this.obsAccountTreeService.updateLeaf(accountId, {
      leafId: accountId.toString(),
      tokenRoot: tokenRoot.hash.toString(),
      nonce: accountLeaf.nonce.toString(),
      tsAddr: accountLeaf.tsAddr.toString()
    });
  }
}