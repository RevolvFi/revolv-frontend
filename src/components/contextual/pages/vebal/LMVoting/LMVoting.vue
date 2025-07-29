<script lang="ts" setup>
import useDebouncedRef from '@/composables/useDebouncedRed';
import useVotingEscrowLocks from '@/composables/useVotingEscrowLocks';
import useVotingPools from '@/composables/useVotingPools';

import useNetwork, {
  lpToken,
  // symmSymbol,
  veSymbol,
  // nativeSymbol,
} from '@/composables/useNetwork';
import useVeBal from '@/composables/useVeBAL';
import { useVeBalLockInfo } from '@/composables/useVeBalLockInfo';
import configs from '@/lib/config';
import { Network } from '@/lib/config/types';
import useWeb3 from '@/services/web3/useWeb3';
import GaugesFilters from './GaugesFilters.vue';
import GaugesTable from './GaugesTable.vue';
import VotingAlert from './VotingAlert.vue';
import { bpsToPercentage, isGaugeExpired } from '../voting-utils';
import useNumbers from '@/composables/useNumbers';
import { isVotingCompleted, useVoting } from '../providers/voting.provider';

/**
 * DATA
 */
const tokenFilter = useDebouncedRef<string>('', 500);
const showExpiredGauges = useDebouncedRef<boolean>(false, 500);
const activeNetworkFilters = useDebouncedRef<Network[]>([], 500);

const networkFilters: Network[] = Object.entries(configs)
  .filter(details => {
    const config = details[1];
    return (
      !config.testNetwork && config.pools.Stakable.VotingGaugePools.length > 0
    );
  })
  .map(details => Number(details[0]) as Network);

/**
 * COMPOSABLES
 */
const {
  votingPools,
  unallocatedVotes,
  votingPeriodEnd,
  votingPeriodLastHour,
  isRefetchingVotingPools,
} = useVotingPools();
const { veBalLockTooShort, veBalExpired, hasLock, hasExpiredLock } =
  useVeBalLockInfo();

const { shouldResubmitVotes } = useVotingEscrowLocks();
const { networkSlug } = useNetwork();
const { isWalletReady } = useWeb3();

const { hasVeBalBalance } = useVeBal();
const { fNum } = useNumbers();

const {
  isLoading,
  isLoadingVotingPools,
  expiredGauges,
  unlockedSelectedPools,
  hasSubmittedVotes,
  hasAllVotingPowerTimeLocked,
  loadRequestWithExistingVotes,
} = useVoting();

/**
 * COMPUTED
 */
const unallocatedVotesFormatted = computed<string>(() =>
  bpsToPercentage(unallocatedVotes.value, fNum)
);

const poolsFilteredByExpiring = computed(() => {
  if (showExpiredGauges.value) {
    return votingPools.value;
  }

  return votingPools.value.filter(pool => {
    if (Number(pool.userVotes) > 0) {
      return true;
    }
    return !isGaugeExpired(expiredGauges.value, pool.gauge.address);
  });
});

const filteredVotingPools = computed(() => {
  // put filter by expiring in separate computed to maintain readability
  return poolsFilteredByExpiring.value.filter(pool => {
    let showByNetwork = true;
    if (
      activeNetworkFilters.value.length > 0 &&
      !activeNetworkFilters.value.includes(pool.network)
    ) {
      showByNetwork = false;
    }

    return (
      showByNetwork &&
      pool.tokens.some(token => {
        return token.symbol
          ?.toLowerCase()
          .includes(tokenFilter.value.toLowerCase());
      })
    );
  });
});

const selectVotesDisabled = computed(
  (): boolean =>
    isLoading.value ||
    !hasVeBalBalance.value ||
    hasAllVotingPowerTimeLocked.value
);

const votingDisabled = computed(
  () => selectVotesDisabled.value || unlockedSelectedPools.value.length === 0
);

/**
 * METHODS
 */
const intersectionSentinel = ref<HTMLDivElement | null>(null);
const renderedRowsIdx = ref(40);
let observer: IntersectionObserver | undefined;
function addIntersectionObserver(): void {
  if (
    !('IntersectionObserver' in window) ||
    !('IntersectionObserverEntry' in window) ||
    !intersectionSentinel.value
  ) {
    renderedRowsIdx.value = votingPools.value.length;
    return;
  }
  const options = {
    rootMargin: '0% 0% 50% 0%',
  };
  const callback = (entries: IntersectionObserverEntry[]): void => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        renderedRowsIdx.value += 40;
      }
    });
  };
  observer = new IntersectionObserver(callback, options);
  observer.observe(intersectionSentinel.value);
}
onMounted(() => {
  addIntersectionObserver();
});
onBeforeUnmount(() => {
  observer?.disconnect();
});
watch(
  () => [showExpiredGauges.value, activeNetworkFilters.value],
  () => {
    renderedRowsIdx.value = votingPools.value.length;
  },
  { deep: true }
);

watch(isLoading, async () => {
  // Load votingRequest once the voting list and the expired gauges were loaded
  loadRequestWithExistingVotes(votingPools.value);
});
watch(isRefetchingVotingPools, async () => {
  // Reload votingRequest if refetching after coming back from a successful voting
  if (isVotingCompleted.value) {
    loadRequestWithExistingVotes(votingPools.value);
  }
});
</script>

