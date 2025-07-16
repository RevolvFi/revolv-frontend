<script setup lang="ts">
import { format } from 'date-fns';
import { computed } from 'vue';

import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVeBal from '@/composables/useVeBAL';
// import { useTokens } from '@/providers/tokens.provider';
import { bnum } from '@/lib/utils';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { veSymbol } from '@/composables/useNetwork';
// import { configService } from '@/services/config/config.service';

/**
 * TYPES
 */
type Props = {
  veBalLockInfo?: VeBalLockInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { veBalBalance } = useVeBal();
const { fNum } = useNumbers();
// const { balanceFor } = useTokens();

/**
 * COMPUTED
 */
// const rvlvBalance = computed(() =>
//   balanceFor(configService.network.tokens.Addresses.BAL)
// );

const percentVeBAL = computed(() => {
  if (props.veBalLockInfo != null) {
    const totalSupply = bnum(props.veBalLockInfo.totalSupply);

    if (totalSupply.gt(0)) {
      return bnum(veBalBalance.value).div(totalSupply).toString();
    }
  }

  return '0';
});

const lockedUntil = computed(() => {
  if (props.veBalLockInfo?.hasExistingLock && !props.veBalLockInfo?.isExpired) {
    return format(props.veBalLockInfo.lockedEndDate, PRETTY_DATE_FORMAT);
  }
  return '—';
});

const hasExistingLock = computed(() => props.veBalLockInfo?.hasExistingLock);
const isExpired = computed(() => props.veBalLockInfo?.isExpired);

const lockedRvlvFiatValue = computed(() => {
  // Fixed RVLV price of $0.01 for now
  const rvlvPrice = 0.01;
  return bnum(props.veBalLockInfo?.lockedAmount || '0')
    .times(rvlvPrice)
    .toString();
});
</script>

<template>
  <BalCard
    shadow="none"
    noBorder
    class="rounded-xl border shadow-lg backdrop-blur-lg bg-white/5 dark:bg-white/10 border-white/30 dark:border-white/20"
  >
    <div class="p-3">
      <h4 class="mb-2 text-base font-semibold">
        {{ $t('veBAL.myVeBAL.title', { veSymbol }) }}
      </h4>

      <!-- Voting Power (veRVLV) -->
      <div class="p-2 mb-2 bg-blue-50 rounded-lg dark:bg-blue-900/20">
        <div class="mb-0.5 text-xs text-gray-700 dark:text-blue-100">
          Voting Power ({{ veSymbol }})
        </div>
        <div class="text-base font-bold text-gray-900 dark:text-white">
          {{ fNum(veBalBalance, FNumFormats.token) }} {{ veSymbol }}
        </div>
        <div
          v-if="hasExistingLock && !isExpired"
          class="mt-0.5 text-xs text-gray-700 dark:text-blue-100"
        >
          {{
            fNum(percentVeBAL, { style: 'percent', maximumFractionDigits: 2 })
          }}
          of total supply
        </div>
      </div>

      <!-- Locked RVLV -->
      <div class="p-2 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="mb-0.5 text-xs text-gray-700 dark:text-gray-300">
          Locked RVLV
        </div>
        <div class="flex justify-between items-center">
          <div class="text-base font-bold text-gray-900 dark:text-white">
            {{
              fNum(props.veBalLockInfo?.lockedAmount || '0', FNumFormats.token)
            }}
            RVLV
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ fNum(lockedRvlvFiatValue, FNumFormats.fiat) }}
          </div>
        </div>
      </div>

      <!-- Lock Status -->
      <div class="p-2 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="mb-0.5 text-xs text-gray-700 dark:text-gray-300">
          {{
            isExpired
              ? 'Lock Expired'
              : hasExistingLock
              ? 'Locked Until'
              : 'No Active Lock'
          }}
        </div>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ lockedUntil }}
        </div>
        <div
          v-if="hasExistingLock && !isExpired"
          class="mt-0.5 text-xs text-gray-700 dark:text-gray-300"
        >
          {{
            $t('veBAL.myVeBAL.cards.lockedEndDate.secondaryText', [
              Math.max(
                0,
                Math.ceil(
                  (new Date(lockedUntil).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              ),
            ])
          }}
        </div>
      </div>
    </div>
  </BalCard>
</template> 