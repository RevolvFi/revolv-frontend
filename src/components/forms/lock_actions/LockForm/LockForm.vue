<script setup lang="ts">
import { computed } from 'vue';

import Col3Layout from '@/components/layouts/Col3Layout.vue';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import useBreakpoints from '@/composables/useBreakpoints';
import { useTokens } from '@/providers/tokens.provider';
import useVeBal from '@/composables/useVeBAL';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';

import HowToLock from './components/HowToLock.vue';
import LockableTokens from './components/LockableTokens.vue';
import MyVeBAL from './components/MyVeBAL.vue';
import VeBalForm from './components/VeBalForm/VeBalForm.vue';

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { isWalletReady } = useWeb3();
const { lockablePoolId } = useVeBal();
const { isDesktop, isMobile } = useBreakpoints();

/**
 * COMPUTED
 */
// Check if we should lock RVLV tokens directly (for Revolv) or LP tokens (for other networks)
const shouldLockRvlvDirectly = computed(() => {
  return configService.network.chainId === 40; // Telos chain ID
});

/**
 * QUERIES
 */
// Only create pool query if we're not doing RVLV direct locking
const lockablePoolQuery = shouldLockRvlvDirectly.value
  ? null
  : usePoolQuery(lockablePoolId.value as string);

const veBalLockInfoQuery = useVeBalLockInfoQuery();

/**
 * COMPUTED
 */
const lockablePoolLoading = computed(
  () => lockablePoolQuery?.isLoading.value || false
);

const veBalQueryLoading = computed(() => veBalLockInfoQuery.isLoading.value);

const lockablePool = computed<Pool | undefined>(
  () => lockablePoolQuery?.data.value
);

const lockablePoolTokenInfo = computed(() => {
  if (shouldLockRvlvDirectly.value) {
    // For RVLV direct locking, get RVLV token info
    return getToken(configService.network.tokens.Addresses.BAL);
  }
  return lockablePool.value != null
    ? getToken(lockablePool.value.address)
    : null;
});

const veBalLockInfo = computed(() => veBalLockInfoQuery.data.value);

const isLoading = computed(() =>
  isWalletReady.value
    ? shouldLockRvlvDirectly.value
      ? veBalQueryLoading.value
      : lockablePoolLoading.value || veBalQueryLoading.value
    : shouldLockRvlvDirectly.value
    ? false
    : lockablePoolLoading.value
);
</script>

<template>
  <Col3Layout offsetGutters>
    <template #gutterLeft>
      <BalLoadingBlock
        v-if="
          isLoading ||
          (!shouldLockRvlvDirectly && (!lockablePool || !lockablePoolTokenInfo))
        "
        class="h-36"
      />
      <LockableTokens
        v-else-if="
          !shouldLockRvlvDirectly && lockablePool && lockablePoolTokenInfo
        "
        :lockablePool="lockablePool"
        :lockablePoolTokenInfo="lockablePoolTokenInfo"
      />
      <!-- For RVLV direct locking, show RVLV token info -->
      <div v-else-if="shouldLockRvlvDirectly" class="mb-6">
        <h2 class="mb-4 text-2xl font-bold">Lock RVLV to Get veRVLV</h2>
        <div class="py-4 text-white rounded-lg shadow-md">
          <p class="mb-2">
            Lock your RVLV tokens to earn veRVLV (vote-escrow RVLV) and
            participate in governance.
          </p>
          <p class="mb-2">
            The longer you lock your RVLV tokens, the more veRVLV you'll
            receive.
          </p>
        </div>
      </div>
      <template v-if="isDesktop">
        <BalLoadingBlock
          v-if="
            isLoading ||
            (!shouldLockRvlvDirectly &&
              (!lockablePool || !lockablePoolTokenInfo))
          "
          class="mt-4 h-12"
        />
        <HowToLock
          v-else-if="
            !shouldLockRvlvDirectly && lockablePool && lockablePoolTokenInfo
          "
          :lockablePool="lockablePool"
          :lockablePoolTokenInfo="lockablePoolTokenInfo"
        />
      </template>
    </template>

    <BalLoadingBlock
      v-if="
        isLoading ||
        (!shouldLockRvlvDirectly && (!lockablePool || !lockablePoolTokenInfo))
      "
      class="h-96"
    />
    <VeBalForm
      v-else-if="
        !shouldLockRvlvDirectly && lockablePool && lockablePoolTokenInfo
      "
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      :veBalLockInfo="veBalLockInfo"
    />
    <VeBalForm
      v-else-if="shouldLockRvlvDirectly"
      :veBalLockInfo="veBalLockInfo"
    />

    <template #gutterRight>
      <BalLoadingBlock v-if="isLoading" class="h-64" />
      <MyVeBAL v-else :veBalLockInfo="veBalLockInfo" />
      <template v-if="isMobile">
        <BalLoadingBlock
          v-if="
            isLoading ||
            (!shouldLockRvlvDirectly &&
              (!lockablePool || !lockablePoolTokenInfo))
          "
          class="mt-4 h-12"
        />
        <HowToLock
          v-else-if="
            !shouldLockRvlvDirectly && lockablePool && lockablePoolTokenInfo
          "
          :lockablePool="lockablePool"
          :lockablePoolTokenInfo="lockablePoolTokenInfo"
        />
      </template>
    </template>
  </Col3Layout>
</template>
