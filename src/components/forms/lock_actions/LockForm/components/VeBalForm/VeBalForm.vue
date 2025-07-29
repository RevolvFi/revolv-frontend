<script setup lang="ts">
import { computed, ref, toRef } from 'vue';

import { LockType } from '@/components/forms/lock_actions/LockForm/types';
import { useTokens } from '@/providers/tokens.provider';
import { expectedVeBal } from '@/composables/useVeBAL';
import { bnum } from '@/lib/utils';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';

import useLockAmount from '../../composables/useLockAmount';
import useLockEndDate from '../../composables/useLockEndDate';
import useLockState from '../../composables/useLockState';
import LockPreviewModal from '../LockPreviewModal/LockPreviewModal.vue';
import LockAmount from './components/LockAmount.vue';
import LockEndDate from './components/LockEndDate.vue';
import Summary from './components/Summary.vue';
import RvlvLockAmount from './components/RvlvLockAmount.vue';

/**
 * TYPES
 */
type Props = {
  lockablePool?: Pool;
  lockablePoolTokenInfo?: TokenInfo;
  veBalLockInfo?: VeBalLockInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPUTED
 */
// Check if we should lock RVLV tokens directly (for Revolv) or LP tokens (for other networks)
const shouldLockRvlvDirectly = computed(() => {
  return configService.network.chainId === 40; // Telos chain ID
});

/**
 * STATE
 */
const showPreviewModal = ref(false);

const { lockEndDate, lockAmount } = useLockState();
const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } =
  useWeb3();

const { isValidLockAmount, isIncreasedLockAmount, totalLpTokens } =
  useLockAmount(toRef(props, 'veBalLockInfo'));

const {
  minLockEndDateTimestamp,
  maxLockEndDateTimestamp,
  isValidLockEndDate,
  isExtendedLockEndDate,
} = useLockEndDate(props.veBalLockInfo);

console.log('minLockEndDateTimestamp', minLockEndDateTimestamp);
console.log('maxLockEndDateTimestamp', maxLockEndDateTimestamp);
console.log('isValidLockEndDate', isValidLockEndDate);
console.log('isExtendedLockEndDate', isExtendedLockEndDate);

/**
 * COMPOSABLES
 */
const { balanceFor } = useTokens();

/**
 * COMPUTED
 */
const lockablePoolBptBalance = computed(() => {
  if (shouldLockRvlvDirectly.value) {
    // For RVLV direct locking, return RVLV token balance
    return balanceFor(configService.network.tokens.Addresses.BAL);
  }
  if (!props.lockablePool) return bnum(0);
  return balanceFor(props.lockablePool.address);
});

const submissionDisabled = computed(() => {
  if (isMismatchedNetwork.value) {
    return true;
  }

  if (props.veBalLockInfo?.hasExistingLock && !props.veBalLockInfo?.isExpired) {
    return !isIncreasedLockAmount.value && !isExtendedLockEndDate.value;
  }

  return (
    !bnum(lockablePoolBptBalance.value).gt(0) ||
    !isValidLockAmount.value ||
    !isValidLockEndDate.value
  );
});

const expectedVeBalAmount = computed(() => {
  if (submissionDisabled.value) {
    return '0';
  }

  return expectedVeBal(totalLpTokens.value, lockEndDate.value);
});

const lockType = computed(() => {
  if (props.veBalLockInfo?.hasExistingLock && !props.veBalLockInfo?.isExpired) {
    if (isIncreasedLockAmount.value && isExtendedLockEndDate.value) {
      return [LockType.INCREASE_LOCK, LockType.EXTEND_LOCK];
    }
    if (isExtendedLockEndDate.value) {
      return [LockType.EXTEND_LOCK];
    }
    if (isIncreasedLockAmount.value) {
      return [LockType.INCREASE_LOCK];
    }
  }
  return [LockType.CREATE_LOCK];
});

/**
 * METHODS
 */
function handleClosePreviewModal() {
  showPreviewModal.value = false;
}

function handleShowPreviewModal() {
  if (submissionDisabled.value) return;
  showPreviewModal.value = true;
}
</script>

<template>
  <BalCard
    shadow="none"
    noBorder
    class="rounded-xl border shadow-lg backdrop-blur-lg bg-white/5 dark:bg-white/10 border-white/30 dark:border-white/20"
  >
    <template #header>
      <div class="w-full">
        <div class="pb-1.5 text-xs leading-none text-secondary">
          {{ configService.network.chainName }}
        </div>
      </div>
    </template>

    <LockAmount
      v-if="!shouldLockRvlvDirectly && lockablePool && lockablePoolTokenInfo"
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
    />
    <RvlvLockAmount v-else-if="shouldLockRvlvDirectly" />

    <LockEndDate
      :minLockEndDateTimestamp="minLockEndDateTimestamp"
      :maxLockEndDateTimestamp="maxLockEndDateTimestamp"
      :veBalLockInfo="veBalLockInfo"
    />

    <Summary :expectedVeBalAmount="expectedVeBalAmount" />

    <div class="mt-6">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        color="gradient"
        block
        @click="startConnectWithInjectedProvider"
      />
      <BalBtn
        v-else
        color="gradient"
        block
        :disabled="submissionDisabled"
        @click="handleShowPreviewModal"
      >
        {{ $t('preview') }}
      </BalBtn>
    </div>
  </BalCard>
  <teleport to="#modal">
    <LockPreviewModal
      v-if="
        showPreviewModal &&
        veBalLockInfo &&
        (shouldLockRvlvDirectly || (lockablePool && lockablePoolTokenInfo))
      "
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      :lockAmount="lockAmount"
      :lockEndDate="lockEndDate"
      :lockType="lockType"
      :veBalLockInfo="veBalLockInfo"
      :totalLpTokens="totalLpTokens"
      @close="handleClosePreviewModal"
    />
  </teleport>
</template>
