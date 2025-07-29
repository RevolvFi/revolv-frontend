import { Pool } from '@/services/pool/types';
import { BalancerSDK } from '@symmetric-v3/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  ExitParams,
  ExitPoolHandler,
  QueryOutput,
  AmountsOut,
} from './exit-pool.handler';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { bnum, isSameAddress } from '@/lib/utils';
import { flatTokenTree } from '@/composables/usePoolHelpers';
import { getAddress } from '@ethersproject/address';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { erc4626PoolExit } from '@/lib/utils/balancer/erc4626Wrappers';
import { configService } from '@/services/config/config.service';

type BalancerSdkType = ReturnType<typeof getBalancerSDK>;
export type ExitResponse = Awaited<
  ReturnType<BalancerSdkType['pools']['generalisedExit']>
>;
export type ExitInfo = Awaited<
  ReturnType<BalancerSdkType['pools']['getExitInfo']>
>;

/**
 * Handles exits using SDK's generalisedExit function.
 */
export class Erc4626ExitHandler implements ExitPoolHandler {
  private exitTx?: ExitResponse;
  private exitInfo?: ExitInfo;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {
    await this.queryExit(params);

    if (!this.exitTx) {
      throw new Error('Could not query generalised exit');
    }

    const txBuilder = new TransactionBuilder(params.signer);
    const { to, encodedCall } = this.exitTx;

    return txBuilder.raw.sendTransaction({ to, data: encodedCall });
  }

  async queryExit({
    bptIn,
    signer,
    slippageBsp,
    relayerSignature,
  }: ExitParams): Promise<QueryOutput> {
    const evmAmountIn = parseFixed(
      bptIn || '0',
      this.pool.value.onchain?.decimals ?? 18
    );
    if (evmAmountIn.lte(0)) throw new Error('BPT in amount is 0.');

    const signerAddress = await signer.getAddress();
    const slippage = slippageBsp.toString();
    // const isRelayerApproved =
    //   (bptInValid && approvalActions.length === 0) || !!relayerSignature;
    const balancer = getBalancerSDK();

    try {
      console.log('relayerSignature', relayerSignature);
      this.exitTx = await erc4626PoolExit(
        this.pool.value,
        evmAmountIn.toString(),
        signerAddress,
        slippage,
        signer,
        balancer,
        relayerSignature
      );
    } catch (error) {
      console.error(error);
      console.log('Failed here');
      throw new Error('Failed to query exit.');
    }

    if (!this.exitInfo && !this.exitTx)
      throw new Error('Failed to query exit.');

    const priceImpact: number = bnum(
      formatFixed(this.exitTx?.priceImpact, 18)
    ).toNumber();

    return {
      priceImpact,
      amountsOut: this.formatAmountsOut(
        this.exitTx?.expectedAmountsOut,
        this.exitTx?.tokensOut
      ),
      txReady: !!this.exitTx,
    };
  }

  /**
   * PRIVATE METHODS
   */
  private formatAmountsOut(
    expectedAmountsOut: string[],
    tokensOut: string[]
  ): AmountsOut {
    const amountsOut: AmountsOut = {};
    const allPoolTokens = flatTokenTree(this.pool.value);
    const erc4626Pool =
      configService.network.pools?.Erc4626?.[this.pool.value.id];

    expectedAmountsOut.forEach((amount, i) => {
      const tokenAddress = tokensOut[i];
      let token;

      if (erc4626Pool) {
        // Check if this is an underlying token
        const underlyingIndex = erc4626Pool.underlying.findIndex(addr =>
          isSameAddress(addr, tokenAddress)
        );

        if (underlyingIndex >= 0) {
          // For underlying tokens, use the wrapper's decimals
          token = allPoolTokens.find(poolToken =>
            isSameAddress(
              poolToken.address,
              erc4626Pool.wrappers[underlyingIndex]
            )
          );
        }
      }

      // If not found as underlying, look in pool tokens
      if (!token) {
        token = allPoolTokens.find(poolToken =>
          isSameAddress(poolToken.address, tokenAddress)
        );
      }

      if (token) {
        const realAddress = getAddress(tokenAddress);
        const scaledAmount = formatFixed(
          amount,
          token.decimals ?? 18
        ).toString();
        amountsOut[realAddress] = scaledAmount;
      }
    });

    return amountsOut;
  }
}
