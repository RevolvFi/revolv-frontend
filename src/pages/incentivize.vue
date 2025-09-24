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
// import useNumbers from '@/composables/useNumbers';
import { TokenInfo } from '@/types/TokenList';
import { bnum } from '@/lib/utils';
import { telosVotingPools } from '@/components/contextual/pages/vebal/LMVoting/telos-voting-pools';
import { ApiVotingPool } from '@/services/balancer/gauges/gauge-controller.decorator';

/**
 * COMPOSABLES
 */
const { t } = useI18n();
// const { fNum } = useNumbers();
const { getToken, balanceFor } = useTokens();

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
const telosPools = computed((): ApiVotingPool[] => {
  return telosVotingPools('telos');
});

const selectedPool = computed((): ApiVotingPool | undefined => {
  const pool = telosPools.value.find(pool => pool.id === selectedPoolId.value);
  console.log('Selected pool ID:', selectedPoolId.value);
  console.log('Found pool:', pool);
  if (pool) {
    console.log('Formatted name:', formatPoolName(pool));
  }
  return pool;
});

const selectedToken = computed((): TokenInfo | null => {
  if (!selectedTokenAddress.value) return null;
  return getToken(selectedTokenAddress.value);
});

const poolOptions = computed(() => {
  console.log('Computing pool options...');
  const options = telosPools.value.map(pool => {
    const formattedName = formatPoolName(pool);
    console.log(`Pool ${pool.id}: ${formattedName}`);
    return {
      value: pool.id,
      text: formattedName,
    };
  });
  console.log('Pool options:', options);
  return options;
});

const tokenBalance = computed((): string => {
  if (!selectedTokenAddress.value) return '0';
  return balanceFor(selectedTokenAddress.value);
});

const canSubmit = computed((): boolean => {
  const hasPool = !!selectedPoolId.value;
  const hasToken = !!selectedTokenAddress.value;
  const hasAmount =
    !!incentiveAmount.value && incentiveAmount.value.trim() !== '';
  const amountIsValid = bnum(incentiveAmount.value).gt(0);
  const hasEnoughBalance = bnum(incentiveAmount.value).lte(tokenBalance.value);

  console.log('Submit validation:', {
    hasPool,
    hasToken,
    hasAmount,
    amountIsValid,
    hasEnoughBalance,
    incentiveAmount: incentiveAmount.value,
    tokenBalance: tokenBalance.value,
  });

  return hasPool && hasToken && hasAmount && amountIsValid && hasEnoughBalance;
});

const allowedTokens = computed((): string[] => {
  return [
    // "0x163c1d605d685dfb9eef518f0134b8f4a769074a", // tRVLV
    '0x98a5030a449d8833166c3f1d96db00ba2a082fbf', // RVLV
    '0xd102ce6a4db07d247fcc28f366a623df0938ca9e', // WTLOS
    '0xb4b01216a5bc8f1c8a33cd990a1239030e60c905', // STLOS
    '0xf1815bd50389c46847f0bda824ec8da914045d14', // USDC.e
    '0x674843c06ff83502ddb4d37c2e09c01cda38cbc8', // USDT
  ];
});

/**
 * METHODS
 */
function formatPoolName(pool: ApiVotingPool): string {
  console.log('pool', pool);

  if (!pool || !pool.tokens || pool.tokens.length === 0) {
    return 'Unknown Pool';
  }

  const tokens = pool.tokens.map(token => {
    const tokenInfo = getToken(token.address);
    return {
      ...token,
      ...tokenInfo,
      symbol: tokenInfo?.symbol || token.symbol,
    };
  });

  // Check if all tokens have equal weight (stable pool)
  const weights = tokens.map(token => parseFloat(token.weight || '0'));
  const isStable =
    weights.length > 0 && weights.every(weight => weight === weights[0]);

  if (isStable) {
    return tokens.map(token => token.symbol).join(' / ');
  }

  // Convert weights to percentages manually
  const result = tokens
    .map(token => {
      const weight = parseFloat(token.weight || '0');
      const percentage = Math.round(weight * 100);
      return `${percentage}% ${token.symbol}`;
    })
    .join(' / ');

  console.log('Final result:', result);
  return result;
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
  console.log('Amount changed:', amount);
  incentiveAmount.value = amount;
  error.value = '';
  success.value = '';

  // Debug the validation
  console.log('Amount validation:', {
    amount,
    isNumber: !isNaN(Number(amount)),
    isPositive: Number(amount) > 0,
    bnumGt: bnum(amount).gt(0),
    tokenBalance: tokenBalance.value,
    bnumLte: bnum(amount).lte(tokenBalance.value),
  });
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
    <div class="px-4 mx-auto max-w-6xl">
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

      <!-- Mobile: How it works at the top -->
      <div class="block lg:hidden">
        <BalCard class="p-6 mb-6">
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

      <!-- Desktop: Side-by-side layout -->
      <div class="flex flex-col lg:flex-row lg:gap-8">
        <!-- Main form content - made narrower -->
        <div class="flex-1 lg:max-w-2xl">
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
              </div>

              <!-- Token Selection -->
              <div>
                <label class="block mb-2 text-sm font-medium">
                  {{ $t('incentivize.selectToken', 'Select Incentive Token') }}
                </label>
                <TokenSelectInput
                  v-model="selectedTokenAddress"
                  :excludedTokens="[]"
                  :subsetTokens="allowedTokens"
                  @update:model-value="handleTokenChange"
                />
                <div
                  v-if="selectedToken"
                  class="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <BalAsset
                    :address="selectedToken.address"
                    class="mr-2 w-4 h-4"
                  />
                  <span
                    >{{ selectedToken.name }} ({{ selectedToken.symbol }})</span
                  >
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
                  :placeholder="$t('incentivize.amountPlaceholder', '0.0')"
                  :balanceLabel="$t('balance', 'Balance')"
                  :customBalance="tokenBalance"
                  :fixedToken="true"
                  @update:amount="handleAmountChange"
                />
                <!-- Custom validation message -->
                <div
                  v-if="selectedTokenAddress && !incentiveAmount"
                  class="mt-1 text-sm text-red-600"
                >
                  Amount is required
                </div>
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
        </div>

        <!-- Desktop: How it works sidebar - made wider -->
        <div class="hidden lg:block lg:flex-shrink-0 lg:w-96">
          <BalCard class="p-6">
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
      </div>
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
