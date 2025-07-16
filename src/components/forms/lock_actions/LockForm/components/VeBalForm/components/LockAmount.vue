<script setup lang="ts">
import { computed } from 'vue';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import useLockState from '../../../composables/useLockState';

import { configService } from '@/services/config/config.service';

/**
 * TYPES
 */
type Props = {
  lockablePool?: Pool;
  lockablePoolTokenInfo?: TokenInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { lockAmount } = useLockState();

/**
 * COMPUTED
 */
// Check if we should lock RVLV tokens directly (for Revolv) or LP tokens (for other networks)
const shouldLockRvlvDirectly = computed(() => {
  return configService.network.chainId === 40; // Telos chain ID
});

const lockAmountFiatValue = computed(() => {
  if (shouldLockRvlvDirectly.value) {
    // For RVLV direct locking, we need to get RVLV token price
    // For now, returning the lock amount as placeholder
    return lockAmount.value;
  }
  if (!props.lockablePool) return '0';
  return bnum(props.lockablePool.totalLiquidity)
    .div(props.lockablePool.totalShares)
    .times(lockAmount.value)
    .toString();
});

const tokenAddress = computed(() => {
  if (shouldLockRvlvDirectly.value) {
    return configService.network.tokens.Addresses.BAL;
  }
  return props.lockablePoolTokenInfo?.address;
});
</script>

<template>
  <div class="mb-4">
    <div>
      <p class="pb-1 text-sm font-semibold">
        {{ $t('getVeBAL.lockForm.lockAmount.title') }}
      </p>
    </div>
    <TokenInput
      v-if="tokenAddress"
      v-model:amount="lockAmount"
      :address="tokenAddress"
      :tokenValue="lockAmountFiatValue"
      fixedToken
      name="lockAmount"
      size="sm"
    />
    <div v-else class="p-2 text-sm text-center text-gray-500">
      Loading token information...
    </div>
  </div>
</template>
