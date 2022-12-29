import { TsWorkerName } from '@ts-sdk/constant';
import { Record, String } from 'runtypes';

const TsWorkerNameBrand = String.withConstraint((s) => Object.values(TsWorkerName).includes(s as TsWorkerName));

export enum ClusterMessageType {
  UNKNOWN,
  START,
  READY,
  ALL_READY,
  STOP,
  MESSAGE,

}

export const ClusterMessageEventPayload = Record({
  from: TsWorkerNameBrand,
  to: TsWorkerNameBrand,
  // payload: any,
});

export type ClusterMessageEventPayload = {
  from: TsWorkerName;
  to: TsWorkerName;
  type: ClusterMessageType,
  message?: string;
  data?: any;
}