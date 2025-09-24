<!-- eslint-disable @typescript-eslint/no-non-null-assertion -->
<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { utils } from 'ethers';

import BalModal from '@/components/_global/BalModal/BalModal.vue';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';
import BalStack from '@/components/_global/BalStack/BalStack.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';

import { useTokens } from '@/providers/tokens.provider';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { TokenInfo } from '@/types/TokenList';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import useTransactions from '@/composables/useTransactions';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import { ApprovalAction } from '@/composables/approvals/types';
import BribeMarketAbi from '@/lib/abi/BribeMarket.json';
import { configService } from '@/services/config/config.service';
import { parseUnits } from '@ethersproject/units';
import { TransactionActionInfo } from '@/types/transactions';
import { ApiVotingPool } from '@/services/balancer/gauges/gauge-controller.decorator';

type Props = {
  selectedPool: ApiVotingPool;
  selectedToken: TokenInfo;
  incentiveAmount: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();
const emit = defineEmits(['close', 'success']);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum } = useNumbers();
const { getToken } = useTokens();
const { getSigner } = useWeb3();
const { addTransaction } = useTransactions();
const { getTokenApprovalActions } = useTokenApprovalActions();

/**
 * STATE
 */
const tokenApprovalActions = ref<TransactionActionInfo[]>([]);
const loadingApprovals = ref(true);

/**
 * COMPUTED
 */
const bribeMarketAddress = computed(() => {
  return configService.network.addresses.bribeMarket;
});

const bribeVaultAddress = computed(() => {
  return configService.network.addresses.bribeVault;
});

const poolName = computed(() => {
  return formatPoolName(props.selectedPool);
});

const actions = computed((): TransactionActionInfo[] => {
  const actionsList: TransactionActionInfo[] = [];

  // Add token approval actions
  if (tokenApprovalActions.value.length > 0) {
    actionsList.push(...tokenApprovalActions.value);
  }

  // Add deposit bribe action
  actionsList.push({
    label: t('incentivize.confirmDeposit', 'Confirm Incentive Deposit'),
    loadingLabel: t('incentivize.depositing', 'Depositing incentive...'),
    confirmingLabel: t('confirming'),
    stepTooltip: t(
      'incentivize.depositTooltip',
      'Deposit incentive to the gauge'
    ),
    action: depositBribe as () => Promise<any>,
  });

  return actionsList;
});

/**
 * METHODS
 */
function formatPoolName(pool: ApiVotingPool): string {
  const tokens = pool.tokens.map(token => ({
    ...token,
    ...getToken(token.address),
  }));

  if (pool.type === 'STABLE') {
    return tokens.map(token => token.symbol).join(' / ');
  }

  return tokens
    .map(
      token =>
        `${fNum(token.weight || '0', {
          style: 'percent',
          maximumFractionDigits: 0,
        })} ${token.symbol}`
    )
    .join(' / ');
}

function generateProposalHash(gaugeAddress: string): string {
  // Generate keccak256(abi.encodePacked(gauge.address))
  // For abi.encodePacked(address), we just need the address bytes
  const hash = utils.solidityKeccak256(['address'], [gaugeAddress]);
  console.log('hash', hash);
  return hash;
}

async function depositBribe(): Promise<any> {
  const txBuilder = new TransactionBuilder(getSigner());

  // Convert amount to wei
  const amountWei = parseUnits(
    props.incentiveAmount,
    props.selectedToken.decimals
  );

  // Generate proposal hash from gauge address
  const proposalHash = generateProposalHash(props.selectedPool.gauge.address);

  // Call depositBribe function
  const tx = await txBuilder.contract.sendTransaction({
    contractAddress: bribeMarketAddress.value!,
    abi: BribeMarketAbi.abi,
    action: 'depositBribe',
    params: [
      proposalHash, // _proposal
      props.selectedToken.address, // _token
      amountWei.toString(), // _amount
      '0', // _maxTokensPerVote (0 means no limit)
      '1', // _periods (1 period)
    ],
  });

  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'invest',
    summary: t('incentivize.depositSummary', {
      pool: poolName.value,
    }),
    details: {
      contractAddress: bribeMarketAddress.value,
      tokenAddress: props.selectedToken.address,
      amount: props.incentiveAmount,
    },
  });

  emit('success');
  return tx;
}

function onClose() {
  emit('close');
}

/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  tokenApprovalActions.value = await getTokenApprovalActions({
    amountsToApprove: [
      {
        address: props.selectedToken.address,
        amount: props.incentiveAmount,
      },
    ],
    spender: bribeVaultAddress.value!,
    actionType: ApprovalAction.Incentivize,
  });
  loadingApprovals.value = false;
});
</script>

<template>
  <BalModal show @close="onClose">
    <div>
      <BalStack horizontal align="center" spacing="xs" class="mb-4">
        <button class="flex text-blue-500 hover:text-blue-700" @click="onClose">
          <BalIcon class="flex" name="chevron-left" />
        </button>
        <h4>
          {{ $t('incentivize.confirmIncentive', 'Confirm Incentive') }}
        </h4>
      </BalStack>

      <!-- Summary Card -->
      <BalCard class="mb-6">
        <template #header>
          <div class="p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-lg font-semibold">
              {{ $t('incentivize.incentiveSummary', 'Incentive Summary') }}
            </h3>
          </div>
        </template>
        <div class="p-4">
          <div class="space-y-4">
            <!-- Pool Information -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('incentivize.pool', 'Pool') }}
              </span>
              <span class="font-medium">{{ poolName }}</span>
            </div>

            <!-- Token Information -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('incentivize.incentiveToken', 'Incentive Token') }}
              </span>
              <div class="flex items-center">
                <BalAsset
                  :address="selectedToken.address"
                  class="mr-2 w-5 h-5"
                />
                <span class="font-medium">{{ selectedToken.symbol }}</span>
              </div>
            </div>

            <!-- Amount Information -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('incentivize.amount', 'Amount') }}
              </span>
              <span class="font-medium">
                {{ fNum(incentiveAmount, FNumFormats.token) }}
                {{ selectedToken.symbol }}
              </span>
            </div>

            <!-- Gauge Information -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('incentivize.gauge', 'Gauge') }}
              </span>
              <span class="text-xs font-mono">
                {{ selectedPool.gauge.address }}
              </span>
            </div>
          </div>
        </div>
      </BalCard>

      <!-- Action Steps -->
      <BalActionSteps
        :actions="actions"
        primaryActionType="invest"
        :disabled="loadingApprovals"
      />

      <!-- Information Alert -->
      <BalAlert
        class="p-3 mt-4"
        type="tip"
        size="md"
        :title="$t('incentivize.info.title', 'How it works')"
        :description="
          $t(
            'incentivize.info.description',
            'Your incentive will be deposited to the BribeMarket contract and distributed to voters who vote for this pool gauge.'
          )
        "
        block
      />
    </div>
  </BalModal>
</template>
