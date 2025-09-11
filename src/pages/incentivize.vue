<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalSelectInput from '@/components/_global/BalSelectInput/BalSelectInput.vue';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';
import TokenSelectInput from '@/components/inputs/TokenSelectInput/TokenSelectInput.vue';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import IncentivizePreviewModal from '@/components/modals/IncentivizePreviewModal.vue';

import { useTokens } from '@/providers/tokens.provider';
import useVotingPools from '@/composables/useVotingPools';
import useNumbers from '@/composables/useNumbers';
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { TokenInfo } from '@/types/TokenList';
import { bnum } from '@/lib/utils';
import { isRequired } from '@/lib/utils/validations';

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum } = useNumbers();
const { getToken, balanceFor } = useTokens();
const { votingPools } = useVotingPools();

/**
 * STATE
 */
const selectedPoolId = ref<string>('');
const selectedTokenAddress = ref<string>('');
const incentiveAmount = ref<string>('');
const isValidAmount = ref<boolean>(false);
const showPreviewModal = ref<boolean>(false);
const error = ref<string>('');
const success = ref<string>('');

/**
 * COMPUTED
 */
const selectedPool = computed((): VotingPool | undefined => {
  return votingPools.value.find(pool => pool.id === selectedPoolId.value);
});

const selectedToken = computed((): TokenInfo | null => {
  if (!selectedTokenAddress.value) return null;
  return getToken(selectedTokenAddress.value);
});

const poolOptions = computed(() => {
  return votingPools.value.map(pool => ({
    value: pool.id,
    text: formatPoolName(pool),
  }));
});

const tokenBalance = computed((): string => {
  if (!selectedTokenAddress.value) return '0';
  return balanceFor(selectedTokenAddress.value);
});

const canSubmit = computed((): boolean => {
  return !!(
    selectedPoolId.value &&
    selectedTokenAddress.value &&
    incentiveAmount.value &&
    isValidAmount.value &&
    bnum(incentiveAmount.value).gt(0) &&
    bnum(incentiveAmount.value).lte(tokenBalance.value)
  );
});

/**
 * METHODS
 */
