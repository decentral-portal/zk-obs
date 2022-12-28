/* eslint-disable @typescript-eslint/no-empty-interface */
import { PromiEvent, TransactionReceipt, Web3ContractContext } from 'ethereum-abi-types-generator';
import { BigNumber, Contract } from 'ethers';

export interface CallOptions {
  from?: string;
  gasPrice?: string;
  gas?: number;
}

export interface SendOptions {
  from: string;
  value?: number | string | BigNumber;
  gasPrice?: string;
  gas?: number;
}

export interface EstimateGasOptions {
  from?: string;
  value?: number | string | BigNumber;
  gas?: number;
}

export interface MethodPayableReturnContext {
  send(options: SendOptions): PromiEvent<TransactionReceipt>;
  send(options: SendOptions, callback: (error: Error, result: any) => void): PromiEvent<TransactionReceipt>;
  estimateGas(options: EstimateGasOptions): Promise<number>;
  estimateGas(options: EstimateGasOptions, callback: (error: Error, result: any) => void): Promise<number>;
  encodeABI(): string;
}

export interface MethodConstantReturnContext<TCallReturn> {
  call(): Promise<TCallReturn>;
  call(options: CallOptions): Promise<TCallReturn>;
  call(options: CallOptions, callback: (error: Error, result: TCallReturn) => void): Promise<TCallReturn>;
  encodeABI(): string;
}

export type MethodReturnContext = MethodPayableReturnContext

export type ContractContext = Web3ContractContext<
  VerifierContract,
  VerifierContractMethodNames,
  VerifierContractEventsContext,
  VerifierContractEvents
>;
export type VerifierContractEvents = undefined;
export interface VerifierContractEventsContext {}
export type VerifierContractMethodNames = 'verifyProof';
export interface VerifierContract extends Contract {
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param a Type: uint256[2], Indexed: false
   * @param b Type: uint256[2][2], Indexed: false
   * @param c Type: uint256[2], Indexed: false
   * @param input Type: uint256[9], Indexed: false
   */
  verifyProof(
    a: [string, string, string],
    b: [string, string, string][],
    c: [string, string, string],
    input: [string, string, string, string, string, string, string, string, string, string],
    call?: SendOptions,
  ): PromiEvent<TransactionReceipt>;
}
