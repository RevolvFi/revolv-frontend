<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { LockType } from '@/components/forms/lock_actions/LockForm/types';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import { expectedVeBal } from '@/composables/useVeBAL';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';
import { configService } from '@/services/config/config.service';
import { useTokens } from '@/providers/tokens.provider';

import useLockState from '../../composables/useLockState';
import LockActions from './components/LockActions.vue';
import LockAmount from './components/LockAmount.vue';
import LockSummary from './components/LockSummary.vue';

/**
 * TYPES
 */
type Props = {
  lockablePool?: Pool;
  lockablePoolTokenInfo?: TokenInfo;
  lockAmount: string;
  lockEndDate: string;
  lockType: LockType[];
  veBalLockInfo: VeBalLockInfo;
  totalLpTokens: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

/**
 * STATE
 */
const lockConfirmed = ref(false);
const lockablePool = ref(props.lockablePool);
const lockablePoolTokenInfo = ref(props.lockablePoolTokenInfo);
const lockAmount = ref(props.lockAmount);
const lockEndDate = ref(props.lockEndDate);
const lockType = ref(props.lockType);
const veBalLockInfo = ref(props.veBalLockInfo);
const totalLpTokens = ref(props.totalLpTokens);

// This value should be static when modal is opened.
const expectedVeBalAmount = expectedVeBal(
  totalLpTokens.value,
  lockEndDate.value
);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { refetch: refetchLockInfo } = useVeBalLockInfoQuery();
const { resetState } = useLockState();
const { getToken } = useTokens();

/**
 * COMPUTED
 */
const rvlvToken = computed(() =>
  getToken(configService.network.tokens.Addresses.BAL)
);

const title = computed(() => {
  if (lockType.value.length === 1) {
    return lockConfirmed.value
      ? t(`getVeBAL.previewModal.titles.${lockType.value[0]}.confirmed`)
      : t(`getVeBAL.previewModal.titles.${lockType.value[0]}.default`);
  }
  return lockConfirmed.value
    ? t(`getVeBAL.previewModal.titles.${LockType.CREATE_LOCK}.confirmed`)
    : t(`getVeBAL.previewModal.titles.${LockType.CREATE_LOCK}.default`);
});

/**
 * METHODS
 */
function handleClose() {
  emit('close');
}

function handleSuccess() {
  lockConfirmed.value = true;
  refetchLockInfo();
  resetState();
}
</script>

<template>
  <BalModal show :fireworks="lockConfirmed" @close="handleClose">
    <template #header>
      <div class="flex items-center">
        <BalCircle
          v-if="lockConfirmed"
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

    <LockAmount
      v-if="lockablePool"
      :lockablePool="lockablePool"
      :totalLpTokens="totalLpTokens"
    />

    <!-- RVLV Direct Locking Info -->
    <div v-else class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="flex items-center mb-3">
        <img
          v-if="rvlvToken?.logoURI"
          :src="rvlvToken.logoURI"
          :alt="rvlvToken.symbol"
          class="mr-3 w-8 h-8 rounded-full"
        />
        <div
          v-else
          class="flex justify-center items-center mr-3 w-8 h-8 bg-blue-500 rounded-full"
        >
          <span class="text-sm font-bold text-white">{{
            rvlvToken?.symbol?.[0] || 'R'
          }}</span>
        </div>
        <div>
          <h5 class="font-semibold">
            Lock {{ rvlvToken?.symbol || 'RVLV' }} Tokens
          </h5>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Amount: {{ lockAmount }} {{ rvlvToken?.symbol || 'RVLV' }}
          </p>
        </div>
      </div>
      <div class="text-sm">
        <div class="flex justify-between mb-1">
          <span>Lock End Date:</span>
          <span class="font-medium">{{
            new Date(lockEndDate).toLocaleDateString()
          }}</span>
        </div>
        <div class="flex justify-between">
          <span>Expected ve{{ rvlvToken?.symbol || 'RVLV' }}:</span>
          <span class="font-medium">{{ expectedVeBalAmount }}</span>
        </div>
      </div>
    </div>

    <LockSummary
      v-if="lockablePool"
      :lockablePool="lockablePool"
      :totalLpTokens="totalLpTokens"
      :lockAmount="lockAmount"
      :lockEndDate="lockEndDate"
      :expectedVeBalAmount="expectedVeBalAmount"
      :lockType="lockType"
      :veBalLockInfo="veBalLockInfo"
    />
    <LockActions
      :veBalLockInfo="veBalLockInfo"
      :lockConfirmed="lockConfirmed"
      :lockAmount="lockAmount"
      :lockEndDate="lockEndDate"
      :lockType="lockType"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      class="mt-4"
      @success="handleSuccess"
    />
  </BalModal>
</template>
