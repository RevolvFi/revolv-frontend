<script setup lang="ts">
// import { useRouter } from 'vue-router';
//import HomePageHero from '@/components/heros/HomePageHero.vue';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
// import FeaturedProtocols from '@/components/sections/FeaturedProtocols.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';
// import useBreakpoints from '@/composables/useBreakpoints';
import useNetwork, {
  rewardSymbol,
  // symmSymbol,
  // symmAddress,
  rewardAddress,
  isTelos,
} from '@/composables/useNetwork';
import usePools from '@/composables/pools/usePools';
import { lsGet, lsSet } from '@/lib/utils';
import LS_KEYS from '@/constants/local-storage.keys';
import { useIntersectionObserver } from '@vueuse/core';
import { PoolType } from '@/services/pool/types';
import PoolFeatureSelect from '@/components/inputs/PoolFeatureSelect.vue';
import { useTokens } from '@/providers/tokens.provider';
import { PoolAttributeFilter, PoolTypeFilter } from '@/types/pools';
import UserInvestedInAffectedPoolAlert from '@/pages/recovery-exit/UserInvestedInAffectedPoolAlert.vue';
import useNumbers from '@/composables/useNumbers';
import { getAddress } from '@ethersproject/address';
import { TOKENS } from '@/constants/tokens';
import useWeb3 from '@/services/web3/useWeb3';

const { fNum } = useNumbers();
const featuredProtocolsSentinel = ref<HTMLDivElement | null>(null);
const isFeaturedProtocolsVisible = ref(false);
const { provider } = useWeb3();
useIntersectionObserver(featuredProtocolsSentinel, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    isFeaturedProtocolsVisible.value = true;
  }
});

/**
 * STATE
 */
const route = useRoute();
const urlSortParam = route.query?.sort as string | undefined;
const initSortCol =
  urlSortParam || lsGet(LS_KEYS.App.PoolSorting) || 'totalLiquidity';
const sortField = ref('totalLiquidity');
const poolTypeFilter = ref<PoolTypeFilter>();
const filterPoolIds = ref<string[]>([]);
const filterPoolTypes = ref<PoolType[]>([]);
const filterPoolAttributes = ref<PoolAttributeFilter[]>([]);

/**
 * COMPOSABLES
 */
// const router = useRouter();
const { getToken, injectedPriceFor } = useTokens();
// const { appNetworkConfig } = useNetwork();
// const isElementSupported = appNetworkConfig.supportsElementPools;
const { selectedTokens, addSelectedToken, removeSelectedToken } =
  usePoolFilters();

const { pools, isLoading, isFetchingNextPage, loadMorePools } = usePools({
  filterTokens: selectedTokens,
  sortField,
  poolIds: filterPoolIds,
  poolTypes: filterPoolTypes,
  poolAttributes: filterPoolAttributes,
});

// const { upToSmallBreakpoint } = useBreakpoints();
const { networkSlug, networkConfig } = useNetwork();

const isPaginated = computed(() => pools.value.length >= 10);

