import {
  PoolFilter,
  SOR as SORV2,
  SubgraphPoolBase,
  SwapInfo,
  SwapOptions,
  SwapTypes,
} from '@symmetric-v3/sdk';
import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';
import { Provider } from '@ethersproject/providers';

import {
  NATIVE_ASSET_ADDRESS,
  WRAPPED_NATIVE_ASSET_ADDRESS,
} from '@/constants/tokens';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import { captureBalancerException } from '@/lib/utils/errors';
import { convertERC4626Wrap } from '@/lib/utils/balancer/erc4626Wrappers';
import { configService } from '@/services/config/config.service';

const SWAP_COST = import.meta.env.VITE_SWAP_COST || '100000';

export interface SorReturn {
  tokenIn: string;
  tokenOut: string;
  returnDecimals: number;
  hasSwaps: boolean;
  returnAmount: BigNumber;
  marketSpNormalised: string;
  result: SwapInfo;
}

interface FetchStatus {
  v2finishedFetch: boolean;
  v2success: boolean;
}

/*
Aims to manage liquidity using SOR.
*/
export class SorManager {
  private sorV2: SORV2;
  private fetchStatus: FetchStatus = {
    v2finishedFetch: false,
    v2success: false,
  };
  private isFetching: boolean;
  maxPools: number;
  gasPrice: BigNumber;
  selectedPools: SubgraphPoolBase[] = [];

  constructor(provider: Provider, gasPrice: BigNumber, maxPools: number) {
    this.sorV2 = getBalancerSDK().sor;
    this.gasPrice = gasPrice;
    this.maxPools = maxPools;
    this.isFetching = false;
  }

  // Uses SOR V2 to retrieve the cost
  // If previously called the cached value will be used.
  async setCostOutputToken(
    tokenAddr: string,
    tokenDecimals: number,
    manualCost: string | null = null
  ): Promise<BigNumber> {
    tokenAddr =
      tokenAddr === NATIVE_ASSET_ADDRESS
        ? WRAPPED_NATIVE_ASSET_ADDRESS
        : tokenAddr;

    if (manualCost) {
      await this.sorV2.swapCostCalculator.setNativeAssetPriceInToken(
        tokenAddr,
        manualCost
      );
    }

    const cost = await this.sorV2.getCostOfSwapInToken(
      tokenAddr,
      tokenDecimals,
      this.gasPrice,
      BigNumber.from(SWAP_COST)
    );

    console.log(`[SorManager] Cost for token ${tokenAddr}: ${cost.toString()}`);

    return cost;
  }

