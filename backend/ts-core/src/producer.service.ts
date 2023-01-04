import { BullQueueInject } from '@anchan828/nest-bullmq';
import { CHANNEL } from '@common/db-pubsub/domains/value-objects/pubSub.constants';
import { MessageBroker } from '@common/db-pubsub/ports/messageBroker';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockInformation } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { TransactionInfo } from 'common/ts-typeorm/src/account/transactionInfo.entity';
import { TS_STATUS } from 'common/ts-typeorm/src/account/tsStatus.enum';
import { MoreThan, Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { TsWorkerName } from '../../ts-sdk/src/constant';
import { BLOCK_STATUS } from '@common/ts-typeorm/account/blockStatus.enum';
// import { BullWorker, BullWorkerProcess } from '@anchan828/nest-bullmq';
import { Cron } from '@nestjs/schedule';

@Injectable({
  scope: Scope.DEFAULT,
})
// @BullWorker({
//   queueName: TsWorkerName.CORE,
//   options: {
//     concurrency: 1,
//   },
// })
export class ProducerService {
  private currentPendingTxId = 0;
  private currentPendingBlock = 0;
  private currentProvedBlock = 0;
  constructor(
    readonly logger: PinoLoggerService,
    @InjectRepository(TransactionInfo) private txRepository: Repository<TransactionInfo>,
    @InjectRepository(BlockInformation) private blockRepository: Repository<BlockInformation>,
    @BullQueueInject(TsWorkerName.SEQUENCER) private readonly seqQueue: Queue,
    @BullQueueInject(TsWorkerName.OPERATOR) private readonly operatorQueue: Queue,
    @BullQueueInject(TsWorkerName.PROVER) private readonly proverQueue: Queue,
    private readonly messageBrokerService: MessageBroker,
  ) {
    logger.log('DispatchService');
    // this.subscribe();

  }

  // @BullWorkerProcess({
  //   autorun: true,
  // })
  @Cron('5 * * * * *')
  async process() {
    // const name = job.name;
    // console.log('==============process============', name);
    // if(name === 'TransactionInfo') {
    // }
    await this.dispatchPendingTransaction();
  }
  async subscribe() {
    await this.messageBrokerService.addChannels([CHANNEL.ORDER_CREATED, CHANNEL.ORDER_PROCCESSD, CHANNEL.ORDER_VERIFIED]);
    this.messageBrokerService.subscribe(CHANNEL.ORDER_CREATED, this.dispatchPendingTransaction.bind(this));
    this.messageBrokerService.subscribe(CHANNEL.ORDER_PROCCESSD, this.dispatchPeningBlock.bind(this));
    this.messageBrokerService.subscribe(CHANNEL.ORDER_VERIFIED, this.dispatchProvedBlock.bind(this));
  }

  unsubscribe() {
    this.messageBrokerService.close();
  }

  private prevJobId?: string;
  async dispatchPendingTransaction() {
    this.logger.log('dispatchPendingTransaction...');
    const transactions = await this.txRepository.find({
      select: {
        txId: true,
      },
      where: {
        txId: MoreThan(this.currentPendingTxId),
        txStatus: TS_STATUS.PENDING,
      },
      order: {
        txId: 'asc',
      },
    });
    if (transactions.length) {
      this.logger.log(`dispatchPendingTransaction add ${transactions.length} blocks`);
      this.currentPendingTxId = transactions[transactions.length - 1].txId;
      for (let index = 0; index < transactions.length; index++) {
        const tx = transactions[index];
        const jobId = `${TsWorkerName.SEQUENCER}-${tx.txId}`;
        // console.log({
        //   jobId,
        //   prevJobId: this.prevJobId,
        // });
        // const joba = await this.seqQueue.getJob(jobId);
        try {
          const job = await this.seqQueue.add(tx.txId.toString(), {
            jobId,
            txId: tx.txId,
            // parent: this.prevJobId ? {
            //   id: this.prevJobId,
            //   queue: TsWorkerName.SEQUENCER,
            // } : undefined,
          });
          // this.prevJobId = this.seqQueue.toKey(job.id?.toString() || '');
          // this.logger.log(`JOB: ${job.id}`);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  async dispatchPeningBlock() {
    this.logger.log('dispatchPeningBlock');
    const blocks = await this.blockRepository.find({
      where: {
        blockNumber: MoreThan(this.currentPendingBlock),
        blockStatus: BLOCK_STATUS.PROCESSING,
      },
      order: {
        blockNumber: 'asc',
      },
    });
    if (blocks.length) {
      this.logger.log(`dispatchPeningBlock add ${blocks.length} blocks`);
      this.currentPendingBlock = blocks[blocks.length - 1].blockNumber;
      for (let index = 0; index < blocks.length; index++) {
        const block = blocks[index];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.proverQueue.add(block.blockNumber.toString(), block);
      }
    }
  }

  async dispatchProvedBlock() {
    this.logger.log('dispatchProvedBlock');
    const blocks = await this.blockRepository.find({
      where: {
        blockNumber: MoreThan(this.currentProvedBlock),
        blockStatus: BLOCK_STATUS.L2CONFIRMED,
      },
      order: {
        blockNumber: 'asc',
      },
    });
    if (blocks.length) {
      this.logger.log(`dispatchProvedBlock add ${blocks.length} blocks`);
      this.currentProvedBlock = blocks[blocks.length - 1].blockNumber;
      for (let index = 0; index < blocks.length; index++) {
        const block = blocks[index];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.operatorQueue.add(block.blockNumber.toString(), block);
      }
    }
  }
}
