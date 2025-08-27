<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { format } from 'date-fns';

import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { configService } from '@/services/config/config.service';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';

import RvlvUnlockActions from './components/RvlvUnlockActions.vue';

/**
 * TYPES
 */
type Props = {
  veBalLockInfo: VeBalLockInfo;
  totalRvlvTokens: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

/**
 * COMPOSABLES
 */
const { refetch: refetchLockInfo } = useVeBalLockInfoQuery();
const { t } = useI18n();
const { fNum } = useNumbers();

/**
 * STATE
 */
const unlockConfirmed = ref(false);
const veBalLockInfo = ref(props.veBalLockInfo);
const totalRvlvTokens = ref(props.totalRvlvTokens);

/**
 * COMPUTED
 */
const title = computed(() => {
  return unlockConfirmed.value
    ? t(`unlockVeBAL.previewModal.titles.unlock.confirmed`)
    : t(`unlockVeBAL.previewModal.titles.unlock.default`);
});

/**
 * METHODS
 */
function handleClose() {
  emit('close');
}

function handleSuccess() {
  unlockConfirmed.value = true;
  refetchLockInfo();
}
</script>

<template>
  <BalModal show :fireworks="unlockConfirmed" @close="handleClose">
    <template #header>
      <div class="flex items-center">
        <BalCircle
          v-if="unlockConfirmed"
          size="8"
          color="green"
          class="mr-2 text-white"
        >
          <BalIcon name="check" />
        </BalCircle>
        <h4>
          {{ title }}
        </h4>
      </div>
    </template>

    <!-- RVLV Amount to Unlock -->
    <div class="container">
      <div class="flex justify-between items-center p-3">
        <div>
          <div class="font-semibold">
            {{ fNum(totalRvlvTokens, FNumFormats.token) }} RVLV
          </div>
          <div class="text-gray-400 dark:text-gray-600">
            RVLV tokens to unlock
          </div>
        </div>
        <div class="grid grid-cols-1 gap-1">
          <BalAsset
            :address="configService.network.tokens.Addresses.BAL"
            :size="30"
          />
        </div>
      </div>
    </div>

    <!-- Unlock Summary -->
    <div class="summary-table">
      <h6 class="p-2">
        {{ $t('unlockVeBAL.previewModal.summary.title') }}
      </h6>
      <div class="p-2">
        <div class="summary-item-row">
          <div>
            {{ $t('unlockVeBAL.previewModal.summary.totalToUnlock') }}
          </div>
          <div>{{ fNum(totalRvlvTokens, FNumFormats.token) }} RVLV</div>
        </div>
        <div class="summary-item-row">
          <div>
            {{ $t('unlockVeBAL.previewModal.summary.totalVotingEscrow') }}
          </div>
          <div>{{ fNum(0, FNumFormats.token) }} veRVLV</div>
        </div>
        <div class="summary-item-row">
          <div>
            {{ $t('unlockVeBAL.previewModal.summary.expiredOn') }}
          </div>
          <div>
            {{ format(veBalLockInfo.lockedEndDate, PRETTY_DATE_FORMAT) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Unlock Actions -->
    <RvlvUnlockActions
      :totalRvlvTokens="totalRvlvTokens"
      :veBalLockInfo="veBalLockInfo"
      class="mt-4"
      @success="handleSuccess"
      @close="handleClose"
    />
  </BalModal>
</template>

<style scoped>
.container {
  @apply shadow-lg border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg;
}

.summary-table {
  @apply border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg mt-4;
}

.summary-item-row {
  @apply flex justify-between pb-2;
}
</style> 