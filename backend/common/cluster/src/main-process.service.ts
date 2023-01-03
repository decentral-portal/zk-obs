import type { Cluster } from 'cluster';
import * as _cluster from 'cluster';
const cluster = _cluster as unknown as Cluster;
import { ClusterMessageEventPayload, ClusterMessageType } from '@ts-sdk/domain/events/cluster';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Injectable, Scope } from '@nestjs/common';
import { TsWorkerName, WorkerItem } from '@ts-sdk/constant';
import { getWorkerName } from '@ts-sdk/helper';
import { delay, filter, first, pipe, ReplaySubject, skipUntil } from 'rxjs';

@Injectable({
  scope: Scope.DEFAULT,
})
export class MainProcessService {
  public workerMap: {
    [name: string]: WorkerItem;
  } = {};
  private selfWorkerName: TsWorkerName;
  private workerReadySubject = new ReplaySubject<boolean>(1);
  public isReady = this.workerReadySubject.asObservable();


  constructor(readonly logger: PinoLoggerService) {
    this.selfWorkerName = getWorkerName();
    this.workerReadySubject.next(false);
    this.logger.setContext('MainProcessService');

    this.handleAllWorkerReady();
  }

  handleAllWorkerReady() {
    // TODO: only handle first ?
    this.isReady.pipe(
      filter((isReady) => isReady),
      first(),
      delay(1000 * 3),
    ).subscribe(() => {
      Object.values(this.workerMap).forEach((item) => {
        this.sendMessage({
          from: this.selfWorkerName,
          to: item.name,
          type: ClusterMessageType.READY,
        });
      });
    });
  }

  onReceivedMessage(payload: ClusterMessageEventPayload) {
    this.logger.log({ name: this.selfWorkerName, type: 'message', payload });
    switch (payload.type) {
      case ClusterMessageType.READY:
        // Worker inited -- sendMessage(READY, Core) -> MainProcess -- check All worker ready ->  handleAllWorkerReady -- sendMessage(READY, Worker) -> Worker onReady
        this.getWorker(payload.from).isReady = true;
        const isAllReady = Object.values(this.workerMap).every((item) => item.isReady);
        this.workerReadySubject.next(isAllReady);
        break;
      default:
        break;
    }
  }

  setWorker(name: TsWorkerName, workerItem: WorkerItem) {
    if(!cluster.isPrimary) {
      throw new Error('setWorker() should only be called in primary process');
    }
    this.workerMap[name] = workerItem;
  }
  getWorker(name: TsWorkerName) {
    const worker = this.workerMap[name];
    if(!worker) {
      throw new Error(`worker ${name} is not found`);
    }
    return worker;
  }

  sendMessage(payload: ClusterMessageEventPayload) {
    this.logger.log({ type: 'sendMessage', payload });
    if(payload.to === this.selfWorkerName) {
      this.onReceivedMessage(payload);
      return;
    }
    if(!this.workerMap[payload.to]) {
      this.logger.error(`Worker ${payload.to} not found`);
      // throw new Error(`Worker ${payload.to} not found`);
    } else {
      this.workerMap[payload.to].worker?.send(payload);

    }
  }

  clusterize(workers: WorkerItem[]) {
    if(!cluster.isPrimary) {
      throw new Error('clusterize() should only be called in primary process');
    }
    for (let index = 0; index < workers.length; index++) {
      const item = workers[index];
      this.logger.log(`${TsWorkerName.CORE}: fork cluster ${item.name}`);
      const worker = cluster.fork({
        TS_WORKER_NAME: item.name,
      });
      this.setWorker(item.name, {
        ...item,
        worker,
      });
      worker.once('online', () => {
        this.logger.log(`Worker ${item.name}-${worker.process.pid} online!`);
      });
      worker.once('exit', () => {
        this.logger.error(`Worker ${item.name}-${worker.process.pid} died.`);
      });
      worker.on('message', this.sendMessage.bind(this));
    }
  }
  
}