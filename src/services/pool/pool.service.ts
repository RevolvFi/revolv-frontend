import { differenceInWeeks } from 'date-fns';

import { isStable } from '@/composables/usePoolHelpers';
import { oneSecondInMs } from '@/composables/useTime';
import { bnum } from '@/lib/utils';
import {
  OnchainPoolData,
  Pool,
  PoolToken,
  RawOnchainPoolData,
} from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';

import { OnchainDataFormater } from './decorators/onchain-data.formater';
import { AprBreakdown } from '@symmetric-v3/sdk';
import useNetwork, { networkId } from '@/composables/useNetwork';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';
// import { Pool as SDKPool } from '@symmetric-v3/sdk';
import { captureBalancerException } from '@/lib/utils/errors';
import { formatUnits } from '@ethersproject/units';
import { subgraphRequest } from '@/lib/utils/subgraph';
// import { telosVotingPools } from '@/components/contextual/pages/vebal/LMVoting/telos-voting-pools';
import { configService } from '../config/config.service';

export default class PoolService {
  REWARD_PRICE: number | undefined;
  constructor(public pool: Pool) {
    this.format();
  }

  /**
   * @summary Statically format various pool attributes.
   */
  public format(): Pool {
    this.pool.isNew = this.isNew;
    this.pool.chainId = networkId.value;
    this.formatPoolTokens();
    return this.pool;
  }

  public get bptPrice(): string {
    return bnum(this.pool.totalLiquidity).div(this.pool.totalShares).toString();
  }

  /**
   * @summary Calculates and sets total liquidity of pool.
   */
  public async setTotalLiquidity(): Promise<string> {
    const totalLiquidity = this.pool.totalLiquidity;

    // try {
    //   const sdkTotalLiquidity = await getBalancerSDK().pools.liquidity(
    //     this.pool as unknown as SDKPool
    //   );
    //   // if totalLiquidity can be computed from coingecko prices, use that
    //   // else, use the value retrieved from the subgraph
    //   if (bnum(totalLiquidity).gt(0)) {
    //     totalLiquidity = sdkTotalLiquidity;
    //   }
    // } catch (error) {
    //   captureBalancerException({ error });
    //   console.error(`Failed to calc liquidity for: ${this.pool.id}`, error);
    // }

    return (this.pool.totalLiquidity = totalLiquidity);
  }

  /**
   * @summary Calculates APRs for pool.
   */
  public async setAPR(r?: any): Promise<AprBreakdown> {
    let apr: any = this.pool.apr;
    const breakdown = {} as AprBreakdown;

    try {
      const sdkApr = await getBalancerSDK().pools.apr(this.pool);
      if (sdkApr) apr = sdkApr;
    } catch (error) {
      captureBalancerException({ error });
      console.error(`Failed to calc APR for: ${this.pool.id}`, error);
      apr = {
        swapFees: 0,
        tokenAprs: {
          total: 0,
        },
        stakingApr: {
          min: 0,
          max: 0,
        },
        rewardAprs: {
          total: 0,
        },
        protocolApr: 0,
        min: 0,
        max: 0,
      };
    }
    if (configService.network.chainId === 40) {
      // const killedGauges = telosVotingPools('telos').filter(
      //   pool => pool.gauge.isKilled === true
      // );
      // if (
      //   killedGauges.find(
      //     pool => pool.id.toLowerCase() === this.pool.id.toLowerCase()
      //   )
      // ) {
      apr.stakingApr = {
        min: 0,
        max: 0,
      };
      // }
    }

    if (
      // (rewards && rewards[timestamp] && rewards[timestamp][this.pool.id]) ||
      r &&
      r[this.pool.id]
    ) {
      console.log('has rewards');
      const totalSupply = await gaugeTotalSupply(this.pool.address);
      const totalSupplyUsd = Number(this.bptPrice) * totalSupply;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const poolRewards = r[this.pool.id];

      poolRewards.forEach(reward => {
        console.log(reward);
        const yearlyReward = BigInt(reward.rate) * BigInt(86400) * BigInt(365);

        const rewardData: any = localStorage.getItem('REWARD_PRICE');
        if (rewardData) {
          const data = JSON.parse(rewardData);
          const priceSymbol = reward.tokenSymbol.replace(/-/g, '_');
          if (data[`${priceSymbol}_price`]) {
            const rewardPrice = parseFloat(data[`${priceSymbol}_price`]);
            const yearlyRewardUsd =
              parseFloat(formatUnits(yearlyReward.toString(), 18)) *
              rewardPrice;
            const rewardValue =
              yearlyRewardUsd / parseFloat(totalSupplyUsd.toString());
            const rewardValueScaled = Math.round(10000 * rewardValue);
            apr.rewardAprs = {
              total: apr.rewardAprs.total + rewardValueScaled,
            };
            breakdown[reward.token] = rewardValueScaled;
          }
        }
      });
      apr.rewardAprs.breakdown = breakdown;
    }

    return (this.pool.apr = apr as AprBreakdown);
  }

