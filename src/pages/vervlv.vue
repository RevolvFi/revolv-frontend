<script setup lang="ts">
/**
 * veBAL/veRVLV page with integrated lock functionality
 */
import VeBalInfo from '@/components/contextual/pages/vebal/VeBalInfo.vue';
import LMVoting from '@/components/contextual/pages/vebal/LMVoting/LMVoting.vue';
import InlineLockForm from '@/components/forms/lock_actions/LockForm/components/InlineLockForm.vue';
import { isVeBalSupported, isGaugesSupported } from '@/composables/useVeBAL';

import { provideUserStaking } from '@/providers/local/user-staking.provider';
import { providerUserPools } from '@/providers/local/user-pools.provider';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { provideVoting } from '@/components/contextual/pages/vebal/providers/voting.provider';

const userStaking = provideUserStaking();
providerUserPools(userStaking);
providePoolStaking();
provideVoting();

console.log(isGaugesSupported.value);
</script>

<template>
  <div>
    <!-- VeBal Info Section -->
    <div
      v-if="isVeBalSupported"
      class="py-8 lg:py-12 bg-gradient-to-r from-blue-600 to-purple-600"
    >
      <div class="lg:container px-4 lg:mx-auto">
        <VeBalInfo />
      </div>
    </div>

    <!-- Main Content Section -->
    <div class="py-8 xl:py-20 bg-gray-50 dark:bg-gray-850/50">
      <div v-if="isVeBalSupported" class="lg:container lg:mx-auto">
        <!-- Two Column Layout: Lock Form and Voter Rewards -->
        <div class="px-4 mb-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <!-- Left Column: Lock Form -->
            <div>
              <h3 class="mb-4 text-xl font-semibold">Lock Tokens</h3>
              <InlineLockForm />
            </div>

            <!-- Right Column: Voter Rewards (Placeholder) -->
            <div>
              <h3 class="mb-4 text-xl font-semibold">Voter Rewards</h3>
              <div
                class="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <p class="text-center text-gray-500 dark:text-gray-400">
                  Voter rewards claiming functionality coming soon...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isGaugesSupported"
      class="pb-16 xl:pb-20 bg-gray-50 dark:bg-gray-850/50"
    >
      <div class="lg:container lg:mx-auto">
        <div class="px-4">
          <LMVoting />
        </div>
      </div>
    </div>

    <!-- Voting Section Placeholder -->
    <!-- <div class="pb-16 bg-gray-50 xl:pb-20 dark:bg-gray-850/50">
      <div class="lg:container lg:mx-auto">
        <div class="px-4">
          <div
            class="p-6 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          >
            <p class="text-center text-gray-500 dark:text-gray-400">
              Incentives voting coming soon...
            </p>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>
