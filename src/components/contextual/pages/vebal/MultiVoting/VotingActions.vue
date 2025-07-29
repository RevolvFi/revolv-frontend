<script setup lang="ts">
import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import {
  VotingActionProps,
  useVotingActions,
} from './composables/useVotingActions';
import { veSymbol } from '@/composables/useNetwork';

const props = defineProps<VotingActionProps>();

const { handleFailed, handleSuccess, txState, votingActions } =
  useVotingActions(props);
</script>

<template>
  <transition>
    <BalActionSteps
      v-if="!txState.confirmed || !txState.receipt"
      :actions="votingActions"
      primaryActionType="voteForGauge"
      @success="handleSuccess"
      @failed="handleFailed"
    />
    <div v-else>
      <ConfirmationIndicator :txReceipt="txState.receipt" />

      <BalBtn
        tag="router-link"
        :to="{
          name: 'vervlv',
          params: { networkSlug: 'ethereum' },
        }"
        color="gray"
        outline
        block
        class="mt-2"
      >
        Return to {{ veSymbol }} list
      </BalBtn>
    </div>
  </transition>
</template>