async function fetchGraphQL(query: string) {
  const response = await fetch(networkConfig.subgraph, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return response;
}

const fetchTVL = async () => {
  const query = `
    {
      pools {
        totalLiquiditySansBPT
      }
    }
  `;
  const response = await fetchGraphQL(query);
  const data = await response.json();
  return data.data.pools.reduce((total: number, pool: any) => {
    return total + Number(pool.totalLiquiditySansBPT);
  }, 0);
};

// const totalLiquidity = computed(async () => {
//   return (await fetchTVL()) as number;
// });

const totalLiquidity = ref(0);

const tvl = computed(() => {
  return fNum(totalLiquidity.value, {
    style: 'currency',
    maximumFractionDigits: 0,
  });
});

const volumeSnapshot = computed(() => {
  return pools.value.reduce((total, pool) => {
    return total + Number(pool.volumeSnapshot);
  }, 0);
});

const feesSnapshot = computed(() => {
  return pools.value.reduce((total, pool) => {
    return total + Number(pool.feesSnapshot);
  }, 0);
});

const symmPrice = ref(0);
const rewardPrice = ref(0);

/**
 * METHODS
 */
// function navigateToCreatePool() {
//   router.push({ name: 'create-pool', params: { networkSlug } });
// }

function onColumnSort(columnId: string) {
  sortField.value = columnId;
  lsSet(LS_KEYS.App.PoolSorting, columnId);
}

function updatePoolFilters(feature: PoolTypeFilter | undefined) {
  switch (feature) {
    case PoolTypeFilter.Weighted:
      filterPoolIds.value = [];
      filterPoolTypes.value = [PoolType.Weighted];
      break;
    case PoolTypeFilter.Stable:
      filterPoolIds.value = [];
      filterPoolTypes.value = [
        PoolType.Stable,
        PoolType.StablePhantom,
        PoolType.MetaStable,
        PoolType.ComposableStable,
      ];
      break;
    case PoolTypeFilter.CLP:
      filterPoolIds.value = [];
      filterPoolTypes.value = [PoolType.Gyro2, PoolType.Gyro3, PoolType.GyroE];
      break;
    case PoolTypeFilter.LBP:
      filterPoolIds.value = [];
      filterPoolTypes.value = [PoolType.LiquidityBootstrapping];
      break;
    default:
      filterPoolIds.value = [];
      filterPoolTypes.value = [];
  }
}

function removeAttributeFilter(attribute: PoolAttributeFilter) {
  const index = filterPoolAttributes.value.indexOf(attribute);
  filterPoolAttributes.value.splice(index, 1);
}

async function addTokenToWallet(tokenAddress: string) {
  try {
    const token = getToken(tokenAddress);
    if (!token) return;
    console.log(provider.value);
    await provider?.value?.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: token.symbol,
          decimals: token.decimals,
          image: token.logoURI,
        },
      },
    });
  } catch (error) {
    console.error('Failed to add token to wallet:', error);
  }
}

watch(poolTypeFilter, newPoolTypeFilter => {
  updatePoolFilters(newPoolTypeFilter);
});

onBeforeMount(async () => {
  if (networkSlug === 'telos' || networkSlug === 'meter') {
    const symm = getAddress(TOKENS.Addresses.BAL);
    const reward = TOKENS.Addresses.reward
      ? getAddress(TOKENS.Addresses.reward)
      : undefined;

    symmPrice.value = injectedPriceFor(symm);
    rewardPrice.value = reward ? injectedPriceFor(reward) : 0;
  }
  const tvl = await fetchTVL();
  totalLiquidity.value = tvl;
});

const availableNetworks = ['telos', 'meter', 'artela'];
</script>

