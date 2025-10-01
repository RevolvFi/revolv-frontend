<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { RewardDistributor } from '@/services/balancer/contracts/contracts/reward-distributor';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import useVoterRewardsQuery from '@/composables/queries/useVoterRewardsQuery';

import TxActionBtn from './TxActionBtn/TxActionBtn.vue';

/**
 * TYPES
 */
type Props = {
  claims: {
    identifier: string;
    amount: string;
    proof: string[];
  }[];
  fiatValue: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'success'): void;
}>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum } = useNumbers();
const { account } = useWeb3();

/**
 * SERVICES
 */
const rewardDistributor = new RewardDistributor(
  configService.network.addresses.rewardDistributor ?? ''
);

const voterRewardsQuery = useVoterRewardsQuery();

/**
 * METHODS
 */
function claimTx() {
  const formattedClaims = props.claims.map(claim => ({
    identifier: claim.identifier,
    account: account.value,
    amount: claim.amount,
    merkleProof: claim.proof,
  }));

  console.log('formattedClaims', formattedClaims);

  return rewardDistributor.claim(formattedClaims);
}
</script>

<template>
  <TxActionBtn
    :label="$t('claim')"
    color="gradient"
    size="sm"
    :actionFn="claimTx"
    action="claim"
    :onConfirmFn="voterRewardsQuery.refetch"
    :summary="`${t('claim')} ${fNum(fiatValue, FNumFormats.fiat)}`"
    :confirmingLabel="$t('claiming')"
    v-bind="$attrs"
    @success="emit('success')"
  />
</template> 