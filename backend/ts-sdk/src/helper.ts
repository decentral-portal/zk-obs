import { TsWorkerName } from '@ts-sdk/constant';

export function getProcessName() {
  return `${getWorkerName()}-${process.pid}`;
}

export function getWorkerName(): TsWorkerName {
  return process.env.TS_WORKER_NAME as TsWorkerName;
}


export function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}