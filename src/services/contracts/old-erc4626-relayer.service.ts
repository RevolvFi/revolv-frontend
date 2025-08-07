import { TransactionResponse } from '@ethersproject/abstract-provider';
import { ERC4626Relayer__factory } from './ERC4626Relayer__factory';
import { ContractInterface } from '@ethersproject/contracts';
import {
  BalancerRelayer__factory,
  FundManagement,
  Relayer,
  SingleSwap,
  SwapType,
  SwapInfo,
} from '@symmetric-v3/sdk';
import { BatchRelayerService } from '../balancer/batch-relayer/batch-relayer.service';
import { isERC4626Wrapper } from '@/lib/utils/balancer/wrapper';

import WalletService, {
  walletService as walletServiceInstance,
} from '@/services/web3/wallet.service';
import ConfigService, { configService } from '../config/config.service';
import { calculateValidTo } from '../cowswap/utils';
import { convertERC4626Wrap } from '@/lib/utils/balancer/erc4626Wrappers';
import { BigNumber } from '@ethersproject/bignumber';

const relayerInterface = BalancerRelayer__factory.createInterface();

export default class Erc4626RelayerService {
  abi: ContractInterface;
  private readonly batchRelayerService: BatchRelayerService;

  constructor(
    private readonly config: ConfigService = configService,
    private readonly walletService: WalletService = walletServiceInstance
  ) {
    this.abi = ERC4626Relayer__factory.abi;
    this.batchRelayerService = new BatchRelayerService();
  }

  get address() {
    return this.config.network.addresses.batchRelayer || '';
  }

  public async swap(
    single: SingleSwap,
    funds: FundManagement,
    tokenOutAmount: string,
    transactionDeadline: number,
    relayerSignature: string | undefined = undefined
  ): Promise<TransactionResponse> {
    const deadline = calculateValidTo(transactionDeadline);
    const userAddress = funds.recipient;

    const calls: string[] = [];

    if (relayerSignature) {
      calls.push(
        Relayer.encodeSetRelayerApproval(this.address, true, relayerSignature)
      );
    }

    // Wrap
    const assetInIsVaultToken = isERC4626Wrapper(single.assetIn);
    // wrap input if vault token
    if (assetInIsVaultToken) {
      // Convert wrapper shares to underlying tokens
      const underlyingAmount = await convertERC4626Wrap(single.assetIn, {
        amount: BigNumber.from(single.amount),
        isWrap: false, // Convert wrapper shares to underlying
      });

      const encodedCall = this.batchRelayerService.erc4626EncodeWrap({
        wrappedToken: single.assetIn,
        sender: funds.sender,
        recipient: this.address,
        amount: underlyingAmount,
        outputReference: this.batchRelayerService.toChainedReference(10),
      });

      calls.push(encodedCall);
    }

    let encodedUnwrap: string | undefined = undefined;

    const assetOutIsVaultToken = isERC4626Wrapper(single.assetOut);

    // // Swap
    if (assetInIsVaultToken) {
      funds.sender = '0x797129f28d844E47073DC4E92907079BDAcAFe65';
      single.amount = this.batchRelayerService.toChainedReference(10);
    }

    if (assetOutIsVaultToken) {
      funds.recipient = '0x797129f28d844E47073DC4E92907079BDAcAFe65';
    }

    // Encode swap
    const encodedSwap = Relayer.encodeSwap({
      request: single,
      funds,
      limit: tokenOutAmount,
      deadline,
      value: 0,
      outputReference: this.batchRelayerService.toChainedReference(20),
    });
    console.log('encodedSwap', encodedSwap);
    calls.push(encodedSwap);

    // Unwrap
    if (assetOutIsVaultToken) {
      console.log('assetOutIsVaultToken', assetOutIsVaultToken);
      encodedUnwrap = this.batchRelayerService.erc4626EncodeUnwrap({
        wrappedToken: single.assetOut,
        sender: this.address,
        recipient: userAddress,
        amount: this.batchRelayerService.toChainedReference(20),
        outputReference: 0,
      });
      console.log('encodedUnwrap', encodedUnwrap);
      calls.push(encodedUnwrap);
    }

    const encodedMulticall = relayerInterface.encodeFunctionData('multicall', [
      calls,
    ]);

    return this.walletService.txBuilder.raw.sendTransaction({
      to: this.address,
      data: encodedMulticall,
    });
  }

