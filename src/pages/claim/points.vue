<script lang="ts" setup>
import { computed, watch } from 'vue';

import PointsRewardsTable from '@/components/tables/PointsRewardsTable.vue';
import Leaderboard from '@/components/points/Leaderboard.vue';

import { GaugePool } from '@/composables/useClaimsData';
import { usePointsClaimsData } from '@/composables/usePointsClaimsData';
import { useTokens } from '@/providers/tokens.provider';

import { PointsGauge } from '@/services/balancer/gauges/types';
//import { configService } from '@/services/config/config.service';

import useWeb3 from '@/services/web3/useWeb3';
import { networkSlug } from '@/composables/useNetwork';
//import { bnum } from '@/lib/utils';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import {
  isLpVaultPool,
  orderedTokenAddresses,
} from '@/composables/usePoolHelpers';
import { PoolToken } from '@/services/pool/types';
import router from '@/plugins/router';
import { BigNumber } from '@ethersproject/bignumber';
import useLpVaultQuery from '@/composables/queries/useLPVaultLockInfoQuery';
import useOldLpVaultQuery from '@/composables/queries/useOldLPVaultLockInfoQuery';
/**
 * TYPES
 */
// type PointsGaugeTable = {
//   gauge: PointsGauge;
//   pool: GaugePool;
// };

/**
 * COMPOSABLES
 */
const { getToken, injectTokens } = useTokens();

const { isWalletReady } = useWeb3();

const {
  gauges: pointsGauges,
  gaugePools: pointsGaugePools,
  lpVaultRewards,
  isLoading: isPointsClaimsLoading,
} = usePointsClaimsData();

const lpVaultLockInfoQuery = useLpVaultQuery();
const oldLpVaultLockInfoQuery = useOldLpVaultQuery();
const lpVaultQueryLoading = computed(
  () => lpVaultLockInfoQuery.isLoading.value
);
const lpVaultLockInfo = computed(() => lpVaultLockInfoQuery.data.value);
const oldLpVaultLockInfo = computed(() => oldLpVaultLockInfoQuery.data.value);
const lpVaultPoints = computed(() => {
  return (
    lpVaultRewards.value?.v2V2?.[
      '0xAA60Afa2FceC38EE762c52135f6Cbb22D8128DD7'
    ] ?? '0'
  );
});

const oldLpVaultPoints = computed(() => {
  return (
    lpVaultRewards.value?.v2?.['0xAA60Afa2FceC38EE762c52135f6Cbb22D8128DD7'] ??
    '0'
  );
});

const userBalance = computed(() => {
  return lpVaultRewards.value?.userBalance ?? BigNumber.from(0);
});

const userBalanceV2 = computed(() => {
  return lpVaultRewards.value?.userBalanceV2 ?? BigNumber.from(0);
});

const totalSupply = computed(() => {
  return lpVaultRewards.value?.totalSupply ?? BigNumber.from(0);
});

const totalSupplyV2 = computed(() => {
  return lpVaultRewards.value?.totalSupplyV2 ?? BigNumber.from(0);
});

const tokensDistributedInWeek = computed(() => {
  return lpVaultRewards.value?.tokensDistributedInWeek ?? BigNumber.from(0);
});

const tokensDistributedInWeekV2 = computed(() => {
  return lpVaultRewards.value?.tokensDistributedInWeekV2 ?? BigNumber.from(0);
});

/**
 * COMPUTED
 */
const loading = computed(
  (): boolean =>
    (isPointsClaimsLoading.value || lpVaultQueryLoading.value) &&
    isWalletReady.value
);

// const pointsAddress = computed(
//   () => configService.network.tokens.Addresses.POINTS
// );

// const pointsGaugesWithRewards = computed((): PointsGauge[] => {
//   if (!pointsAddress.value || pointsAddress.value === undefined) return [];
//   return pointsGauges.value.filter(gauge => {
//     return bnum(gauge.claimablePointsReward[pointsAddress.value!]).gt(0);
//   });
// });

