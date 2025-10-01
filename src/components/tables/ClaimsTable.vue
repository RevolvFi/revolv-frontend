<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useBreakpoints from '@/composables/useBreakpoints';
import { ColumnDefinition } from '@/components/_global/BalTable/types';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';
import useVoterRewardsQuery from '@/composables/queries/useVoterRewardsQuery';
import { bnum } from '@/lib/utils';
import { TokenInfo } from '@/types/TokenList';
import { useTokens } from '@/providers/tokens.provider';
import ClaimVoterRewardsBtn from '@/components/btns/ClaimVoterRewardsBtn.vue';

/**
 * TYPES
 */
export type VoterRewardRow = {
  token: TokenInfo;
  amount: string;
  value: string;
  proofs: {
    identifier: string;
    amount: string;
    proof: string[];
  }[];
};

type ProofsByToken = {
  [tokenAddress: string]: {
    proofs: {
      identifier: string;
      amount: string;
      proof: string[];
    }[];
    totalAmount: string;
  };
};

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum } = useNumbers();
const { getToken, priceFor } = useTokens();
const { data: voterRewards, isLoading } = useVoterRewardsQuery();
const { upToLargeBreakpoint } = useBreakpoints();
const { isWalletReady, isWalletConnecting } = useWeb3();

/**
 * STATE
 */
const columns = ref<ColumnDefinition<VoterRewardRow>[]>([
  {
    name: t('token'),
    id: 'token',
    accessor: 'token',
    Cell: 'tokenColumnCell',
    align: 'left',
    width: 50,
    noGrow: true,
  },
  {
    name: '',
    id: 'symbol',
    accessor: 'symbol',
    Cell: 'symbolColumnCell',
    width: 350,
  },
  {
    name: t('amount'),
    id: 'amount',
    align: 'right',
    width: 150,
    accessor: ({ amount }) => `${fNum(amount, FNumFormats.token)}`,
  },
  {
    name: t('value'),
    id: 'value',
    align: 'right',
    width: 150,
    totalsCell: 'totalValueCell',
    accessor: ({ value }) => fNum(value, FNumFormats.fiat),
  },
  {
    name: '',
    id: 'claim',
    accessor: 'claim',
    Cell: 'claimColumnCell',
    totalsCell: 'claimTotalCell',
    width: 150,
  },
]);

const selectedRows = ref<VoterRewardRow[]>([]);

/**
 * COMPUTED
 */
const rewardsData = computed(() => {
  if (!voterRewards.value?.proofs) return [] as VoterRewardRow[];

  const proofsByToken = Object.values(voterRewards.value.proofs)
    .flat()
    .reduce((acc: ProofsByToken, proof) => {
      if (!acc[proof.token]) {
        acc[proof.token] = {
          proofs: [],
          totalAmount: '0',
        };
      }

      acc[proof.token].proofs.push({
        identifier: proof.identifier,
        amount: proof.claimable,
        proof: proof.proof,
      });

      acc[proof.token].totalAmount = bnum(acc[proof.token].totalAmount)
        .plus(proof.claimable)
        .toString();

      return acc;
    }, {});

  const result = Object.entries(proofsByToken).map(([tokenAddress, data]) => {
    const tokenInfo = getToken(tokenAddress);
    const normalizedAmount = bnum(data.totalAmount)
      .div(10 ** (tokenInfo?.decimals || 18))
      .toString();

    // Calculate token value
    const tokenPrice = priceFor(tokenAddress);
    console.log('tokenPrice', tokenPrice);
    const value = bnum(normalizedAmount).times(tokenPrice).toString();

    return {
      token: {
        address: tokenAddress,
        symbol: tokenInfo?.symbol || tokenAddress,
        decimals: tokenInfo?.decimals || 18,
      },
      amount: normalizedAmount,
      value,
      proofs: data.proofs,
    };
  });

  return result;
});

// const totalClaimAmount = computed((): string =>
//   rewardsData.value
//     .reduce((acc, row) => acc.plus(row.amount), bnum('0'))
//     .toString()
// );

const totalClaimValue = computed((): string =>
  rewardsData.value
    .reduce((acc, row) => acc.plus(row.value), bnum('0'))
    .toString()
);

// const hasClaimableBalance = computed((): boolean => {
//   if (isLoading.value) return true;
//   return bnum(totalClaimAmount.value).gt(0);
// });

const noPoolsLabel = computed(() => {
  return isWalletReady.value || isWalletConnecting.value
    ? t('noRewardsToClaim', [configService.network.shortName])
    : t('connectYourWallet');
});

// Update the isRowSelected helper
const isRowSelected = (data: VoterRewardRow): boolean =>
  selectedRows.value.some(
    selected => selected.token.address === data.token.address
  );

// Update checkbox handling function
function handleCheckboxChange(data: VoterRewardRow, checked: boolean) {
  if (checked) {
    selectedRows.value.push(data);
  } else {
    selectedRows.value = selectedRows.value.filter(
      r => r.token.address !== data.token.address
    );
  }
}
</script>

<template>
  <BalCard
    shadow="lg"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      sticky="both"
      :noResultsLabel="noPoolsLabel"
      :data="rewardsData"
      :isLoading="isLoading"
      skeletonClass="h-24"
      :square="upToLargeBreakpoint"
    >
      <template #tokenColumnCell="{ token }">
        <div class="flex justify-center ml-4 xl:ml-0">
          <BalAsset :address="token.address" />
        </div>
      </template>

      <template #symbolColumnCell="{ token }">
        <div class="flex py-4 px-6">
          {{ token.symbol }}
        </div>
      </template>

      <template #totalValueCell>
        <div class="flex justify-end">
          {{ fNum(totalClaimValue, FNumFormats.fiat) }}
        </div>
      </template>

      <template #claimColumnCell="cellData">
        <div class="py-4 px-6">
          <input
            type="checkbox"
            :checked="isRowSelected(cellData)"
            class="w-5 h-5 bg-transparent border-2 cursor-pointer border-disabled"
            @change="(event) => handleCheckboxChange(cellData, (event.target as HTMLInputElement).checked)"
          />
        </div>
      </template>

      <template #claimTotalCell>
        <div>
          <ClaimVoterRewardsBtn
            :claims="selectedRows.flatMap(row => row.proofs)"
            :fiatValue="totalClaimValue"
            :disabled="!selectedRows.length"
            @success="selectedRows = []"
          />
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>
