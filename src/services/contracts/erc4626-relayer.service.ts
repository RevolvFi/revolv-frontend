import { TransactionResponse } from '@ethersproject/abstract-provider';
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
import { BigNumber } from '@ethersproject/bignumber';
import { ERC4626SingleSwap } from '../swap/swap.service';
import { SorSwapInfo } from '@/lib/utils/balancer/helpers/sor/sorManager';

const relayerInterface = BalancerRelayer__factory.createInterface();

/**
 * Service for handling ERC4626 wrapper operations through the Balancer relayer
 */
export default class Erc4626RelayerService {
  private readonly batchRelayerService: BatchRelayerService;

  constructor(
    private readonly config: ConfigService = configService,
    private readonly walletService: WalletService = walletServiceInstance
  ) {
    this.batchRelayerService = new BatchRelayerService();
  }

  get address(): string {
    return this.config.network.addresses.batchRelayer || '';
  }

  /**
   * Execute a single swap with optional ERC4626 wrapper support
   */
  public async swap(
    single: ERC4626SingleSwap,
    funds: FundManagement,
    tokenOutAmount: string,
    transactionDeadline: number,
    options: Record<string, any> = {},
    relayerSignature?: string
  ): Promise<TransactionResponse> {
    const deadline = calculateValidTo(transactionDeadline);
    const userAddress = funds.recipient;
    const calls: string[] = [];

    // Add relayer approval if signature provided
    if (relayerSignature) {
      calls.push(this.createRelayerApprovalCall(relayerSignature));
    }

    // Handle input token wrapping if needed
    if (isERC4626Wrapper(single.assetIn)) {
      const wrapCall = await this.createInputWrapCall(single, funds.sender);
      calls.push(wrapCall);
    }

    // Prepare swap parameters
    const swapParams = this.prepareSwapParameters(single, funds);

    // Create and execute swap
    const swapCall = this.createSwapCall(
      swapParams,
      tokenOutAmount,
      deadline,
      options
    );
    calls.push(swapCall);

    // Handle output token unwrapping if needed
    if (isERC4626Wrapper(single.assetOut)) {
      const unwrapCall = this.createOutputUnwrapCall(
        single.assetOut,
        userAddress
      );
      calls.push(unwrapCall);
    }

    return this.executeMulticall(calls);
  }

  /**
   * Execute a batch swap with optional ERC4626 wrapper support
   */
  public async batchSwap(
    swapKind: SwapType,
    swapInfo: SorSwapInfo,
    funds: FundManagement,
    limits: string[],
    transactionDeadline: number,
    options: Record<string, any> = {},
    relayerSignature?: string
  ): Promise<TransactionResponse> {
    const deadline = calculateValidTo(transactionDeadline);
    const userAddress = funds.recipient;
    const calls: string[] = [];

    // Add relayer approval if signature provided
    if (relayerSignature) {
      calls.push(this.createRelayerApprovalCall(relayerSignature));
    }

    // Handle input token wrapping if needed
    if (isERC4626Wrapper(swapInfo.tokenIn)) {
      const wrapCalls = await this.createBatchInputWrapCalls(
        swapInfo,
        funds.sender
      );
      calls.push(...wrapCalls);
    }

    // Prepare batch swap parameters
    const batchSwapParams = this.prepareBatchSwapParameters(swapInfo, funds);

    // Create and execute batch swap
    const batchSwapCall = this.createBatchSwapCall(
      batchSwapParams,
      limits,
      deadline,
      swapKind,
      options
    );
    calls.push(batchSwapCall);

    // Handle output token unwrapping if needed
    if (isERC4626Wrapper(swapInfo.tokenOut)) {
      const unwrapCall = this.createOutputUnwrapCall(
        swapInfo.tokenOut,
        userAddress
      );
      calls.push(unwrapCall);
    }

    return this.executeMulticall(calls);
  }

  /**
   * Create relayer approval call
   */
  private createRelayerApprovalCall(relayerSignature: string): string {
    return Relayer.encodeSetRelayerApproval(
      this.address,
      true,
      relayerSignature
    );
  }

  /**
   * Create input token wrap call for single swap
   */
  private async createInputWrapCall(
    single: ERC4626SingleSwap,
    sender: string
  ): Promise<string> {
    // const underlyingAmount = await convertERC4626Wrap(single.assetIn, {
    //   amount: BigNumber.from(single.amount),
    //   isWrap: false, // Convert wrapper shares to underlying
    // });
    if (!single.tokenInUnderlyingAmount) {
      throw new Error('Token in underlying amount is required');
    }

    const underlyingAmount = single.tokenInUnderlyingAmount;

    return this.batchRelayerService.erc4626EncodeWrap({
      wrappedToken: single.assetIn,
      sender,
      recipient: this.address,
      amount: underlyingAmount,
      outputReference: this.batchRelayerService.toChainedReference(10),
    });
  }

