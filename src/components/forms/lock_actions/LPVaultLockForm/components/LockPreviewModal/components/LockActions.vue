<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { format } from 'date-fns';
import { computed, onBeforeMount, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import { LockType } from '@/components/forms/lock_actions/LockForm/types';
import useConfig from '@/composables/useConfig';
import useEthers from '@/composables/useEthers';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { dateTimeLabelFor } from '@/composables/useTime';
import useTransactions from '@/composables/useTransactions';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';
import { TransactionActionInfo } from '@/types/transactions';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { ApprovalAction } from '@/composables/approvals/types';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import { captureBalancerException } from '@/lib/utils/errors';
// import { useCrossChainSync } from '@/providers/cross-chain-sync.provider';

/**
 * TYPES
 */
type Props = {
  lockablePoolTokenInfo: TokenInfo;
  lockAmount: string;
  lockEndDate: string;
  lockType: LockType[];
  lockConfirmed: boolean;
  veBalLockInfo: VeBalLockInfo;
};

type LockActionState = {
  init: boolean;
  confirming: boolean;
  confirmed: boolean;
  confirmedAt: string;
  receipt?: TransactionReceipt;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'success', value: LockActionState[]): void;
}>();

/**
 * STATE
 */
const isLoadingApprovals = ref(true);
const lockActionStates = reactive<LockActionState[]>(
  props.lockType.map(() => ({
    init: false,
    confirming: false,
    confirmed: false,
    confirmedAt: '',
  }))
);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { networkConfig } = useConfig();
const { getProvider, explorerLinks, isMismatchedNetwork } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { fNum } = useNumbers();
const { getTokenApprovalActions } = useTokenApprovalActions();
// const { refetch: refetchSyncData } = useCrossChainSync();

const displayLockEndDate = ref('1742169600000');

const isExtendDisabled = computed(() => {
  if (!props.lockType.includes(LockType.EXTEND_LOCK)) return false;

  const currentLockEnd = new Date(props.veBalLockInfo.lockedEndDate);

  // Handle both date string and Unix timestamp in milliseconds
  const proposedLockEnd = isNaN(Number(props.lockEndDate))
    ? new Date(props.lockEndDate)
    : new Date(Number(props.lockEndDate));

  return currentLockEnd >= proposedLockEnd;
});

const lockActions = props.lockType.map((lockType, actionIndex) => ({
  label: t(`getLpVault.previewModal.actions.${lockType}.label`, [
    format(new Date(Number(displayLockEndDate.value)), PRETTY_DATE_FORMAT),
  ]),
  loadingLabel: t(`getLpVault.previewModal.actions.${lockType}.loadingLabel`),
  confirmingLabel: t(`getLpVault.previewModal.actions.${lockType}.confirming`),
  action: () => submit(lockType, actionIndex),
  stepTooltip: t(`getLpVault.previewModal.actions.${lockType}.tooltip`),
}));

const actions = ref<TransactionActionInfo[]>([...lockActions]);

/**
 * COMPUTED
 */
const lockActionStatesConfirmed = computed(() =>
  lockActionStates.every(lockActionState => lockActionState.confirmed)
);

const amountsToApprove = computed(() => [
  {
    address: props.lockablePoolTokenInfo.address,
    amount: props.lockAmount,
  },
]);

/**
 * METHODS
 */
async function handleTransaction(
  tx: TransactionResponse,
  lockType: LockType,
  actionIndex: number
): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: lockType,
    summary:
      lockType === LockType.EXTEND_LOCK
        ? t('transactionSummary.boostVault')
        : `${fNum(props.lockAmount, FNumFormats.token)} ${
            props.lockablePoolTokenInfo.symbol
          }`,
    details: {
      lockAmount: props.lockAmount,
      lockEndDate: displayLockEndDate.value,
      lockType,
    },
  });

  lockActionStates[actionIndex].confirmed = await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      lockActionStates[actionIndex].confirming = false;
      lockActionStates[actionIndex].receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      lockActionStates[actionIndex].confirmedAt = dateTimeLabelFor(confirmedAt);

      // refetchSyncData();
    },
    onTxFailed: () => {
      lockActionStates[actionIndex].confirming = false;
    },
  });
}

