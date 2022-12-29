import { Body, Controller, Logger, Post } from '@nestjs/common';
import { UpdateAccountTreeDto } from './dto/updateAccountTree.dto';
import { UpdateTokenTreeDto } from './dto/updateTokenTree.dto';
import { TsAccountTreeService } from './tsAccountTree.service';
import { TsTokenTreeService } from './tsTokenTree.service';

@Controller('merkleTree')
export class MerkleTreeController {
  private logger: Logger = new Logger(MerkleTreeController.name);
  private accountLeafId: bigint = 100n;
  // private tokeneLeafId: bigint = 0n;
  constructor(
    private readonly tsAccountTreeService: TsAccountTreeService,  
    private readonly tsTokenTreeService: TsTokenTreeService,
  ) {
    this.tsAccountTreeService.getCurrentLeafIdCount().then((id) => {
      this.accountLeafId = BigInt(id)+ 100n;
      console.log(`accountLeafId: ${this.accountLeafId}`);
    });
  }

  @Post('updateAccountTree')
  async updateAccountTree(@Body() updateAccountTreeDto: UpdateAccountTreeDto) {
    console.time('controller updateAccountTree');
    await this.tsAccountTreeService.updateLeaf(
      this.accountLeafId,
      updateAccountTreeDto
      );
    this.accountLeafId++;
    console.timeEnd('controller updateAccountTree');
  }
  @Post('updateTokenTree')
  async updateTokenTree(@Body() updateTokenTreeDto: UpdateTokenTreeDto) {
    console.time('controller updateTokenTree');
    const tokeneLeafId = await this.tsTokenTreeService.getCurrentLeafIdCount(BigInt(updateTokenTreeDto.accountId));
    await this.tsTokenTreeService.updateLeaf(
      BigInt(tokeneLeafId),
      updateTokenTreeDto,
      );
    console.timeEnd('controller updateTokenTree');
  }
}