function formatPoolName(pool: VotingPool): string {
  const tokens = pool.tokens.map(token => ({
    ...token,
    ...getToken(token.address),
  }));

  if (pool.poolType === 'Stable' || pool.poolType === 'ComposableStable') {
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

function handlePoolChange(poolId: string) {
  selectedPoolId.value = poolId;
  error.value = '';
  success.value = '';
}

function handleTokenChange(tokenAddress: string) {
  selectedTokenAddress.value = tokenAddress;
  error.value = '';
  success.value = '';
}

function handleAmountChange(amount: string) {
  incentiveAmount.value = amount;
  error.value = '';
  success.value = '';
}

function handleSubmit() {
  if (!canSubmit.value || !selectedPool.value || !selectedToken.value) return;

  showPreviewModal.value = true;
}

function handleModalClose() {
  showPreviewModal.value = false;
}

function handleModalSuccess() {
  showPreviewModal.value = false;
  success.value = t('incentivize.success', 'Incentive deposited successfully!');

  // Reset form on success
  selectedPoolId.value = '';
  selectedTokenAddress.value = '';
  incentiveAmount.value = '';
  isValidAmount.value = false;
}

/**
 * WATCHERS
 */
watch([selectedPoolId, selectedTokenAddress], () => {
  // Reset amount when pool or token changes
  incentiveAmount.value = '';
  isValidAmount.value = false;
  error.value = '';
  success.value = '';
});
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-2xl">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-bold">
          {{ $t('incentivize.title', 'Incentivize Pool Gauge') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{
            $t(
              'incentivize.description',
              'Add incentives to encourage voting for specific pool gauges'
            )
          }}
        </p>
      </div>

      <BalCard class="p-6">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Pool Selection -->
          <div>
            <label class="block mb-2 text-sm font-medium">
              {{ $t('incentivize.selectPool', 'Select Pool') }}
            </label>
            <BalSelectInput
              v-model="selectedPoolId"
              :options="poolOptions"
              name="pool"
              :defaultText="
                $t(
                  'incentivize.selectPoolPlaceholder',
                  'Choose a pool to incentivize'
                )
              "
              @change="handlePoolChange"
            />
            <p
              v-if="selectedPool"
              class="mt-2 text-sm text-gray-600 dark:text-gray-400"
            >
              {{
                $t('incentivize.poolInfo', 'Pool: {name}', {
                  name: formatPoolName(selectedPool),
                })
              }}
            </p>
          </div>

          <!-- Token Selection -->
          <div>
            <label class="block mb-2 text-sm font-medium">
              {{ $t('incentivize.selectToken', 'Select Incentive Token') }}
            </label>
            <TokenSelectInput
              v-model="selectedTokenAddress"
              :excludedTokens="[]"
              @update:model-value="handleTokenChange"
            />
            <div
              v-if="selectedToken"
              class="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <BalAsset :address="selectedToken.address" class="mr-2 w-4 h-4" />
              <span>{{ selectedToken.name }} ({{ selectedToken.symbol }})</span>
            </div>
          </div>

          <!-- Amount Input -->
          <div>
            <label class="block mb-2 text-sm font-medium">
              {{ $t('incentivize.amount', 'Incentive Amount') }}
            </label>
            <TokenInput
              v-model:address="selectedTokenAddress"
              v-model:amount="incentiveAmount"
              v-model:isValid="isValidAmount"
              name="amount"
              :rules="[
                isRequired(
                  $t('incentivize.amountRequired', 'Amount is required')
                ),
              ]"
              :placeholder="$t('incentivize.amountPlaceholder', '0.0')"
              :balanceLabel="$t('balance', 'Balance')"
              :customBalance="tokenBalance"
              :fixedToken="true"
              @update:amount="handleAmountChange"
            />
          </div>

          <!-- Error Display -->
          <BalAlert
            v-if="error"
            type="error"
            :title="$t('error', 'Error')"
            :description="error"
            block
          />

          <!-- Success Display -->
          <BalAlert
            v-if="success"
            type="info"
            :title="$t('success', 'Success')"
            :description="success"
            block
          />

          <!-- Submit Button -->
          <div class="pt-4">
            <BalBtn
              :label="$t('incentivize.submit', 'Submit Incentive')"
              color="gradient"
              :disabled="!canSubmit"
              block
              type="submit"
            />
          </div>
        </form>
      </BalCard>

      <!-- Information Card -->
      <BalCard class="p-6 mt-6">
        <h3 class="mb-3 text-lg font-semibold">
          {{ $t('incentivize.info.title', 'How it works') }}
        </h3>
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            {{
              $t(
                'incentivize.info.step1',
                '1. Select a pool from the voting gauge list'
              )
            }}
          </p>
          <p>
            {{
              $t(
                'incentivize.info.step2',
                '2. Choose a token to use as incentive'
              )
            }}
          </p>
          <p>
            {{
              $t(
                'incentivize.info.step3',
                '3. Enter the amount you want to allocate'
              )
            }}
          </p>
          <p>
            {{
              $t(
                'incentivize.info.step4',
                '4. Approve the token for the Bribe Vault'
              )
            }}
          </p>
          <p>
            {{
              $t(
                'incentivize.info.step5',
                '5. Submit to add the incentive to the gauge'
              )
            }}
          </p>
        </div>
      </BalCard>
    </div>

    <!-- Preview Modal -->
    <IncentivizePreviewModal
      v-if="showPreviewModal && selectedPool && selectedToken"
      :selectedPool="selectedPool"
      :selectedToken="selectedToken"
      :incentiveAmount="incentiveAmount"
      @close="handleModalClose"
      @success="handleModalSuccess"
    />
  </div>
</template>
