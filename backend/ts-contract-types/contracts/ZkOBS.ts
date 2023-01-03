/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export declare namespace Operations {
  export type DepositStruct = {
    accountId: PromiseOrValue<BigNumberish>;
    tokenId: PromiseOrValue<BigNumberish>;
    amount: PromiseOrValue<BigNumberish>;
  };

  export type DepositStructOutput = [number, number, BigNumber] & {
    accountId: number;
    tokenId: number;
    amount: BigNumber;
  };

  export type RegisterStruct = {
    accountId: PromiseOrValue<BigNumberish>;
    l2Addr: PromiseOrValue<BytesLike>;
  };

  export type RegisterStructOutput = [number, string] & {
    accountId: number;
    l2Addr: string;
  };
}

export declare namespace ZkOBS {
  export type StoredBlockStruct = {
    blockNumber: PromiseOrValue<BigNumberish>;
    stateRoot: PromiseOrValue<BytesLike>;
    l1RequestNum: PromiseOrValue<BigNumberish>;
    pendingRollupTxHash: PromiseOrValue<BytesLike>;
    commitment: PromiseOrValue<BytesLike>;
    timestamp: PromiseOrValue<BigNumberish>;
  };

  export type StoredBlockStructOutput = [
    number,
    string,
    BigNumber,
    string,
    string,
    BigNumber
  ] & {
    blockNumber: number;
    stateRoot: string;
    l1RequestNum: BigNumber;
    pendingRollupTxHash: string;
    commitment: string;
    timestamp: BigNumber;
  };

  export type CommitBlockStruct = {
    blockNumber: PromiseOrValue<BigNumberish>;
    newStateRoot: PromiseOrValue<BytesLike>;
    newTsRoot: PromiseOrValue<BytesLike>;
    publicData: PromiseOrValue<BytesLike>;
    publicDataOffsets: PromiseOrValue<BigNumberish>[];
    timestamp: PromiseOrValue<BigNumberish>;
  };

  export type CommitBlockStructOutput = [
    number,
    string,
    string,
    string,
    number[],
    BigNumber
  ] & {
    blockNumber: number;
    newStateRoot: string;
    newTsRoot: string;
    publicData: string;
    publicDataOffsets: number[];
    timestamp: BigNumber;
  };

  export type ProofStruct = {
    a: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>];
    b: [
      [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>],
      [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
    ];
    c: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>];
    commitment: [PromiseOrValue<BigNumberish>];
  };

  export type ProofStructOutput = [
    [BigNumber, BigNumber],
    [[BigNumber, BigNumber], [BigNumber, BigNumber]],
    [BigNumber, BigNumber],
    [BigNumber]
  ] & {
    a: [BigNumber, BigNumber];
    b: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
    c: [BigNumber, BigNumber];
    commitment: [BigNumber];
  };
}

