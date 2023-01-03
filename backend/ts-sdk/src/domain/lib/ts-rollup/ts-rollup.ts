import { TsAccountLeafType, TsTokenLeafType } from '../ts-types/ts-merkletree.types';

export type TsRollupConfigType = {
  order_tree_height: number;
  l2_acc_addr_size: number;
  l2_token_addr_size: number;
  nullifier_tree_height: number;
  numOfChunks: number;

  numOfReqs: number;
  register_batch_size: number;
  token_tree_height: number;
  auction_market_count: number;
  auction_lender_count: number;
  auction_borrower_count: number;
};

export interface CircuitAccountTxPayload {
  r_accountLeafId: any[];
  r_oriAccountLeaf: Array<TsAccountLeafType>;
  r_newAccountLeaf: Array<TsAccountLeafType>;
  r_accountRootFlow: any[];
  r_accountMkPrf: Array<string[]>;
  r_tokenLeafId: Array<string[]>;
  r_oriTokenLeaf: TsTokenLeafType[];
  r_newTokenLeaf: TsTokenLeafType[];
  r_tokenRootFlow: Array<string[]>;
  r_tokenMkPrf: Array<string[]>;
}
export interface CircuitOrderTxPayload {
  r_orderLeafId: Array<[string]>;
  r_oriOrderLeaf: Array<string[] | bigint[]>;
  r_newOrderLeaf: Array<string[] | bigint[]>;
  r_orderRootFlow: Array<string[]>;
  r_orderMkPrf: Array<string[]>;
}

export interface CircuitNullifierTxPayload {
  r_nullifierLeafId: string[];
  r_oriNullifierLeaf: Array<string[] | bigint[]>;
  r_newNullifierLeaf: Array<string[] | bigint[]>;
  r_nullifierRootFlow: string[];
  r_nullifierMkPrf: Array<string[]>;
}

export enum RollupStatus {
  Unknown = 0,
  Idle,
  Running,
}

export enum RollupCircuitType {
  Unknown = 0,
  Register = 1,
  Transfer = 2,
}