  // This fetches ALL pool with onchain info.
  async fetchPools(): Promise<void> {
    if (this.isFetching) {
      return;
    }
    this.isFetching = true;

    // This will catch any error fetching Subgraph or onChain data with V2
    console.time('[SorManager] fetchPools');
    try {
      // Fetch of all pools from V2 subgraph and pull onchain data
      const v2result = await this.sorV2.fetchPools();
      console.log('v2Result: ', v2result);
      this.fetchStatus.v2finishedFetch = true;
      this.fetchStatus.v2success = v2result;

      if (!v2result) {
        captureBalancerException({
          error: new Error('SOR Fetch pools failed'),
          context: {
            level: 'fatal',
          },
        });
      }
    } catch (err) {
      console.log(
        `[SorManager] V2 fetchPools issue: ${(err as Error).message}`
      );
      this.fetchStatus.v2finishedFetch = true;
      this.fetchStatus.v2success = false;

      captureBalancerException({
        error: err,
        msgPrefix: 'SORFetchPools',
        context: { level: 'fatal' },
      });
    }
    console.log(
      `[SorManager] V2 fetchPools result: ${this.fetchStatus.v2success}`
    );
    console.timeEnd(`[SorManager] V2 fetchPools`);

    this.selectedPools = this.sorV2.getPools();
    this.isFetching = false;
  }
  // Format best swap result
  async getBestSwap(
    tokenIn: string,
    tokenOut: string,
    tokenInDecimals: number,
    tokenOutDecimals: number,
    swapType: SwapTypes,
    amountScaled: BigNumber
  ): Promise<SorReturn> {
    const v2TokenIn = tokenIn === NATIVE_ASSET_ADDRESS ? AddressZero : tokenIn;
    const v2TokenOut =
      tokenOut === NATIVE_ASSET_ADDRESS ? AddressZero : tokenOut;

    const timestampSeconds = Math.floor(Date.now() / 1000);

    // The poolTypeFilter can be used to filter to different pool types. Useful for debug/testing.
    const swapOptions: SwapOptions = {
      maxPools: this.maxPools,
      gasPrice: this.gasPrice,
      swapGas: BigNumber.from(SWAP_COST),
      poolTypeFilter: PoolFilter.All,
      timestamp: timestampSeconds,
      forceRefresh: true,
    };

    // Get wrappers from config for both tokens
    const wrappers = configService.network.tokens.Wrappers || [];
    const vaultsIn = wrappers
      .filter(w => w.underlying.toLowerCase() === v2TokenIn.toLowerCase())
      .map(w => w.wrapper);
    const vaultsOut = wrappers
      .filter(w => w.underlying.toLowerCase() === v2TokenOut.toLowerCase())
      .map(w => w.wrapper);

    console.log('[SorManager] Found vaults', {
      vaultsIn,
      vaultsOut,
    });

    // Create array of all possible token combinations to try
    const tokenInOptions = [v2TokenIn, ...vaultsIn];
    const tokenOutOptions = [v2TokenOut, ...vaultsOut];

    let bestSwapInfo: SwapInfo | null = null;
    let bestReturnAmount = BigNumber.from(0);

    // Try each combination of tokens
    for (const tokenInOption of tokenInOptions) {
      for (const tokenOutOption of tokenOutOptions) {
        try {
          // Convert input amount if using a vault
          let inputAmount = amountScaled;
          if (tokenInOption !== v2TokenIn) {
            const convertedAmount = await convertERC4626Wrap(tokenInOption, {
              amount: amountScaled,
              isWrap: true,
            });
            inputAmount = BigNumber.from(convertedAmount);
          }
          console.table({
            tokenInOption,
            inputAmount: inputAmount.toString(),
            tokenOutOption,
          });

          const swapInfoV2: SwapInfo = await this.sorV2.getSwaps(
            tokenInOption.toLowerCase(),
            tokenOutOption.toLowerCase(),
            swapType,
            inputAmount,
            swapOptions
          );

          // Convert return amount if using a vault
          let returnAmount = swapInfoV2.returnAmount;
          if (tokenOutOption !== v2TokenOut) {
            const convertedAmount = await convertERC4626Wrap(tokenOutOption, {
              amount: swapInfoV2.returnAmount,
              isWrap: false,
            });
            returnAmount = BigNumber.from(convertedAmount);
          }

          // Compare return amounts to find the best route
          if (returnAmount.gt(bestReturnAmount)) {
            bestSwapInfo = swapInfoV2;
            bestReturnAmount = returnAmount;
          }
        } catch (error) {
          // Skip invalid combinations
          continue;
        }
      }
    }

    if (!bestSwapInfo) {
      throw new Error('No valid swap route found');
    }
    console.table({
      tokenIn: v2TokenIn,
      tokenOut: v2TokenOut,
      returnDecimals: tokenOutDecimals,
      hasSwaps: bestSwapInfo.swaps.length > 0,
      returnAmount: bestReturnAmount.toString(),
      marketSpNormalised: bestSwapInfo.marketSp,
    });

    // Return the best swap route found, but keep the original token addresses in the return object
    return {
      tokenIn: v2TokenIn,
      tokenOut: v2TokenOut,
      returnDecimals: tokenOutDecimals,
      hasSwaps: bestSwapInfo.swaps.length > 0,
      returnAmount: bestReturnAmount,
      marketSpNormalised: bestSwapInfo.marketSp,
      result: bestSwapInfo,
    };
  }

  // Check if pool info fetch
  hasPoolData(): boolean {
    if (this.fetchStatus.v2finishedFetch) {
      // TO DO - This could be used to provide more info to UI?
      if (this.fetchStatus.v2success === false) {
        console.log(
          `[SorManager] Error Fetching V2 Pools - No Liquidity Sources.`
        );
        return false;
      }

      return true;
    } else {
      console.log(`[SorManager] Not finished fetching pools.`);
      return false;
    }
  }
}
