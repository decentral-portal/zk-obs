/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomiclabs/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ownable__factory>;
    getContractFactory(
      name: "ERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20__factory>;
    getContractFactory(
      name: "IERC20Metadata",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Metadata__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "ERC20FreeMint",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20FreeMint__factory>;
    getContractFactory(
      name: "IVerifier",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IVerifier__factory>;
    getContractFactory(
      name: "IWETH",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IWETH__factory>;
    getContractFactory(
      name: "PoseidonUnit2",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.PoseidonUnit2__factory>;
    getContractFactory(
      name: "Verifier",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Verifier__factory>;
    getContractFactory(
      name: "WETH9",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.WETH9__factory>;
    getContractFactory(
      name: "ZkOBS",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ZkOBS__factory>;

    getContractAt(
      name: "Ownable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Ownable>;
    getContractAt(
      name: "ERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20>;
    getContractAt(
      name: "IERC20Metadata",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Metadata>;
    getContractAt(
      name: "IERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "ERC20FreeMint",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20FreeMint>;
    getContractAt(
      name: "IVerifier",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IVerifier>;
    getContractAt(
      name: "IWETH",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IWETH>;
    getContractAt(
      name: "PoseidonUnit2",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.PoseidonUnit2>;
    getContractAt(
      name: "Verifier",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Verifier>;
    getContractAt(
      name: "WETH9",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.WETH9>;
    getContractAt(
      name: "ZkOBS",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ZkOBS>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.utils.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
  }
}
