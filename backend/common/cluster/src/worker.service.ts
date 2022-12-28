import * as _cluster from 'cluster';
import type { Cluster } from 'cluster';
import { ReplaySubject } from 'rxjs';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { ClusterMessageEventPayload, ClusterMessageType } from '@ts-sdk/domain/events/cluster';
import { Injectable, Scope } from '@nestjs/common';
import { TsWorkerName } from '@ts-sdk/constant';
import { getWorkerName } from '@ts-sdk/helper';
const cluster = _cluster as unknown as Cluster;

@Injectable({
  scope: Scope.DEFAULT,
})
export class WorkerService {
  isListening = false;
  public workerName: TsWorkerName;
  private workerReadySubject = new ReplaySubject(1);
  public onReadyObserver = this.workerReadySubject.asObservable();
  
  constructor(
    readonly logger: PinoLoggerService,
  ) {
    this.workerName = getWorkerName();
    if(!cluster.isPrimary){
      this.startListen();
    }
  }

  onReceivedMessage(payload: ClusterMessageEventPayload) {
    this.logger.log({
      msg: 'ON MESSAGE', workerName: this.workerName, payload
    });
    switch (payload.type) {
      case ClusterMessageType.READY:
        this.workerReadySubject.next(true);
        this.workerReadySubject.complete();
        break;
    }
  }

  startListen() {
    if(this.isListening) {
      throw new Error('WorkerService is already listening');
    }
    this.logger.debug('ON LISTEN', this.workerName);
    process.on('message', (payload: ClusterMessageEventPayload) => {
      if(payload.to === this.workerName) {
        this.onReceivedMessage(payload);
      } else {
        throw new Error(`message send to wrong Worker to=${payload.to}, current=${this.workerName}`);
      }
    });
  }

  sendMessage(payload: Omit<ClusterMessageEventPayload, 'from'>) {
    if(process?.send) {
      process.send({
        from: this.workerName,
        ...payload,
      });
      return;
    }
    throw new Error('process.send is not defined');
  }

  ready() {
    this.sendMessage({
      to: TsWorkerName.CORE,
      type: ClusterMessageType.READY,
    });
  }

  stop() {
    this.sendMessage({
      to: TsWorkerName.CORE,
      type: ClusterMessageType.STOP,
    });
  }

}