<template>
  <div class="flex flex-col">
    <div
      class="flex flex-col lg:flex-row gap-3 lg:justify-between lg:items-end mb-4"
    >
      <div class="pb-1 max-w-3xl">
        <h3 class="mb-1 text-lg font-semibold">
          {{ $t('veBAL.liquidityMining.title') }}
          <BalTooltip
            :text="
              $t('veBAL.liquidityMining.description', {
                veSymbol,
                network: networkSlug,
              })
            "
            iconSize="sm"
            iconClass="text-gray-400 dark:text-gray-600"
            width="72"
            class="mt-1"
          />
        </h3>
      </div>
    </div>

    <VotingAlert
      v-if="veBalLockTooShort"
      :title="`${veSymbol} not locked for 7 days`"
    >
      You must have {{ veSymbol }} locked for more than 7 days to vote on
      gauges.
    </VotingAlert>

    <VotingAlert
      v-if="shouldResubmitVotes"
      title="Resubmit your votes to utilize your full voting power"
    >
      Votes on pools are set at the time of the vote. Since you've added new
      {{ veSymbol }} since your original vote, you have additional voting power
      which is not being used. Use the 'Edit votes' button to resubmit your
      votes.
    </VotingAlert>

    <!-- <VotingAlert
      v-if="noVeBalBalance && !isLoading"
      :title="`You need some ${veSymbol} to vote on gauges`"
    >
      Get {{ veSymbol }} by locking up LP tokens from the 80% {{ symmSymbol }} /
      20% {{ nativeSymbol }}
      pool.
    </VotingAlert> -->

    <VotingAlert
      v-if="veBalExpired"
      :title="`You can't vote because your ${veSymbol} has expired`"
    >
      You need some {{ veSymbol }} to vote on gauges. Unlock and relock your
      {{ lpToken }} to get some veRVLV.
    </VotingAlert>

    <VotingAlert
      v-if="hasAllVotingPowerTimeLocked"
      title="100% of your votes are locked"
    >
      You won't be able to make any edits until some of them are unlocked.
    </VotingAlert>

    <div class="flex flex-wrap justify-between items-end mb-4">
      <div class="flex gap-2 xs:gap-3 mb-2 lg:mb-0">
        <div
          class="p-3 md:w-40 min-w-max rounded-xl border shadow-lg backdrop-blur-lg bg-white/5 dark:bg-white/10 border-white/30 dark:border-white/20"
        >
          <div class="flex items-center">
            <p class="inline mr-1 text-xs text-secondary">
              My unallocated votes
            </p>
            <BalTooltip
              :text="
                $t('veBAL.liquidityMining.myUnallocatedVotesTooltip', {
                  veSymbol,
                })
              "
              iconClass="text-gray-400 dark:text-gray-600"
              iconSize="sm"
              width="72"
              class="mt-1"
            />
          </div>
          <p
            class="inline mr-1 text-base font-semibold"
            :class="{ 'text-red-500': hasExpiredLock }"
          >
            <span v-if="hasLock">
              {{ unallocatedVotesFormatted }}
            </span>
            <span v-else class="mr-1">—</span>
          </p>
          <BalTooltip
            v-if="hasExpiredLock"
            :text="
              $t('veBAL.liquidityMining.votingPowerExpiredTooltip', {
                veSymbol,
                lpToken,
              })
            "
            iconSize="sm"
            :iconName="'alert-triangle'"
            :iconClass="'text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors'"
            width="72"
            class="relative top-0.5"
          />
        </div>
        <div
          class="p-3 md:w-40 min-w-max rounded-xl border shadow-lg backdrop-blur-lg bg-white/5 dark:bg-white/10 border-white/30 dark:border-white/20"
        >
          <div class="flex items-center">
            <p
              :class="{ 'text-orange-500 font-medium': votingPeriodLastHour }"
              class="inline mr-1 text-xs text-secondary"
            >
              Voting period ends
            </p>
            <BalTooltip
              :text="
                $t('veBAL.liquidityMining.votingPeriodTooltip', { veSymbol })
              "
              iconSize="sm"
              iconClass="text-gray-400 dark:text-gray-600"
              width="72"
              class="mt-1"
            />
          </div>
          <p class="text-base font-semibold tabular-nums">
            <span
              v-if="votingPeriodEnd.length"
              :class="{ 'text-orange-500': votingPeriodLastHour }"
            >
              {{
                $t(
                  'veBAL.liquidityMining.votingPeriodCountdown',
                  votingPeriodEnd
                )
              }}
            </span>
          </p>
        </div>
      </div>
      <div class="flex mb-2 lg:mb-0">
        <BalTextInput
          v-model="tokenFilter"
          class="mr-2 w-48 text-xs"
          name="tokenSearch"
          type="text"
          :placeholder="$t('filterByToken')"
          size="sm"
        >
          <template #prepend>
            <div class="flex items-center h-full">
              <BalIcon name="search" size="sm" class="px-1 text-gray-600" />
            </div>
          </template>
        </BalTextInput>
        <GaugesFilters
          :networkFilters="networkFilters"
          :showExpiredGauges="showExpiredGauges"
          :activeNetworkFilters="activeNetworkFilters"
          @update:show-expired-gauges="showExpiredGauges = $event"
          @update:active-network-filters="activeNetworkFilters = $event"
        />
        <div v-if="isWalletReady" class="flex flex-0 ml-2 w-24 h-full">
          <BalBtn
            :tag="votingDisabled ? 'div' : 'router-link'"
            :to="{ name: 'vervlv-voting', params: { networkSlug } }"
            :label="hasSubmittedVotes ? 'Edit votes' : 'Vote'"
            color="gradient"
            :disabled="votingDisabled"
            block
            size="md"
          />
        </div>
      </div>
    </div>

    <GaugesTable
      :renderedRowsIdx="renderedRowsIdx"
      :isLoading="isLoadingVotingPools"
      :data="filteredVotingPools"
      :noPoolsLabel="$t('noInvestments')"
      :filterText="tokenFilter"
      :selectVotesDisabled="selectVotesDisabled"
    />
    <div ref="intersectionSentinel" />
  </div>
</template>