  /**
   * Create input token wrap calls for batch swap
   */
  private async createBatchInputWrapCalls(
    swapInfo: SorSwapInfo,
    sender: string
  ): Promise<string[]> {
    const inputAssetIndex = swapInfo.tokenAddresses.indexOf(swapInfo.tokenIn);
    const swapsUsingInputAsset = swapInfo.swaps.filter(
      swap => swap.assetInIndex === inputAssetIndex
    );

    if (!swapInfo.tokenInUnderlyingAmount) {
      throw new Error('Token in underlying amount is required');
    }

    const totalUnderlyingAmount = swapInfo.tokenInUnderlyingAmount;
    const totalWrapperShares = swapsUsingInputAsset.reduce(
      (sum, swap) => sum.add(BigNumber.from(swap.amount)),
      BigNumber.from(0)
    );

    const wrapCalls: string[] = [];

    let remainingUnderlying = totalUnderlyingAmount;

    for (let i = 0; i < swapsUsingInputAsset.length; i++) {
      const swap = swapsUsingInputAsset[i];
      const swapWrapperShares = BigNumber.from(swap.amount);
      const isLastSwap = i === swapsUsingInputAsset.length - 1;

      let swapUnderlyingAmount: BigNumber;

      if (isLastSwap) {
        // Use remaining amount for the last swap to avoid rounding errors
        swapUnderlyingAmount = remainingUnderlying;
      } else {
        // Calculate this swap's portion of the underlying tokens
        swapUnderlyingAmount = swapWrapperShares
          .mul(totalUnderlyingAmount)
          .div(totalWrapperShares);
        remainingUnderlying = remainingUnderlying.sub(swapUnderlyingAmount);
      }

      const wrapCall = this.batchRelayerService.erc4626EncodeWrap({
        wrappedToken: swapInfo.tokenIn,
        sender,
        recipient: this.address,
        amount: swapUnderlyingAmount,
        outputReference: this.batchRelayerService.toChainedReference(10 + i),
      });

      wrapCalls.push(wrapCall);

      // Update swap to use chained reference
      swap.amount = this.batchRelayerService
        .toChainedReference(10 + i)
        .toString();
    }

    return wrapCalls;
  }

  /**
   * Prepare swap parameters for single swap
   */
  private prepareSwapParameters(single: SingleSwap, funds: FundManagement) {
    const modifiedFunds = { ...funds };
    const modifiedSingle = { ...single };

    if (isERC4626Wrapper(single.assetIn)) {
      modifiedFunds.sender = this.address;
      modifiedSingle.amount = this.batchRelayerService
        .toChainedReference(10)
        .toString();
    }

    if (isERC4626Wrapper(single.assetOut)) {
      modifiedFunds.recipient = this.address;
    }

    return { single: modifiedSingle, funds: modifiedFunds };
  }

  /**
   * Prepare batch swap parameters
   */
  private prepareBatchSwapParameters(
    swapInfo: SwapInfo,
    funds: FundManagement
  ) {
    const modifiedFunds = { ...funds };

    if (isERC4626Wrapper(swapInfo.tokenIn)) {
      modifiedFunds.sender = this.address;
    }

    if (isERC4626Wrapper(swapInfo.tokenOut)) {
      modifiedFunds.recipient = this.address;
    }

    return { swapInfo, funds: modifiedFunds };
  }

  /**
   * Create single swap call
   */
  private createSwapCall(
    { single, funds }: { single: SingleSwap; funds: FundManagement },
    tokenOutAmount: string,
    deadline: number,
    options: Record<string, any> = {}
  ): string {
    return Relayer.encodeSwap({
      request: single,
      funds,
      limit: tokenOutAmount,
      deadline,
      value: options.value || 0,
      outputReference: this.batchRelayerService.toChainedReference(20),
    });
  }

  /**
   * Create batch swap call
   */
  private createBatchSwapCall(
    { swapInfo, funds }: { swapInfo: SwapInfo; funds: FundManagement },
    limits: string[],
    deadline: number,
    swapKind: SwapType,
    options: Record<string, any> = {}
  ): string {
    return Relayer.encodeBatchSwap({
      swapType: swapKind,
      swaps: swapInfo.swaps,
      assets: swapInfo.tokenAddresses,
      funds,
      limits,
      deadline,
      value: options.value || 0,
      outputReferences: [
        {
          index: swapInfo.tokenAddresses.indexOf(swapInfo.tokenOut),
          key: this.batchRelayerService.toChainedReference(20),
        },
      ],
    });
  }

  /**
   * Create output token unwrap call
   */
  private createOutputUnwrapCall(
    wrapperAddress: string,
    recipient: string
  ): string {
    return this.batchRelayerService.erc4626EncodeUnwrap({
      wrappedToken: wrapperAddress,
      sender: this.address,
      recipient,
      amount: this.batchRelayerService.toChainedReference(20),
      outputReference: 0,
    });
  }

  /**
   * Execute multicall transaction
   */
  private executeMulticall(calls: string[]): Promise<TransactionResponse> {
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