export interface ZkOBSInterface extends utils.Interface {
  functions: {
    "accountIdOf(address)": FunctionFragment;
    "accountNum()": FunctionFragment;
    "addToken(address)": FunctionFragment;
    "checkDepositL1Request((uint32,uint16,uint128),uint64)": FunctionFragment;
    "checkRegisterL1Request((uint32,bytes20),uint64)": FunctionFragment;
    "commitBlocks((uint32,bytes32,uint64,bytes32,bytes32,uint256),(uint32,bytes32,bytes32,bytes,uint32[],uint256)[])": FunctionFragment;
    "committedBlockNum()": FunctionFragment;
    "committedL1RequestNum()": FunctionFragment;
    "depositERC20(address,uint128)": FunctionFragment;
    "depositETH()": FunctionFragment;
    "executedBlockNum()": FunctionFragment;
    "firstL1RequestId()": FunctionFragment;
    "l1RequestQueue(uint64)": FunctionFragment;
    "owner()": FunctionFragment;
    "pendingL1RequestNum()": FunctionFragment;
    "proveBlocks((uint32,bytes32,uint64,bytes32,bytes32,uint256)[],(uint256[2],uint256[2][2],uint256[2],uint256[1])[])": FunctionFragment;
    "provedBlockNum()": FunctionFragment;
    "registerERC20(uint256,uint256,address,uint128)": FunctionFragment;
    "registerETH(uint256,uint256)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "storedBlockHashes(uint32)": FunctionFragment;
    "tokenIdOf(address)": FunctionFragment;
    "tokenNum()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "verifierAddr()": FunctionFragment;
    "wETHAddr()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "accountIdOf"
      | "accountNum"
      | "addToken"
      | "checkDepositL1Request"
      | "checkRegisterL1Request"
      | "commitBlocks"
      | "committedBlockNum"
      | "committedL1RequestNum"
      | "depositERC20"
      | "depositETH"
      | "executedBlockNum"
      | "firstL1RequestId"
      | "l1RequestQueue"
      | "owner"
      | "pendingL1RequestNum"
      | "proveBlocks"
      | "provedBlockNum"
      | "registerERC20"
      | "registerETH"
      | "renounceOwnership"
      | "storedBlockHashes"
      | "tokenIdOf"
      | "tokenNum"
      | "transferOwnership"
      | "verifierAddr"
      | "wETHAddr"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "accountIdOf",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "accountNum",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "addToken",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "checkDepositL1Request",
    values: [Operations.DepositStruct, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "checkRegisterL1Request",
    values: [Operations.RegisterStruct, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "commitBlocks",
    values: [ZkOBS.StoredBlockStruct, ZkOBS.CommitBlockStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "committedBlockNum",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "committedL1RequestNum",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "depositERC20",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "depositETH",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "executedBlockNum",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "firstL1RequestId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "l1RequestQueue",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pendingL1RequestNum",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "proveBlocks",
    values: [ZkOBS.StoredBlockStruct[], ZkOBS.ProofStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "provedBlockNum",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "registerERC20",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "registerETH",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "storedBlockHashes",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenIdOf",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "tokenNum", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "verifierAddr",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "wETHAddr", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "accountIdOf",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "accountNum", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "addToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "checkDepositL1Request",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "checkRegisterL1Request",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "commitBlocks",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "committedBlockNum",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "committedL1RequestNum",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositERC20",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "depositETH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "executedBlockNum",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "firstL1RequestId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "l1RequestQueue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pendingL1RequestNum",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "proveBlocks",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "provedBlockNum",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerERC20",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerETH",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "storedBlockHashes",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tokenIdOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tokenNum", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verifierAddr",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "wETHAddr", data: BytesLike): Result;

  events: {
    "BlockCommitted(uint32)": EventFragment;
    "Deposit(address,uint32,uint16,uint128)": EventFragment;
    "NewL1Request(address,uint64,uint8,bytes)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "Register(address,uint32,uint256,uint256,bytes20)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "BlockCommitted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Deposit"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewL1Request"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Register"): EventFragment;
}

export interface BlockCommittedEventObject {
  blockNumber: number;
}
export type BlockCommittedEvent = TypedEvent<
  [number],
  BlockCommittedEventObject
>;

export type BlockCommittedEventFilter = TypedEventFilter<BlockCommittedEvent>;

export interface DepositEventObject {
  sender: string;
  accountId: number;
  tokenId: number;
  amount: BigNumber;
}
export type DepositEvent = TypedEvent<
  [string, number, number, BigNumber],
  DepositEventObject
>;

export type DepositEventFilter = TypedEventFilter<DepositEvent>;

export interface NewL1RequestEventObject {
  sender: string;
  requestId: BigNumber;
  opType: number;
  pubData: string;
}
export type NewL1RequestEvent = TypedEvent<
  [string, BigNumber, number, string],
  NewL1RequestEventObject
>;

export type NewL1RequestEventFilter = TypedEventFilter<NewL1RequestEvent>;

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface RegisterEventObject {
  sender: string;
  accountId: number;
  tsPubX: BigNumber;
  tsPubY: BigNumber;
  l2Addr: string;
}
export type RegisterEvent = TypedEvent<
  [string, number, BigNumber, BigNumber, string],
  RegisterEventObject
>;

export type RegisterEventFilter = TypedEventFilter<RegisterEvent>;

export interface ZkOBS extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ZkOBSInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    accountIdOf(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[number]>;

    accountNum(overrides?: CallOverrides): Promise<[number]>;

    addToken(
      tokenAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    checkDepositL1Request(
      deposit: Operations.DepositStruct,
      requestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[boolean] & { isExisted: boolean }>;

    checkRegisterL1Request(
      register: Operations.RegisterStruct,
      requestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[boolean] & { isExisted: boolean }>;

    commitBlocks(
      lastCommittedBlock: ZkOBS.StoredBlockStruct,
      newBlocks: ZkOBS.CommitBlockStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    committedBlockNum(overrides?: CallOverrides): Promise<[number]>;

    committedL1RequestNum(overrides?: CallOverrides): Promise<[BigNumber]>;

    depositERC20(
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    depositETH(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    executedBlockNum(overrides?: CallOverrides): Promise<[number]>;

    firstL1RequestId(overrides?: CallOverrides): Promise<[BigNumber]>;

    l1RequestQueue(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string, number] & { hashedPubData: string; opType: number }>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    pendingL1RequestNum(overrides?: CallOverrides): Promise<[BigNumber]>;

    proveBlocks(
      committedBlocks: ZkOBS.StoredBlockStruct[],
      proof: ZkOBS.ProofStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    provedBlockNum(overrides?: CallOverrides): Promise<[number]>;

    registerERC20(
      tsPubX: PromiseOrValue<BigNumberish>,
      tsPubY: PromiseOrValue<BigNumberish>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    registerETH(
      tsPubX: PromiseOrValue<BigNumberish>,
      tsPubY: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    storedBlockHashes(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    tokenIdOf(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[number]>;

    tokenNum(overrides?: CallOverrides): Promise<[number]>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    verifierAddr(overrides?: CallOverrides): Promise<[string]>;

    wETHAddr(overrides?: CallOverrides): Promise<[string]>;
  };

  accountIdOf(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<number>;

  accountNum(overrides?: CallOverrides): Promise<number>;

  addToken(
    tokenAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  checkDepositL1Request(
    deposit: Operations.DepositStruct,
    requestId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  checkRegisterL1Request(
    register: Operations.RegisterStruct,
    requestId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  commitBlocks(
    lastCommittedBlock: ZkOBS.StoredBlockStruct,
    newBlocks: ZkOBS.CommitBlockStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  committedBlockNum(overrides?: CallOverrides): Promise<number>;

  committedL1RequestNum(overrides?: CallOverrides): Promise<BigNumber>;

  depositERC20(
    tokenAddr: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  depositETH(
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  executedBlockNum(overrides?: CallOverrides): Promise<number>;

  firstL1RequestId(overrides?: CallOverrides): Promise<BigNumber>;

  l1RequestQueue(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<[string, number] & { hashedPubData: string; opType: number }>;

  owner(overrides?: CallOverrides): Promise<string>;

  pendingL1RequestNum(overrides?: CallOverrides): Promise<BigNumber>;

  proveBlocks(
    committedBlocks: ZkOBS.StoredBlockStruct[],
    proof: ZkOBS.ProofStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  provedBlockNum(overrides?: CallOverrides): Promise<number>;

  registerERC20(
    tsPubX: PromiseOrValue<BigNumberish>,
    tsPubY: PromiseOrValue<BigNumberish>,
    tokenAddr: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  registerETH(
    tsPubX: PromiseOrValue<BigNumberish>,
    tsPubY: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  storedBlockHashes(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  tokenIdOf(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<number>;

  tokenNum(overrides?: CallOverrides): Promise<number>;

  transferOwnership(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  verifierAddr(overrides?: CallOverrides): Promise<string>;

  wETHAddr(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    accountIdOf(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<number>;

    accountNum(overrides?: CallOverrides): Promise<number>;

    addToken(
      tokenAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    checkDepositL1Request(
      deposit: Operations.DepositStruct,
      requestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    checkRegisterL1Request(
      register: Operations.RegisterStruct,
      requestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    commitBlocks(
      lastCommittedBlock: ZkOBS.StoredBlockStruct,
      newBlocks: ZkOBS.CommitBlockStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    committedBlockNum(overrides?: CallOverrides): Promise<number>;

    committedL1RequestNum(overrides?: CallOverrides): Promise<BigNumber>;

    depositERC20(
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    depositETH(overrides?: CallOverrides): Promise<void>;

    executedBlockNum(overrides?: CallOverrides): Promise<number>;

    firstL1RequestId(overrides?: CallOverrides): Promise<BigNumber>;

    l1RequestQueue(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string, number] & { hashedPubData: string; opType: number }>;

    owner(overrides?: CallOverrides): Promise<string>;

    pendingL1RequestNum(overrides?: CallOverrides): Promise<BigNumber>;

    proveBlocks(
      committedBlocks: ZkOBS.StoredBlockStruct[],
      proof: ZkOBS.ProofStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    provedBlockNum(overrides?: CallOverrides): Promise<number>;

    registerERC20(
      tsPubX: PromiseOrValue<BigNumberish>,
      tsPubY: PromiseOrValue<BigNumberish>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    registerETH(
      tsPubX: PromiseOrValue<BigNumberish>,
      tsPubY: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    storedBlockHashes(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    tokenIdOf(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<number>;

    tokenNum(overrides?: CallOverrides): Promise<number>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    verifierAddr(overrides?: CallOverrides): Promise<string>;

    wETHAddr(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "BlockCommitted(uint32)"(
      blockNumber?: PromiseOrValue<BigNumberish> | null
    ): BlockCommittedEventFilter;
    BlockCommitted(
      blockNumber?: PromiseOrValue<BigNumberish> | null
    ): BlockCommittedEventFilter;

    "Deposit(address,uint32,uint16,uint128)"(
      sender?: PromiseOrValue<string> | null,
      accountId?: null,
      tokenId?: null,
      amount?: null
    ): DepositEventFilter;
    Deposit(
      sender?: PromiseOrValue<string> | null,
      accountId?: null,
      tokenId?: null,
      amount?: null
    ): DepositEventFilter;

    "NewL1Request(address,uint64,uint8,bytes)"(
      sender?: PromiseOrValue<string> | null,
      requestId?: null,
      opType?: null,
      pubData?: null
    ): NewL1RequestEventFilter;
    NewL1Request(
      sender?: PromiseOrValue<string> | null,
      requestId?: null,
      opType?: null,
      pubData?: null
    ): NewL1RequestEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;

    "Register(address,uint32,uint256,uint256,bytes20)"(
      sender?: PromiseOrValue<string> | null,
      accountId?: null,
      tsPubX?: null,
      tsPubY?: null,
      l2Addr?: null
    ): RegisterEventFilter;
    Register(
      sender?: PromiseOrValue<string> | null,
      accountId?: null,
      tsPubX?: null,
      tsPubY?: null,
      l2Addr?: null
    ): RegisterEventFilter;
  };

  estimateGas: {
    accountIdOf(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    accountNum(overrides?: CallOverrides): Promise<BigNumber>;

    addToken(
      tokenAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    checkDepositL1Request(
      deposit: Operations.DepositStruct,
      requestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    checkRegisterL1Request(
      register: Operations.RegisterStruct,
      requestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    commitBlocks(
      lastCommittedBlock: ZkOBS.StoredBlockStruct,
      newBlocks: ZkOBS.CommitBlockStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    committedBlockNum(overrides?: CallOverrides): Promise<BigNumber>;

    committedL1RequestNum(overrides?: CallOverrides): Promise<BigNumber>;

    depositERC20(
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    depositETH(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    executedBlockNum(overrides?: CallOverrides): Promise<BigNumber>;

    firstL1RequestId(overrides?: CallOverrides): Promise<BigNumber>;

    l1RequestQueue(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    pendingL1RequestNum(overrides?: CallOverrides): Promise<BigNumber>;

    proveBlocks(
      committedBlocks: ZkOBS.StoredBlockStruct[],
      proof: ZkOBS.ProofStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    provedBlockNum(overrides?: CallOverrides): Promise<BigNumber>;

    registerERC20(
      tsPubX: PromiseOrValue<BigNumberish>,
      tsPubY: PromiseOrValue<BigNumberish>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    registerETH(
      tsPubX: PromiseOrValue<BigNumberish>,
      tsPubY: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    storedBlockHashes(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenIdOf(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenNum(overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    verifierAddr(overrides?: CallOverrides): Promise<BigNumber>;

    wETHAddr(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    accountIdOf(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    accountNum(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    addToken(
      tokenAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    checkDepositL1Request(
      deposit: Operations.DepositStruct,
      requestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    checkRegisterL1Request(
      register: Operations.RegisterStruct,
      requestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    commitBlocks(
      lastCommittedBlock: ZkOBS.StoredBlockStruct,
      newBlocks: ZkOBS.CommitBlockStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    committedBlockNum(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    committedL1RequestNum(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    depositERC20(
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    depositETH(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    executedBlockNum(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    firstL1RequestId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    l1RequestQueue(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pendingL1RequestNum(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    proveBlocks(
      committedBlocks: ZkOBS.StoredBlockStruct[],
      proof: ZkOBS.ProofStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    provedBlockNum(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    registerERC20(
      tsPubX: PromiseOrValue<BigNumberish>,
      tsPubY: PromiseOrValue<BigNumberish>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    registerETH(
      tsPubX: PromiseOrValue<BigNumberish>,
      tsPubY: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    storedBlockHashes(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokenIdOf(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokenNum(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    verifierAddr(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    wETHAddr(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
