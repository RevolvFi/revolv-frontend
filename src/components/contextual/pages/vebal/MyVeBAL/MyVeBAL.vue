<script setup lang="ts">
import { computed } from 'vue';

import { useLock } from '@/composables/useLock';
import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';
import { useTokens } from '@/providers/tokens.provider';

import MyVeBalCards from './components/MyVeBalCards.vue';
import MyVeRvlv from './components/MyVeRvlv.vue';
import { veSymbol } from '@/composables/useNetwork';

/**
 * COMPOSABLES
 */
const {
  isLoadingLockPool,
  isLoadingLockInfo,
  lockPool,
  lockPoolToken,
  lock,
  totalLockedValue,
  // shouldLockRvlvDirectly,
} = useLock();
const { isWalletReady } = useWeb3();
const { getToken } = useTokens();

/**
 * COMPUTED
 */
// Check if we should lock RVLV tokens directly (for Revolv) or LP tokens (for other networks)
const isRvlvDirectLocking = computed(() => {
  return configService.network.chainId === 40; // Telos chain ID
});

const effectiveLockPool = computed(() => {
  return isRvlvDirectLocking.value ? undefined : lockPool.value || undefined;
});

const effectiveLockPoolToken = computed(() => {
  return isRvlvDirectLocking.value
    ? getToken(configService.network.tokens.Addresses.BAL) || undefined
    : lockPoolToken.value || undefined;
});

const isLoading = computed(() =>
  isWalletReady.value
    ? isRvlvDirectLocking.value
      ? isLoadingLockInfo.value
      : isLoadingLockPool.value || isLoadingLockInfo.value
    : false
);

// Debug logging
console.log('MyVeBAL Debug:', {
  isWalletReady: isWalletReady.value,
  isRvlvDirectLocking: isRvlvDirectLocking.value,
  isLoading: isLoading.value,
  effectiveLockPool: effectiveLockPool.value,
  effectiveLockPoolToken: effectiveLockPoolToken.value,
  lock: lock.value,
});
</script>

<template>
  <!-- RVLV Direct Locking - Show compact single card -->
  <div v-if="isRvlvDirectLocking">
    <template v-if="isLoading">
      <BalLoadingBlock class="h-64" />
    </template>
    <MyVeRvlv v-else :veBalLockInfo="lock" />
  </div>

  <!-- Traditional LP Token Locking - Show multiple cards -->
  <div v-else>
    <h3 class="mb-3">
      {{ $t('veBAL.myVeBAL.title', { veSymbol }) }}
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <template v-if="isLoading">
        <BalLoadingBlock v-for="n in 4" :key="n" class="h-24" />
      </template>
      <MyVeBalCards
        v-else
        :veBalLockInfo="lock"
        :lockablePool="effectiveLockPool"
        :lockablePoolTokenInfo="effectiveLockPoolToken"
        :totalLockedValue="totalLockedValue"
      />
    </div>
  </div>
</template>