async function submit(lockType: LockType, actionIndex: number) {
  try {
    let tx: TransactionResponse;
    lockActionStates[actionIndex].init = true;
    console.log('lockAmount', props.lockAmount);
    console.log('lockEndDate', props.lockEndDate);

    // Validate lockAmount
    if (props.lockAmount && isNaN(Number(props.lockAmount))) {
      throw new Error('Invalid lock amount');
    }

    // Validate and format lockEndDate
    let formattedLockEndDate: string;
    if (props.lockEndDate) {
      const parsedDate = Number(props.lockEndDate);
      if (!isNaN(parsedDate)) {
        // If it's a valid number, assume it's a Unix timestamp in milliseconds
        formattedLockEndDate = new Date(parsedDate).toISOString();
      } else if (isNaN(Date.parse(props.lockEndDate))) {
        throw new Error('Invalid lock end date');
      } else {
        // It's already a valid date string, use as is
        formattedLockEndDate = props.lockEndDate;
      }
    } else {
      throw new Error('Lock end date is required');
    }

    if (lockType === LockType.CREATE_LOCK) {
      tx = await balancerContractsService.lpVault.createLock(
        getProvider(),
        props.lockAmount,
        formattedLockEndDate
      );
    } else if (lockType === LockType.EXTEND_LOCK) {
      tx = await balancerContractsService.lpVault.extendLock(
        getProvider(),
        formattedLockEndDate
      );
    } else if (lockType === LockType.INCREASE_LOCK) {
      tx = await balancerContractsService.lpVault.increaseLock(
        getProvider(),
        props.lockAmount
      );
    } else {
      throw new Error('Unsupported lockType provided');
    }

    lockActionStates[actionIndex].init = false;
    lockActionStates[actionIndex].confirming = true;

    console.log('Transaction:', tx);

    handleTransaction(tx, lockType, actionIndex);
    return tx;
  } catch (error) {
    lockActionStates[actionIndex].init = false;
    console.error('Lock action error:', error);
    captureBalancerException({
      error,
      context: { level: 'fatal', extra: { lockType, props } },
    });
    return Promise.reject(error);
  }
}

/**
 * WATCHERS
 */
watch(lockActionStatesConfirmed, () => {
  if (lockActionStatesConfirmed.value) {
    emit('success', lockActionStates);
  }
});

/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  const approvalActions = await getTokenApprovalActions({
    amountsToApprove: amountsToApprove.value,
    spender: networkConfig.addresses.lpVault2 as string,
    actionType: ApprovalAction.Locking,
    // veBAL approval should always only suggest the approval of the exact amount.
    forceMax: false,
  });
  actions.value.unshift(...approvalActions);
  isLoadingApprovals.value = false;
});
</script>

<template>
  <div>
    <BalActionSteps
      v-if="!lockActionStatesConfirmed"
      :actions="actions"
      :isLoading="isLoadingApprovals"
      :disabled="isMismatchedNetwork || isExtendDisabled"
      primaryActionType="extendLock"
    />
    <template v-else>
      <div
        v-for="(lockActionState, i) in lockActionStates"
        :key="i"
        class="flex justify-between items-center mt-4 text-sm text-gray-400 dark:text-gray-600"
      >
        <div class="flex items-center">
          <BalIcon name="clock" />
          <span class="ml-2">
            {{ lockActionState.confirmedAt }}
          </span>
        </div>
        <BalLink
          v-if="
            lockActionState.receipt &&
            props.lockType[0] !== LockType.EXTEND_LOCK
          "
          :href="explorerLinks.txLink(lockActionState.receipt.transactionHash)"
          external
          noStyle
          class="group flex items-center"
        >
          {{ networkConfig.explorerName }}
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="ml-px group-hover:text-pink-500 transition-colors"
          />
        </BalLink>
      </div>
      <!-- <BalAlert
        v-if="lockConfirmed && !veBalLockInfo.hasExistingLock"
        class="mt-4"
        type="tip"
        :title="t('getVeBAL.previewModal.firstVeBALReceived.title')"
        :description="t('getVeBAL.previewModal.firstVeBALReceived.description')"
      >
      </BalAlert> -->
      <!-- <BalAlert
        v-if="shouldResubmitVotes"
        class="mt-4"
        type="warning"
        :title="t('veBAL.liquidityMining.resubmit.hint.title')"
        :description="t('veBAL.liquidityMining.resubmit.hint.description')"
      >
      </BalAlert>
      <BalBtn
        tag="router-link"
        :to="{ name: 'vervlv', params: { networkSlug } }"
        color="gray"
        outline
        block
        class="mt-4"
      >
        {{ $t('getVeBAL.previewModal.returnToVeBalPage', { veSymbol }) }}
      </BalBtn> -->
    </template>
  </div>
</template>