<template>
  <div>
    <!-- Add this banner at the top -->
    <div
      v-if="isTelos"
      class="p-4 w-full text-center bg-purple-600 dark:bg-purple-900"
    >
      <span class="text-white">
        If you had liquidity on Symmetric Telos before March 28th, 2024, you can
        withdraw it
        <a
          href="https://telos-v1.symm.fi"
          target="_blank"
          class="font-medium hover:text-blue-200 underline transition-colors"
        >
          here
        </a>
      </span>
    </div>

    <div class="xl:container xl:px-4 pt-10 md:pt-8 xl:mx-auto">
      <UserInvestedInAffectedPoolAlert />
      <BalStack vertical>
        <div class="px-4 xl:px-0">
          <div>
            <h3>
              {{ networkConfig.chainName }}
              <span class="lowercase">{{ $t('pools') }}</span>
            </h3>
          </div>
          <BalLoadingBlock
            v-if="isLoading"
            :class="['', 'min-w-full']"
            square
            :style="{ width: `200px`, height: '48px' }"
          />
          <div
            v-else
            class="flex justify-between p-4 mt-4 mb-4 space-x-4 text-sm dark:bg-gray-850 rounded-lg border dark:border-0 shadow-lg gray-100"
          >
            <div class="flex flex-row items-center space-x-4">
              <div>
                TVL: <span class="font-bold">{{ tvl }}</span>
              </div>
              <div>
                Volume 24h:
                <span class="font-bold">{{
                  fNum(volumeSnapshot, { style: 'currency' })
                }}</span>
              </div>
              <div>
                Fees 24h:
                <span class="font-bold">{{
                  fNum(feesSnapshot, { style: 'currency' })
                }}</span>
              </div>
            </div>
            <div
              v-if="availableNetworks.includes(networkSlug)"
              class="flex flex-row items-center space-x-2"
            >
              <!-- <div>
                {{ symmSymbol }}:
                <span class="font-bold">{{
                  fNum(symmPrice, { style: 'currency' })
                }}</span>
              </div>
              <BalTooltip
                :text="`Add ${symmSymbol} to wallet`"
                iconName="plus-circle"
                iconSize="sm"
                @click="addTokenToWallet(symmAddress)"
              /> -->
              <div>
                {{ rewardSymbol }}:
                <span class="font-bold">{{
                  fNum(rewardPrice, { style: 'currency' })
                }}</span>
              </div>
              <BalTooltip
                :text="`Add ${rewardSymbol} to wallet`"
                iconName="plus-circle"
                iconSize="sm"
                @click="addTokenToWallet(rewardAddress)"
              />
            </div>
          </div>
          <div
            class="flex flex-col md:flex-row justify-between items-end lg:items-center w-full"
          >
            <!-- <div class="flex justify-between items-end mb-2">
              <BalBtn
                v-if="upToSmallBreakpoint"
                color="blue"
                size="sm"
                outline
                :class="{ 'mt-4': upToSmallBreakpoint }"
                @click="navigateToCreatePool"
              >
                {{ $t('createAPool.title') }}
              </BalBtn>
            </div> -->
            <BalVStack width="full">
              <BalHStack justify="between" width="full">
                <BalHStack spacing="md">
                  <TokenSearchInput
                    v-model="selectedTokens"
                    @add="addSelectedToken"
                    @remove="removeSelectedToken"
                  />
                  <PoolFeatureSelect
                    v-model:selectedPoolType="poolTypeFilter"
                    v-model:selectedAttributes="filterPoolAttributes"
                  />
                </BalHStack>

                <!-- <BalBtn
                  v-if="!upToSmallBreakpoint"
                  color="blue"
                  size="sm"
                  outline
                  :class="{ 'mt-4': upToSmallBreakpoint }"
                  :block="upToSmallBreakpoint"
                  @click="navigateToCreatePool"
                >
                  {{ $t('createAPool.title') }}
                </BalBtn> -->
              </BalHStack>
              <BalHStack spacing="sm">
                <TransitionGroup name="pop">
                  <BalTag
                    v-for="token in selectedTokens"
                    :key="token"
                    :closeable="true"
                    class="mt-4"
                    @closed="removeSelectedToken"
                  >
                    <BalAsset :address="token" :size="20" class="flex-auto" />
                    <span class="ml-2">{{ getToken(token)?.symbol }}</span>
                  </BalTag>
                </TransitionGroup>

                <Transition name="pop">
                  <BalTag
                    v-if="poolTypeFilter"
                    :closeable="true"
                    class="mt-4"
                    @closed="poolTypeFilter = undefined"
                  >
                    <span>{{ poolTypeFilter }}</span>
                  </BalTag>
                </Transition>

                <TransitionGroup name="pop">
                  <BalTag
                    v-for="attribute in filterPoolAttributes"
                    :key="attribute"
                    :closeable="true"
                    class="mt-4"
                    @closed="removeAttributeFilter(attribute)"
                  >
                    <span>{{ attribute }}</span>
                  </BalTag>
                </TransitionGroup>
              </BalHStack>
            </BalVStack>
          </div>
        </div>
        <div class="px-4 xl:px-0">
          <PoolsTable
            :data="pools"
            :noPoolsLabel="$t('noPoolsFound')"
            :isLoading="isLoading"
            :selectedTokens="selectedTokens"
            class="mb-8"
            :sortColumn="initSortCol"
            :hiddenColumns="['migrate', 'actions', 'lockEndDate']"
            :isLoadingMore="isFetchingNextPage"
            :isPaginated="isPaginated"
            skeletonClass="pools-table-loading-height"
            @on-column-sort="onColumnSort"
            @load-more="loadMorePools"
          />
        </div>
        <!-- <div ref="featuredProtocolsSentinel" />
        <div
          v-if="isElementSupported && isFeaturedProtocolsVisible"
          class="p-4 mt-12 xl:p-0"
        >
          <FeaturedProtocols />
        </div> -->
      </BalStack>
    </div>
  </div>
</template>

<style>
.pools-table-loading-height {
  height: 40rem;
}
</style>