// const pointsGaugeTables = computed((): PointsGaugeTable[] => {
//   // Only return gauges if we have a corresponding pool and rewards > 0
//   return pointsGaugesWithRewards.value.reduce<PointsGaugeTable[]>(
//     (arr, gauge) => {
//       const pool = pointsGaugePools.value.find(
//         pool => pool.id === gauge.poolId
//       );
//       console.log(pool);

//       if (pool)
//         arr.push({
//           gauge,
//           pool,
//         });

//       return arr;
//     },
//     []
//   );
// });

/**
 * METHODS
 */
async function injectRewardTokens(gauges: PointsGauge[]): Promise<void> {
  const allRewardTokens = gauges.map(gauge => gauge.rewardTokens).flat();
  return await injectTokens(allRewardTokens);
}

async function injectPoolTokens(pools: GaugePool[]): Promise<void> {
  const allPoolTokens = pools.map(pools => pools.tokensList).flat();
  return await injectTokens(allPoolTokens);
}
const leaderboard = ref([]);

const leaderBoardLoading = ref(true);

async function fetchLeaderboard() {
  leaderBoardLoading.value = true;
  try {
    const response = await fetch(
      `https://tasks.symmetric.workers.dev/points-leaderboard/${networkSlug}`
    );
    const data = await response.json();
    leaderboard.value = data;
  } catch (error) {
    console.log(error);
    leaderboard.value = [];
  }
  leaderBoardLoading.value = false;
}

function symbolFor(token: PoolToken): string {
  return getToken(token.address)?.symbol || token.symbol || '---';
}

function goToPoolPage(id: string) {
  router.push({
    name: 'pool',
    params: {
      id,
      networkSlug,
    },
  });
}

/**
 * WATCHERS
 */
watch(pointsGauges, async newGauges => {
  if (newGauges) await injectRewardTokens(newGauges);
});

watch(pointsGaugePools, async newPools => {
  if (newPools) await injectPoolTokens(newPools);
});

onMounted(async () => {
  await fetchLeaderboard();
});
</script>

