import { ZkOBS } from '../../../ts-contract-types/contracts/ZkOBS';
import { TsWorkerName } from '@ts-sdk/constant';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { EthersContract, EthersSigner, InjectContractProvider, InjectSignerProvider, Wallet } from 'nestjs-ethers';
import { ConfigService } from '@nestjs/config';
import * as ABI from '../domain/verified-abi.json';
import { BullWorker, BullWorkerProcess } from '@anchan828/nest-bullmq';
import { Job } from 'bullmq';
import { BlockInformation } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BLOCK_STATUS } from '@common/ts-typeorm/account/blockStatus.enum';
import { BigNumber, utils } from 'ethers';

@BullWorker({
  queueName: TsWorkerName.OPERATOR,
  options: {
    concurrency: 1,
  },
})
export class OperatorConsumer {
  private wallet: Wallet;
  private contract: ZkOBS;
  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLoggerService,
    @InjectSignerProvider() private readonly ethersSigner: EthersSigner,
    @InjectContractProvider() private readonly ethersContract: EthersContract,
    @InjectRepository(BlockInformation)
    private blockRepository: Repository<BlockInformation>,
  ) {
    this.wallet = this.ethersSigner.createWallet(this.config.get('ETHEREUM_OPERATOR_PRIV', ''));
    this.contract = this.ethersContract.create(this.config.get('ETHEREUM_ROLLUP_CONTRACT_ADDR', ''), ABI, this.wallet) as unknown as ZkOBS;
  }

  @BullWorkerProcess()
  async process(job: Job<BlockInformation>) {
    this.logger.log(`OperatorConsumer.process ${job.data.blockNumber}`);
    const currentBlock = await this.blockRepository.findOne({
      where: {
        blockStatus: BLOCK_STATUS.L2CONFIRMED
      },
      order: {
        blockNumber: 'ASC'
      }
    });
    if(!currentBlock) {
      this.logger.log(`ProverConsumer.process ${job.data.blockNumber} no block found`);
      return false;
    }
    const lastBlock = await this.blockRepository.findOne({
      where: {
        blockNumber: currentBlock.blockNumber - 1
      },
      order: {
        blockNumber: 'DESC'
      }
    });
    const lastCommittedBlock = {
      blockNumber: BigNumber.from('0'),
      stateRoot: lastBlock?.state.stateRoot,
      l1RequestNum: BigNumber.from('0'),
      pendingRollupTxHash: '',
      commitment: utils.defaultAbiCoder.encode(
        ['bytes32'],
        [String('0x').padEnd(66, '0')],
      ),
      timestamp: BigNumber.from('0'),
    };
    const commitBlock = {
      blockNumber: BigNumber.from('1'),
      newStateRoot: currentBlock.state.stateRoot,
      newTsRoot: currentBlock.state.tsRoot,
      publicData: currentBlock.state.publicData,
      publicDataOffsets: currentBlock.state.publicDataOffsets,
      timestamp: Date.now(),
    };
    console.log({
      blockNumber: currentBlock.blockNumber,
      proof: currentBlock.proof,
      calldata: currentBlock.callData,
      state: currentBlock.state,
      lastCommittedBlock,
      commitBlock,
    });
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
    return true;
  }
}
