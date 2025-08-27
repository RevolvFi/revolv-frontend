import { BatchSwapStep, SwapType, SwapV2 } from '@symmetric-v3/sdk';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';

import { SorReturn } from '@/lib/utils/balancer/helpers/sor/sorManager';
import {
  SwapService,
  SwapToken,
  SwapTokenType,
} from '@/services/swap/swap.service';
import { useApp } from './useApp';
import { convertERC4626Wrap } from '@/lib/utils/balancer/erc4626Wrappers';
import { configService } from '@/services/config/config.service';

export function useSwapper() {
  /**
   * COMPOSABLES
   */
  const { transactionDeadline } = useApp();

  /**
   * SERVICES
   */
  const swapService = new SwapService(transactionDeadline);

  async function convertAmountIfNeeded(
    amount: BigNumber,
    tokenAddress: string
  ): Promise<BigNumber> {
    // Check if this token is a wrapper for any underlying token
    const wrappers = configService.network.tokens.Wrappers || [];
    const wrapperEntry = wrappers.find(
      w => w.wrapper.toLowerCase() === tokenAddress.toLowerCase()
    );

    if (wrapperEntry) {
      // This is a wrapper token, convert the underlying amount to wrapper amount (wrap it)
      return await convertERC4626Wrap(wrapperEntry.wrapper, {
        amount,
        isWrap: true, // Always wrap underlying to wrapper
      });
    }

    // No conversion needed - if it's an underlying token, we don't convert it
    return amount;
  }

  /**
   * METHODS
   */
  async function swapIn(
    sorReturn: SorReturn,
    tokenInAmount: BigNumber,
    tokenOutAmountMin: BigNumber,
    relayerSignature: string | undefined = undefined,
    isERC4626Swap?: boolean
  ): Promise<TransactionResponse> {
    const tokenInAddress = sorReturn.result.tokenIn;
    const tokenOutAddress = sorReturn.result.tokenOut;

    // Convert amounts if dealing with ERC4626 wrappers
    let convertedTokenInAmount = tokenInAmount;
    let convertedTokenOutAmount = tokenOutAmountMin;

    if (isERC4626Swap) {
      // Convert tokenIn amount if it's an underlying token that needs to be wrapped
      convertedTokenInAmount = await convertAmountIfNeeded(
        tokenInAmount,
        tokenInAddress
      );

      // Convert tokenOut amount if it's an underlying token that needs to be wrapped
      convertedTokenOutAmount = await convertAmountIfNeeded(
        tokenOutAmountMin,
        tokenOutAddress
      );
    }

    const tokenIn: SwapToken = {
      address: tokenInAddress,
      amount: convertedTokenInAmount,
      type: SwapTokenType.fixed,
    };

    const tokenOut: SwapToken = {
      address: tokenOutAddress,
      amount: convertedTokenOutAmount,
      type: SwapTokenType.min,
    };

    console.log('PERFORM SWAP', {
      originalTokenInAmount: tokenInAmount.toString(),
      convertedTokenInAmount: convertedTokenInAmount.toString(),
      originalTokenOutAmount: tokenOutAmountMin.toString(),
      convertedTokenOutAmount: convertedTokenOutAmount.toString(),
      isERC4626Swap,
    });
    if (isERC4626Swap) {
      return swapService.erc4626BatchSwap(
        tokenIn,
        tokenOut,
        sorReturn.result,
        relayerSignature
      );
    }

    return swapService.batchSwapV2(
      tokenIn,
      tokenOut,
      sorReturn.result.swaps,
      sorReturn.result.tokenAddresses
    );
  }

  async function swapOut(
    sorReturn: SorReturn,
    tokenInAmountMax: BigNumber,
    tokenOutAmount: BigNumber,
    isERC4626Swap?: boolean
  ): Promise<TransactionResponse> {
    const tokenInAddress = sorReturn.result.tokenIn;
    const tokenOutAddress = sorReturn.result.tokenOut;

    // Convert amounts if dealing with ERC4626 wrappers
    let convertedTokenInAmount = tokenInAmountMax;
    let convertedTokenOutAmount = tokenOutAmount;

    if (isERC4626Swap) {
      // Convert tokenIn amount if it's an underlying token that needs to be wrapped
      convertedTokenInAmount = await convertAmountIfNeeded(
        tokenInAmountMax,
        tokenInAddress
      );

      // Convert tokenOut amount if it's an underlying token that needs to be wrapped
      convertedTokenOutAmount = await convertAmountIfNeeded(
        tokenOutAmount,
        tokenOutAddress
      );
    }

    const tokenIn: SwapToken = {
      address: tokenInAddress,
      amount: convertedTokenInAmount,
      type: SwapTokenType.max,
    };

    const tokenOut: SwapToken = {
      address: tokenOutAddress,
      amount: convertedTokenOutAmount,
      type: SwapTokenType.fixed,
    };

    console.log('PERFORM SWAP OUT', {
      originalTokenInAmount: tokenInAmountMax.toString(),
      convertedTokenInAmount: convertedTokenInAmount.toString(),
      originalTokenOutAmount: tokenOutAmount.toString(),
      convertedTokenOutAmount: convertedTokenOutAmount.toString(),
      isERC4626Swap,
    });

    return swapService.batchSwapV2(
      tokenIn,
      tokenOut,
      sorReturn.result.swaps,
      sorReturn.result.tokenAddresses
    );
  }

  async function boostedJoinBatchSwap(
    swaps: SwapV2[],
    tokenAddresses: string[],
    tokenOutAddress: string,
    amountsInMap: Record<string, BigNumber>,
    amountOutMin: BigNumber
  ) {
    const tokensIn: SwapToken[] = Object.entries(amountsInMap).map(
      ([address, amount]) => {
        return {
          address,
          amount,
          type: SwapTokenType.fixed,
        };
      }
    );
    const tokenOut: SwapToken = {
      address: tokenOutAddress,
      amount: amountOutMin,
      type: SwapTokenType.min,
    };
    return swapService.boostedJoinBatchSwap(
      tokensIn,
      tokenOut,
      swaps,
      tokenAddresses
    );
  }

  async function boostedExitBatchSwap(
    swaps: BatchSwapStep[],
    tokenAddresses: string[],
    tokenInAddress: string,
    amountIn: string,
    amountsOutMap: Record<string, string>,
    swapKind: SwapType = SwapType.SwapExactIn
  ): Promise<TransactionResponse> {
    const tokenIn: SwapToken = {
      address: tokenInAddress,
      amount: BigNumber.from(amountIn),
      type: SwapTokenType.min,
    };

    const tokensOut: SwapToken[] = Object.entries(amountsOutMap).map(
      ([address, amount]) => {
        return {
          address,
          amount: BigNumber.from(amount),
          type: SwapTokenType.fixed,
        };
      }
    );
    return swapService.boostedExitBatchSwap(
      tokenIn,
      tokensOut,
      swaps,
      tokenAddresses,
      swapKind
    );
  }

  return { swapIn, swapOut, boostedJoinBatchSwap, boostedExitBatchSwap };
}
