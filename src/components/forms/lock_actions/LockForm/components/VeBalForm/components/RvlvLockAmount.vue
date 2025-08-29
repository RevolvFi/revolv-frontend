<script setup lang="ts">
import { computed } from 'vue';

// import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { configService } from '@/services/config/config.service';
import { useTokens } from '@/providers/tokens.provider';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';

import useLockState from '../../../composables/useLockState';

/**
 * COMPOSABLES
 */
const { lockAmount } = useLockState();
const { getToken, balanceFor, priceFor } = useTokens();
const { fNum } = useNumbers();

/**
 * COMPUTED
 */
const rvlvToken = computed(() =>
  getToken(configService.network.tokens.Addresses.BAL)
);

const rvlvBalance = computed(() =>
  balanceFor(configService.network.tokens.Addresses.BAL)
);

const rvlvPrice = computed(() => {
  const price = priceFor(configService.network.tokens.Addresses.BAL);
  return price || 0; // Fallback to 0 if price not available
});

const lockAmountFiatValue = computed(() => {
  return bnum(lockAmount.value || '0')
    .times(rvlvPrice.value)
    .toString();
});

/**
 * METHODS
 */
function setMaxAmount() {
  lockAmount.value = rvlvBalance.value;
}
</script>

<template>
  <div class="mb-6">
    <!-- RVLV Token Input -->
    <div
      class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center">
          <img
            v-if="rvlvToken?.logoURI"
            :src="rvlvToken.logoURI"
            :alt="rvlvToken.symbol"
            class="mr-2 w-6 h-6 rounded-full"
          />
          <div
            v-else
            class="flex justify-center items-center mr-2 w-6 h-6 bg-blue-500 rounded-full"
          >
            <span class="text-xs font-bold text-white">{{
              rvlvToken?.symbol?.[0] || 'R'
            }}</span>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ rvlvToken?.symbol || 'RVLV' }}
            </p>
            <p class="text-xs text-gray-500">
              Balance: {{ fNum(rvlvBalance, FNumFormats.token) }}
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <div>
          <label
            class="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            Amount to Lock
          </label>
          <div class="relative">
            <input
              v-model="lockAmount"
              type="text"
              placeholder="0.0"
              class="py-1 px-2 pr-32 w-full text-sm placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded border border-gray-300 focus:border-transparent dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
            />
            <div class="flex absolute inset-y-0 right-0 items-center pr-2">
              <span class="mr-2 text-xs text-gray-500 dark:text-gray-400">
                {{ fNum(lockAmountFiatValue, FNumFormats.fiat) }}
              </span>
              <button
                type="button"
                class="py-1 px-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded transition-colors"
                @click="setMaxAmount"
              >
                MAX
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 