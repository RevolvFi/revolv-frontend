<script setup lang="ts">
import { computed, ref } from 'vue';

import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';

import VeBalForm from './VeBalForm/VeBalForm.vue';
import RvlvUnlockPreviewModal from './RvlvUnlockPreviewModal/RvlvUnlockPreviewModal.vue';

/**
 * COMPOSABLES
 */
const { isWalletReady, startConnectWithInjectedProvider } = useWeb3();

/**
 * QUERIES
 */
const veBalLockInfoQuery = useVeBalLockInfoQuery();

/**
 * STATE
 */
const showUnlockModal = ref(false);

/**
 * COMPUTED
 */
// Check if we should lock RVLV tokens directly (for Revolv) or LP tokens (for other networks)
const shouldLockRvlvDirectly = computed(() => {
  return configService.network.chainId === 40; // Telos chain ID
});

const veBalLockInfo = computed(() => veBalLockInfoQuery.data.value);

const isLoading = computed(() => veBalLockInfoQuery.isLoading.value);

const hasExistingLock = computed(() => veBalLockInfo.value?.hasExistingLock);

const isExpired = computed(() => veBalLockInfo.value?.isExpired);

const hasExpiredLockWithTokens = computed(() => {
  return (
    isExpired.value &&
    veBalLockInfo.value?.lockedAmount &&
    parseFloat(veBalLockInfo.value.lockedAmount) > 0
  );
});

const totalRvlvTokens = computed(() =>
  veBalLockInfo.value?.isExpired ? veBalLockInfo.value.lockedAmount : '0'
);

/**
 * METHODS
 */
function handleUnlockClick() {
  showUnlockModal.value = true;
}

function handleUnlockModalClose() {
  showUnlockModal.value = false;
}
</script>

<template>
  <div class="inline-lock-form">
    <!-- Not Connected State -->
    <div v-if="!isWalletReady" class="py-4 text-center">
      <p class="mb-3 text-sm text-gray-600">
        Connect your wallet to lock
        {{ shouldLockRvlvDirectly ? 'RVLV' : 'LP' }} tokens
      </p>
      <BalBtn
        color="gradient"
        size="sm"
        @click="startConnectWithInjectedProvider"
      >
        Connect Wallet
      </BalBtn>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="py-4 text-center">
      <div
        class="mx-auto w-6 h-6 rounded-full border-b-2 border-blue-600 animate-spin"
      ></div>
      <p class="mt-2 text-sm text-gray-600">Loading lock information...</p>
    </div>

    <!-- Expired Lock with Tokens - Must Withdraw First -->
    <div v-else-if="hasExpiredLockWithTokens" class="space-y-4">
      <div
        class="p-4 rounded-lg border bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
      >
        <div class="flex items-start">
          <BalIcon
            name="alert-triangle"
            class="flex-shrink-0 mt-0.5 mr-3 text-amber-500"
          />
          <div class="flex-1">
            <h4 class="mb-2 font-semibold text-amber-800 dark:text-amber-200">
              Withdraw Expired Lock Required
            </h4>
            <p class="mb-3 text-sm text-amber-700 dark:text-amber-300">
              Your lock has expired and you still have tokens locked. You must
              withdraw your tokens before creating a new lock.
            </p>
            <BalBtn color="gradient" size="sm" @click="handleUnlockClick">
              Unlock Tokens
            </BalBtn>
          </div>
        </div>
      </div>
    </div>

    <!-- Lock Form (only show if no expired lock with tokens) -->
    <div v-else class="space-y-4">
      <!-- Extend/Add to Lock Form -->
      <div v-if="hasExistingLock && !isExpired">
        <div class="mb-3">
          <h4 class="font-semibold text-md">Extend or Add to Your Lock</h4>
          <p class="mt-1 text-sm text-gray-600">
            Increase your voting power by extending the lock duration or adding
            more tokens
          </p>
        </div>
      </div>

      <!-- Lock Form (handles both extend/add and new lock) -->
      <VeBalForm
        :lockablePool="undefined"
        :lockablePoolTokenInfo="undefined"
        :veBalLockInfo="veBalLockInfo"
      />

      <!-- Expired Lock Notice (only show if no tokens to withdraw) -->
      <div
        v-if="isExpired && !hasExpiredLockWithTokens"
        class="p-3 bg-red-50 rounded-lg dark:bg-red-900/20"
      >
        <div class="flex items-center">
          <BalIcon name="alert-triangle" class="mr-2 text-red-500" />
          <div>
            <p class="font-semibold text-red-800 dark:text-red-200">
              Your lock has expired
            </p>
            <p class="text-sm text-red-600 dark:text-red-300">
              You can now create a new lock below.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- RVLV Unlock Preview Modal -->
    <teleport to="#modal">
      <RvlvUnlockPreviewModal
        v-if="showUnlockModal && veBalLockInfo && shouldLockRvlvDirectly"
        :veBalLockInfo="veBalLockInfo"
        :totalRvlvTokens="totalRvlvTokens"
        @close="handleUnlockModalClose"
      />
    </teleport>
  </div>
</template>

<style scoped>
.inline-lock-form {
  @apply w-full;
}
</style> 