  formatPoolTokens(): PoolToken[] {
    if (isStable(this.pool.poolType)) return this.pool.tokens;

    return (this.pool.tokens = this.pool.tokens.sort(
      (a, b) => parseFloat(b.weight || '0') - parseFloat(a.weight || '0')
    ));
  }

  public setFeesSnapshot(poolSnapshot: Pool | undefined): string {
    let snapshotFees = '0';
    if (poolSnapshot) snapshotFees = poolSnapshot.totalSwapFee || '0';

    const feesSnapshot = bnum(this.pool.totalSwapFee || 0)
      .minus(snapshotFees)
      .toString();

    return (this.pool.feesSnapshot = feesSnapshot);
  }

  public setVolumeSnapshot(poolSnapshot: Pool | undefined): string {
    let snapshotVolume = '0';
    if (poolSnapshot) snapshotVolume = poolSnapshot.totalSwapVolume || '0';

    const volumeSnapshot = bnum(this.pool.totalSwapVolume || 0)
      .minus(snapshotVolume)
      .toString();

    return (this.pool.volumeSnapshot = volumeSnapshot);
  }

  public setOnchainData(
    rawOnchainData: RawOnchainPoolData,
    tokenMeta: TokenInfoMap
  ): OnchainPoolData | undefined {
    try {
      const onchainData = new OnchainDataFormater(
        this.pool,
        rawOnchainData,
        tokenMeta
      );
      this.pool.isInRecoveryMode = rawOnchainData.isInRecoveryMode;
      this.pool.isPaused = rawOnchainData.isPaused;
      return (this.pool.onchain = onchainData.format());
    } catch (e) {
      console.warn(e);
    }
  }

  public get isNew(): boolean {
    if (!this.pool.createTime) return false;

    return (
      differenceInWeeks(Date.now(), this.pool.createTime * oneSecondInMs) < 1
    );
  }
}

const gaugeTotalSupply = async (poolAddress: string): Promise<number> => {
  try {
    const data = await subgraphRequest<{
      pool: { preferentialGauge: { totalSupply: number } };
    }>({
      url: useNetwork().networkConfig.subgraphs.gauge,
      query: {
        pool: {
          __args: {
            id: poolAddress.toLowerCase(),
          },
          preferentialGauge: {
            totalSupply: true,
          },
        },
      },
    });

    return data.pool.preferentialGauge.totalSupply;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/* The `roundDownTimestamp` function is used to round down a given Unix timestamp to the beginning of
the current week (starting from Thursday). Here's a breakdown of what each step in the function
does: */
// function roundDownTimestamp(timestamp: number): number {
//   const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
//   const day = date.getUTCDay(); // Get the day of the week (0 - Sunday, 1 - Monday, ..., 6 - Saturday)
//   const daysToThursday = (day + 7 - 4) % 7; // Calculate the number of days to Thursday (4 - Thursday)
//   date.setUTCDate(date.getUTCDate() - daysToThursday); // Subtract the number of days to Thursday
//   date.setUTCHours(0, 0, 0, 0); // Set the time to midnight (00:00:00)
//   return Math.floor(date.getTime() / 1000); // Convert back to Unix timestamp in seconds
// }