  public async batchSwap(
    swapKind: SwapType,
    swapInfo: SwapInfo,
    funds: FundManagement,
    limits: string[],
    transactionDeadline: number,
    relayerSignature: string | undefined = undefined
  ): Promise<TransactionResponse> {
    const deadline = calculateValidTo(transactionDeadline);
    const userAddress = funds.recipient;

    const calls: string[] = [];

    if (relayerSignature) {
      calls.push(
        Relayer.encodeSetRelayerApproval(this.address, true, relayerSignature)
      );
    }

    // Wrap
    const assetInIsVaultToken = isERC4626Wrapper(swapInfo.tokenIn);
    // wrap input if vault token
    if (assetInIsVaultToken) {
      const inputAssetIndex = swapInfo.tokenAddresses.indexOf(swapInfo.tokenIn);
      const swapsUsingInputAsset = swapInfo.swaps.filter(
        swap => swap.assetInIndex === inputAssetIndex
      );

      // Create a separate wrap call for each swap that uses the input asset
      // Each gets its own chained reference
      for (let i = 0; i < swapsUsingInputAsset.length; i++) {
        const swap = swapsUsingInputAsset[i];

        // Convert wrapper shares to underlying tokens
        const underlyingAmount = await convertERC4626Wrap(swapInfo.tokenIn, {
          amount: BigNumber.from(swap.amount),
          isWrap: false, // Convert wrapper shares to underlying
        });

        console.log(
          `Wrap ${i + 1}: amount ${
            swap.amount
          } -> underlying ${underlyingAmount.toString()}`
        );

        const encodedCall = this.batchRelayerService.erc4626EncodeWrap({
          wrappedToken: swapInfo.tokenIn,
          sender: funds.sender,
          recipient: this.address,
          amount: underlyingAmount,
          outputReference: this.batchRelayerService.toChainedReference(10 + i),
        });
        calls.push(encodedCall);

        // Update the swap to use the corresponding chained reference
        swap.amount = this.batchRelayerService
          .toChainedReference(10 + i)
          .toString();
      }
      funds.sender = this.address;
    }

    const assetOutIsVaultToken = isERC4626Wrapper(swapInfo.tokenOut);

    if (assetOutIsVaultToken) {
      funds.recipient = this.address;
    }

    const encodedSwap = Relayer.encodeBatchSwap({
      swapType: swapKind,
      swaps: swapInfo.swaps,
      assets: swapInfo.tokenAddresses,
      funds,
      limits,
      deadline,
      value: 0,
      outputReferences: [
        {
          index: swapInfo.tokenAddresses.indexOf(swapInfo.tokenOut),
          key: this.batchRelayerService.toChainedReference(20),
        },
      ],
    });

    calls.push(encodedSwap);

    // Unwrap
    if (assetOutIsVaultToken) {
      const encodedUnwrap = this.batchRelayerService.erc4626EncodeUnwrap({
        wrappedToken: swapInfo.tokenOut,
        sender: this.address,
        recipient: userAddress,
        amount: this.batchRelayerService.toChainedReference(20),
        outputReference: 0,
      });
      calls.push(encodedUnwrap);
    }

    const encodedMulticall = relayerInterface.encodeFunctionData('multicall', [
      calls,
    ]);

    return this.walletService.txBuilder.raw.sendTransaction({
      to: this.address,
      data: encodedMulticall,
    });
  }
}

export const erc4626RelayerService = new Erc4626RelayerService();