<template>
  <div class="flex flex-col justify-center">
    <div
      class="flex justify-center items-center w-full text-3xl font-bold promo-bg"
    >
      <div class="px-4 lg:px-0 text-center"></div>
    </div>

    <div
      class="grid grid-cols-1 lg:grid-cols-12 gap-x-0 lg:gap-x-4 xl:gap-x-8 mx-4 sm:mx-8 md:mx-12 lg:mx-16 xl:mx-32 mt-8"
    >
      <BalLoadingBlock
        v-if="loading"
        class="col-span-7 p-4 md:px-8 lg:px-0 w-full h-56"
      />
      <div v-if="!loading" class="col-span-7 gap-y-4 p-4 px-4 md:px-8 lg:px-0">
        <h2 class="mb-4 font-bold">Blaze trails with Revolv x Taiko</h2>
        <div class="text-white rounded-lg shadow-md">
          <h2 class="mb-4 text-2xl font-bold">How it Works</h2>
          <p class="mb-2">
            Boost your rewards by staking LP tokens in eligible pools to earn
            <span class="font-bold symm-points-gradient">SYMM Points</span> and
            <span class="font-bold text-blue-400">Trailblazers XP</span>. The
            more you stake, the more you earn, with up to a
            <span class="font-bold golden-text">90x multiplier</span> on
            Trailblazers XP when depositing and locking the
            <router-link
              :to="{
                name: 'pool',
                params: {
                  id: '0x27ebdb9db75b8ca967ec331cb1e74880f1d7f0a8000200000000000000000005',
                  networkSlug,
                },
              }"
              class="hover:text-blue-400 underline"
            >
              80TAIKO-20WETH
            </router-link>
            pool!
          </p>
          <p class="mb-2">
            Swaps in eligible pools also rack up
            <span class="font-bold text-blue-400">Trailblazers XP</span>.
          </p>
          <p class="mb-2">
            Claim your
            <span class="font-bold symm-points-gradient">SYMM Points</span>
            anytime and redeem them during our exciting
            <span class="font-bold">Taiko Revolv token launch</span>.
          </p>
        </div>

        <div
          v-if="pointsGaugePools.length > 0"
          class="mt-5 mb-4 text-lg font-bold"
        >
          Eligible Pools
        </div>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4"
        >
          <div
            v-for="pool in pointsGaugePools"
            :key="pool.id"
            class="pool-card"
          >
            <BalCard
              class="h-full cursor-pointer"
              @click="goToPoolPage(pool.id)"
            >
              <div class="flex flex-col gap-y-2 p-4 hover:bg-gray-800">
                <div class="flex justify-start pt-4 pb-2 row">
                  <BalAssetSet
                    :addresses="orderedTokenAddresses(pool as any)"
                    :width="50"
                  />
                </div>
                <div class="flex justify-start">
                  {{
                    `${symbolFor(pool.tokens[0])}-${symbolFor(pool.tokens[1])}`
                  }}
                </div>
                <div class="flex justify-start text-xs text-secondary">
                  {{ pool.poolType }} pool
                </div>
                <div class="mt-3">
                  <div class="flex font-bold">Earn</div>
                  <div
                    class="inline-block text-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-500 to-yellow-500"
                  >
                    SYMM Points
                  </div>
                  <div
                    v-if="isLpVaultPool(pool.id)"
                    class="text-sm golden-text"
                  >
                    90x Trailblazers XP
                  </div>
                  <div v-else class="flex text-sm">Trailblazers XP</div>
                </div>
              </div>
            </BalCard>
          </div>
        </div>
      </div>

      <div class="order-1 lg:order-2 col-span-5 px-4 lg:px-0">
        <BalLoadingBlock v-if="loading" class="mb-2 h-56" />
        <template v-if="!isPointsClaimsLoading">
          <div class="mb-8">
            <PointsRewardsTable
              :pointsGauges="pointsGauges"
              :pointsGaugePools="pointsGaugePools"
              :lpVaultPoints="oldLpVaultPoints"
              :lpVaultPointsV2="lpVaultPoints"
              :userBalance="userBalance"
              :userBalanceV2="userBalanceV2"
              :totalSupply="totalSupply"
              :totalSupplyV2="totalSupplyV2"
              :tokensDistributedInWeek="tokensDistributedInWeek"
              :tokensDistributedInWeekV2="tokensDistributedInWeekV2"
              :veBalLockInfo="lpVaultLockInfo"
              :oldLpVaultLockInfo="oldLpVaultLockInfo"
              :isLoading="isPointsClaimsLoading"
            />
          </div>
        </template>
        <BalLoadingBlock v-if="leaderBoardLoading" class="h-56" />
        <template v-if="leaderboard.length > 0">
          <Leaderboard
            :isLoading="leaderBoardLoading"
            :leaderboard="leaderboard"
          />
        </template>
      </div>
    </div>
  </div>
</template>
<style>
.pool-card {
  @apply flex flex-col h-full;
}

.promo-bg {
  background: url('/images/backgrounds/trailblazers-launch.png');
  background-size: contain; /* Change 'contain' to 'cover' for better responsiveness */
  height: 250px; /* Set a default height for small screens */
  @apply rounded-xl overflow-hidden relative bg-no-repeat bg-center;

  /* Responsive Adjustments */
  @media (min-width: 640px) {
    height: 300px; /* Medium screens */
  }
  @media (min-width: 768px) {
    height: 350px; /* Larger screens */
  }
  @media (min-width: 1024px) {
    height: 400px; /* Extra large screens */
  }
}

.symm-points-gradient {
  @apply inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-500 to-yellow-500;
}

.golden-text {
  background: linear-gradient(
    to right,
    #bf953f,
    #fcf6ba,
    #b38728,
    #fbf5b7,
    #aa771c
  );
  background-clip: text;
  color: transparent;
  animation: shine 3s linear infinite;
  background-size: 200% auto;
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}
</style>
