<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNetwork from '@/composables/useNetwork';
import { configService } from '@/services/config/config.service';
import MyVeRvlv from './MyVeBAL/components/MyVeRvlv.vue';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { veSymbol } = useNetwork();

/**
 * QUERIES
 */
const veBalLockInfoQuery = useVeBalLockInfoQuery();

/**
 * COMPUTED
 */
// Check if we should lock RVLV tokens directly (for Revolv) or LP tokens (for other networks)
const shouldLockRvlvDirectly = computed(() => {
  return configService.network.chainId === 40; // Telos chain ID
});

const currentVeSymbol = computed(() => {
  return shouldLockRvlvDirectly.value ? 'veRVLV' : veSymbol;
});

const veBalLockInfo = computed(() => veBalLockInfoQuery.data.value);

const benefits = computed(() => [
  t('veBAL.hero.benefits.boost'),
  t('veBAL.hero.benefits.vote'),
  t('veBAL.hero.benefits.earn'),
]);
</script>

<template>
  <div class="vebal-info">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <!-- Left Column: Info and Benefits -->
      <div>
        <p class="mb-2 text-sm font-medium text-blue-100 dark:text-blue-200">
          {{ currentVeSymbol }}
        </p>
        <h1 class="mb-4 text-3xl font-bold text-white">
          {{
            shouldLockRvlvDirectly
              ? 'Lock RVLV to Get veRVLV'
              : $t('veBAL.hero.title')
          }}
        </h1>
        <p class="mb-6 text-lg text-blue-50 dark:text-blue-100">
          {{
            shouldLockRvlvDirectly
              ? 'Lock your RVLV tokens to earn veRVLV and participate in governance'
              : 'Lock your LP tokens to earn veBAL and participate in governance'
          }}
        </p>

        <ul class="mb-6 space-y-2">
          <li
            v-for="(benefit, i) in benefits"
            :key="i"
            class="flex items-center text-white"
          >
            <span class="mr-2">–</span>
            {{ benefit }}
          </li>
        </ul>

        <a
          href="https://finance-symmetric.gitbook.io/symmetric-v3/tsymm-and-vtsymm"
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center text-blue-100 hover:text-white dark:text-blue-200 transition-colors"
        >
          {{ $t('veBAL.hero.buttons.learnMore') }}
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="ml-1 group-hover:text-pink-500 transition-colors"
          />
        </a>
      </div>

      <!-- Right Column: MyVeRvlv Component for RVLV Direct Locking -->
      <div v-if="shouldLockRvlvDirectly">
        <MyVeRvlv :veBalLockInfo="veBalLockInfo" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.vebal-info {
  @apply w-full;
}
</style> 