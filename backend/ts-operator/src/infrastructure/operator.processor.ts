import { TsWorkerName } from '@ts-sdk/constant';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { EthersContract, EthersSigner, InjectContractProvider, InjectSignerProvider, Wallet } from 'nestjs-ethers';
import { ConfigService } from '@nestjs/config';
import * as ABI from '../domain/verified-abi.json';
import { VerifierContract } from '@ts-operator/domain/verifier-contract';
import { BullWorker, BullWorkerProcess } from '@anchan828/nest-bullmq';
import { Job } from 'bullmq';
import { BlockInformation } from 'common/ts-typeorm/src/account/blockInformation.entity';

@BullWorker({
  queueName: TsWorkerName.OPERATOR,
  options: {
    concurrency: 1
  }
})
export class OperatorConsumer {
  private wallet: Wallet;
  private contract: VerifierContract;
  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLoggerService,
    @InjectSignerProvider() private readonly ethersSigner: EthersSigner,
    @InjectContractProvider() private readonly ethersContract: EthersContract,
  ) {
    this.wallet = this.ethersSigner.createWallet(this.config.get('ETHEREUM_OPERATOR_PRIV', ''));
    this.contract = this.ethersContract.create(this.config.get('ETHEREUM_ROLLUP_CONTRACT_ADDR', ''), ABI, this.wallet) as unknown as VerifierContract;
  
    
  }
  
  
  @BullWorkerProcess()
  async process(job: Job<BlockInformation>) {
    this.logger.log(`OperatorConsumer.process ${job.data.blockNumber}`);
    // ethers;
    // // TODO: refactor
    // const {a,b,c} = job.data.proof as any;
    // const input = job.data.publicInput as any;
    // const gas = await this.contract.estimateGas.verifyProof(a, b, c, input);
    // this.logger.log(`OperatorConsumer.process ${job.data.blockNumber} gas=${gas}`);
    // const receipt = await this.contract.verifyProof(a, b, c, input, {
    //   from: this.wallet.address,
    //   gas: gas.toNumber(),
    // });
    // this.logger.log(`OperatorConsumer.process txHash=${receipt.transactionHash}`);
    // await this.prismaService.BlockInformation.update({
    //   where: {
    //     blockNumber: job.data.blockNumber,
    //   },
    //   data: {
    //     status: BlockStatus.L1VERIFIED
    //   }
    // });
    return true;
  }
}
