import {
  EncodeJoinPoolInput,
  JoinPoolRequest,
  SimulationType,
} from '@symmetric-v3/sdk';
import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumberish } from '@ethersproject/bignumber';
import { Pool } from '@/services/pool/types';
import { Relayer } from '@symmetric-v3/sdk';

export const erc4626JoinCalls = async (
  pool: Pool,
  wrapperAddresses: string[],
  tokenAddresses: string[],
  amountsIn: string[],
  signerAddress: string,
  slippage: string,
  signer: JsonRpcSigner,
  simulationType: SimulationType,
  relayerSignature: string
): Promise<{
  to: string;
  encodedCalls: string[];
  encodedCall: string;
  minOut: string;
  expectedOut: string;
  priceImpact: string;
  value: BigNumberish;
}> => {
  // Get tokens in pool removing the pool token itself
  const tokensIn = tokenAddresses.filter(t => t !== pool.address);

  // Create chained references for each wrapper call
  const chainedReferenceAmounts = wrapperAddresses.map(
    (_, index) =>
      `0xba1000000000000000000000000000000000000000000000000000000000000${
        index + 1
      }`
  );

  // Create wrapper calls with chained references
  const wrapperCalls = wrapperAddresses.map((address, index) => {
    return Relayer.encodeWrapErc4626({
      wrappedToken: address,
      sender: signerAddress,
      recipient: signerAddress,
      amount: amountsIn[index],
      outputReference: chainedReferenceAmounts[index],
    });
  });

  const joinPoolCall: EncodeJoinPoolInput = Relayer.formatJoinPoolInput({
    poolId: pool.id,
    kind: 0,
    sender: signerAddress,
    recipient: signerAddress,
    value: '0',
    outputReference: '0',
    joinPoolRequest: {} as JoinPoolRequest,
    assets: tokensIn,
    maxAmountsIn: chainedReferenceAmounts,
    userData: '0',
    fromInternalBalance: false,
  });

  const encodedJoinPoolCall = Relayer.encodeJoinPool(joinPoolCall);

  const encodedCalls = [...wrapperCalls, encodedJoinPoolCall];

  if (relayerSignature) {
    const relayerCall = Relayer.encodeSetRelayerApproval(
      '0x0000000000000000000000000000000000000000',
      true,
      relayerSignature
    );
    encodedCalls.unshift(relayerCall);
  }

  // These chained references will be used as amounts for the joinPool call
  return {
    to: pool.address,
    encodedCalls,
    encodedCall: '',
    minOut: '0',
    expectedOut: '0',
    priceImpact: '0',
    value: '0',
  };
};

// const call: EncodeJoinPoolInput = Relayer.formatJoinPoolInput({
//   poolId: node.id,
//   kind: 0,
//   sender,
//   recipient,
//   value,
//   outputReference: this.getOutputRefValue(joinPathIndex, node).value,
//   joinPoolRequest: {} as JoinPoolRequest,
//   assets:
//     isNativeAssetJoin && !isSimulation
//       ? this.replaceWrappedNativeAsset(sortedTokens)
//       : sortedTokens, // Must include BPT token
//   maxAmountsIn: sortedAmounts,
//   userData,
//   fromInternalBalance,
// });
// const encodedCall = Relayer.encodeJoinPool(call);
