import { Contract } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { defaultAbiCoder } from '@ethersproject/abi';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { isSameAddress } from '@/lib/utils';
import {
  BalancerSDK,
  BalancerRelayer__factory,
  EncodeJoinPoolInput,
  Relayer,
  SimulationType,
  StablePoolJoinKind,
  WeightedPoolJoinKind,
} from '@symmetric-v3/sdk';
import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumberish } from '@ethersproject/bignumber';
import { Pool } from '@/services/pool/types';

type ConversionParams = {
  amount: BigNumber;
  isWrap: boolean; // e.g. is stETH to wstETH
};

const relayerInterface = BalancerRelayer__factory.createInterface();

/**
 * Convert underlying token amount to wrapper shares or vice versa using the wrapper's preview functions.
 * @param {string} wrapper - The address of the wrapper contract.
 * @param {BigNumber} amount - The amount to convert.
 * @param {boolean} isWrap - True if converting underlying to wrapper shares, false if converting wrapper shares to underlying.
 * @returns Converted value using the wrapper's preview functions.
 */
export async function convertERC4626Wrap(
  wrapper: string,
  { amount, isWrap }: ConversionParams
) {
  try {
    const wrapperContract = new Contract(
      wrapper,
      [
        'function convertToShares(uint256 assets) public view returns (uint256)',
        'function convertToAssets(uint256 shares) public view returns (uint256)',
      ],
      rpcProviderService.jsonProvider
    );

    if (isWrap) {
      // Convert underlying assets to wrapper shares
      console.log('convertToShares', amount.toString());
      const result = await wrapperContract.convertToShares(amount);
      console.log('convertToShares result', result.toString());
      return result;
    } else {
      // Convert wrapper shares to underlying assets
      console.log('convertToAssets', amount.toString());
      const result = await wrapperContract.convertToAssets(amount);
      console.log('convertToAssets result', result.toString());
      return result;
    }
  } catch (error) {
    throw new Error('Failed to convert ERC4626 wrapper amount', {
      cause: error,
    });
  }
}

/**
 * Get pool kind based on pool type
 */
function getPoolKind(poolType: string): number {
  return poolType === 'Weighted' ? 0 : 3; // 0 for Weighted, 3 for ComposableStable V2
}

/**
 * Encode the calls for a join pool with ERC4626 wrappers.
 * @param {Pool} pool - The pool to join.
 * @param {string[]} wrapperAddresses - The addresses of the wrapper contracts.
 * @param {string[]} tokenAddresses - The addresses of the tokens to join.
 * @param {string[]} amountsIn - The amounts of the tokens to join.
 * @param {string} signerAddress - The address of the signer.
 * @param {string} slippage - The slippage tolerance.
 * @param {JsonRpcSigner} signer - The signer.
 * @param {SimulationType} simulationType - The simulation type.
 * @param {string} relayerSignature - The relayer signature.
 * @returns The encoded calls.
 */
export const erc4626PoolJoin = async (
  pool: Pool,
  tokensIn: string[],
  amountsIn: string[],
  signerAddress: string,
  slippage: string,
  signer: JsonRpcSigner,
  simulationType: SimulationType,
  sdk: BalancerSDK,
  relayerSignature?: string
): Promise<{
  to: string;
  rawCalls: any[];
  encodedCalls: string[];
  encodedCall: string;
  minOut: string;
  expectedOut: string;
  priceImpact: string;
  value: BigNumberish;
}> => {
  const erc4626Pool = configService.network.pools?.Erc4626?.[pool.id];
  if (!erc4626Pool) {
    throw new Error(`Pool ${pool.id} is not configured as an ERC4626 pool`);
  }

  // First convert all underlying token amounts to wrapper amounts
  const estimatedWrapperAmounts = await Promise.all(
    erc4626Pool.wrappers.map(async (wrapper, index) => {
      const underlyingToken = erc4626Pool.underlying[index];
      // Check if the input token is either the wrapper or the underlying token
      const tokenIndex = tokensIn.findIndex(
        t => isSameAddress(t, wrapper) || isSameAddress(t, underlyingToken)
      );
      console.log('Wrapper conversion:', {
        wrapper,
        underlyingToken,
        tokenIndex,
        amount: tokenIndex >= 0 ? amountsIn[tokenIndex] : undefined,
        isSingleAssetJoin: tokensIn.length === 1,
      });
      if (
        tokenIndex === -1 ||
        !amountsIn[tokenIndex] ||
        amountsIn[tokenIndex] === '0'
      ) {
        return '0';
      }
      const convertedAmount = await convertERC4626Wrap(wrapper, {
        amount: BigNumber.from(amountsIn[tokenIndex]),
        isWrap: true,
      });
      console.log('Converted amount:', convertedAmount);
      return convertedAmount;
    })
  );
  console.log('estimatedWrapperAmounts', estimatedWrapperAmounts);

  // Create array of all amounts in correct order for pool tokens (excluding BPT)
  const allAmounts = erc4626Pool.tokensList
    .filter(token => token !== pool.address) // Exclude BPT
    .map(token => {
      // Check if this is a wrapper token
      const wrapperIndex = erc4626Pool.wrappers.indexOf(token);
      if (wrapperIndex >= 0) {
        const amount = estimatedWrapperAmounts[wrapperIndex]?.toString() || '0';
        console.log('Wrapper token amount:', { token, amount });
        return amount;
      }

      // For non-wrapper tokens, check if we have a direct amount
      const tokenIndex = tokensIn.indexOf(token);
      if (tokenIndex >= 0 && amountsIn[tokenIndex]) {
        const amount = amountsIn[tokenIndex];
        console.log('Non-wrapper token amount:', { token, amount });
        return amount;
      }

      console.log('Zero amount for token:', token);
      return '0';
    });

  console.log('allAmounts', allAmounts);

  // Call SDK to get expected output
  const { expectedOut, minOut, priceImpact } = await sdk.pools.generalisedJoin(
    pool.id,
    erc4626Pool.tokensList.filter(token => token !== pool.address), // Exclude BPT from tokens list
    allAmounts,
    signerAddress,
    slippage,
    signer,
    1,
    relayerSignature
  );

  // Create chained references for wrapper tokens
  const chainedReferences = erc4626Pool.wrappers.map(
    (_, index) =>
      `0xba1000000000000000000000000000000000000000000000000000000000000${
        index + 1
      }`
  );

  // Create wrapper calls with original order of chainedReferences
  const wrapperCalls = erc4626Pool.wrappers
    .map((address, index) => {
      const tokenIndex = tokensIn.indexOf(erc4626Pool.underlying[index]);
      // Skip if this is a single asset join with a non-wrapper token
      if (
        tokenIndex === -1 ||
        !amountsIn[tokenIndex] ||
        amountsIn[tokenIndex] === '0'
      ) {
        return null;
      }
      return Relayer.encodeWrapErc4626({
        wrappedToken: address,
        sender: signerAddress,
        recipient: signerAddress,
        amount: amountsIn[tokenIndex],
        outputReference: chainedReferences[index],
      });
    })
    .filter((call): call is string => call !== null); // Type guard to ensure string[]

  // Get non-wrapper tokens (excluding BPT)
  const nonWrapperTokens = erc4626Pool.tokensList.filter(
    token =>
      token !== pool.address && // Not BPT
      !erc4626Pool.wrappers.some(w => isSameAddress(w, token)) // Not a wrapper
  );

  // Create ordered token lists for join
  const baseTokens = [...nonWrapperTokens, ...erc4626Pool.wrappers].sort(
    (a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1)
  );

  // For stable pools, include BPT and sort all tokens together
  // For weighted pools, exclude BPT
  const joinTokens =
    pool.poolType === 'Weighted'
      ? baseTokens
      : [...baseTokens, pool.address].sort((a, b) =>
          a.toLowerCase() < b.toLowerCase() ? -1 : 1
        );

  // Create ordered amounts list matching joinTokens order
  const joinAmounts = joinTokens.map(token => {
    if (isSameAddress(token, pool.address)) {
      return '0'; // BPT amount is always 0 for joins
    }
    const wrapperIndex = erc4626Pool.wrappers.indexOf(token);
    if (wrapperIndex >= 0) {
      // Only use reference if we actually have a wrapper call for this token
      return wrapperCalls[wrapperIndex] ? chainedReferences[wrapperIndex] : '0';
    }
    const tokenIndex = tokensIn.indexOf(token);
    return tokenIndex >= 0 ? amountsIn[tokenIndex] : '0';
  });

  // For userData, we always exclude BPT from the amounts array
  const sortedAmountsWithoutBpt = baseTokens.map(token => {
    const wrapperIndex = erc4626Pool.wrappers.indexOf(token);
    if (wrapperIndex >= 0) {
      // Only use reference if we actually have a wrapper call for this token
      return wrapperCalls[wrapperIndex] ? chainedReferences[wrapperIndex] : '0';
    }
    const tokenIndex = tokensIn.indexOf(token);
    return tokenIndex >= 0 ? amountsIn[tokenIndex] : '0';
  });

  console.log('sortedAmountsWithoutBpt', sortedAmountsWithoutBpt);

  let userData: string;
  if (pool.poolType === 'Weighted') {
    userData = defaultAbiCoder.encode(
      ['uint256', 'uint256[]', 'uint256'],
      [
        WeightedPoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
        sortedAmountsWithoutBpt,
        minOut,
      ]
    );
  } else {
    userData = defaultAbiCoder.encode(
      ['uint256', 'uint256[]', 'uint256'],
      [
        StablePoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
        sortedAmountsWithoutBpt,
        minOut,
      ]
    );
  }

  const joinPoolRequest = {
    assets: joinTokens,
    maxAmountsIn: joinAmounts,
    userData,
    fromInternalBalance: false,
  };
  console.log('joinPoolRequest', joinPoolRequest);

  const joinPoolCall: EncodeJoinPoolInput = {
    poolId: pool.id,
    kind: getPoolKind(pool.poolType),
    sender: signerAddress,
    recipient: signerAddress,
    value: '0',
    outputReference: '0',
    joinPoolRequest,
  };

  const encodedJoinPoolCall = Relayer.encodeJoinPool(joinPoolCall);

  const encodedCalls: string[] = [...wrapperCalls, encodedJoinPoolCall];

  if (relayerSignature) {
    const relayerCall = Relayer.encodeSetRelayerApproval(
      configService.network.addresses.batchRelayer,
      true,
      relayerSignature
    );
    encodedCalls.unshift(relayerCall);
  }

  const encodedCall = relayerInterface.encodeFunctionData('multicall', [
    encodedCalls,
  ]);

  // These chained references will be used as amounts for the joinPool call
  return {
    to: configService.network.addresses.batchRelayer,
    rawCalls: [],
    encodedCalls,
    encodedCall,
    minOut,
    expectedOut,
    priceImpact,
    value: '0',
  };
};

export const erc4626PoolExit = async (
  pool: Pool,
  amount: string,
  userAddress: string,
  slippage: string,
  signer: JsonRpcSigner,
  sdk: BalancerSDK,
  authorisation?: string
) => {
  const erc4626Pool = configService.network.pools?.Erc4626?.[pool.id];
  if (!erc4626Pool) {
    throw new Error(`Pool ${pool.id} is not configured as an ERC4626 pool`);
  }
  console.log('pool.id', pool.id);
  console.log('amount', amount);
  console.log('userAddress', userAddress);

  const { estimatedAmountsOut, tokensOut, priceImpact } =
    await sdk.pools.getExitInfo(pool.id, amount, userAddress, signer);

  console.log('SDK Exit Info:', {
    estimatedAmountsOut,
    tokensOut,
    priceImpact,
  });

  // Sort tokens alphabetically as required by the pool contract
  const sortedTokens = [...erc4626Pool.tokensList].sort((a, b) =>
    a.toLowerCase() < b.toLowerCase() ? -1 : 1
  );

  console.log('Token ordering:', {
    original: erc4626Pool.tokensList,
    sorted: sortedTokens,
    poolAddress: pool.address,
  });

  // Create output references for wrapper tokens and store mapping
  const wrapperToReference = new Map<string, BigNumber>();
  const outputReferences = erc4626Pool.wrappers.map((wrapper, i) => {
    const wrapperIndex = sortedTokens.findIndex(token =>
      isSameAddress(token, wrapper)
    );
    const key = BigNumber.from(
      `0xba1000000000000000000000000000000000000000000000000000000000000${
        i + 1
      }`
    );
    wrapperToReference.set(wrapper.toLowerCase(), key);
    console.log('Wrapper Output Reference:', {
      wrapper,
      wrapperIndex,
      key: key.toHexString(),
    });
    return {
      index: wrapperIndex,
      key,
    };
  });

  let userData: string;
  if (pool.poolType === 'Weighted') {
    userData = defaultAbiCoder.encode(
      ['uint256', 'uint256'],
      [1, amount] // 1 = EXACT_BPT_IN_FOR_ALL_TOKENS_OUT
    );
  } else {
    userData = defaultAbiCoder.encode(
      ['uint256', 'uint256'],
      [2, amount] // 2 = EXACT_BPT_IN_FOR_ALL_TOKENS_OUT
    );
  }

  const exitPoolRequest = {
    assets: sortedTokens,
    minAmountsOut: sortedTokens.map(token => {
      if (isSameAddress(token, pool.address)) {
        return '0'; // BPT amount
      }
      // Find the index in tokensOut that matches this token
      const tokenOutIndex = tokensOut.findIndex(t => isSameAddress(t, token));
      if (tokenOutIndex >= 0) {
        return BigNumber.from(estimatedAmountsOut[tokenOutIndex])
          .mul(BigNumber.from(1000 - Number(slippage) * 10))
          .div(1000)
          .toString();
      }
      return '0';
    }),
    userData,
    toInternalBalance: false,
  };

  const exitCall = {
    poolId: pool.id,
    poolKind: getPoolKind(pool.poolType),
    sender: userAddress,
    recipient: userAddress,
    outputReferences,
    exitPoolRequest,
  };

  const encodedExitCall = Relayer.encodeExitPool(exitCall);

  // Create unwrap calls for each wrapper using the output references
  const unwrapCalls = erc4626Pool.wrappers.map(wrapper => {
    const referenceKey = wrapperToReference.get(wrapper.toLowerCase());
    if (!referenceKey) {
      throw new Error(`No output reference found for wrapper ${wrapper}`);
    }
    return Relayer.encodeUnwrapErc4626({
      wrappedToken: wrapper,
      sender: userAddress,
      recipient: userAddress,
      amount: referenceKey,
      outputReference: '0',
    });
  });

  const encodedCalls = [encodedExitCall, ...unwrapCalls];

  if (authorisation) {
    const relayerCall = Relayer.encodeSetRelayerApproval(
      configService.network.addresses.batchRelayer,
      true,
      authorisation
    );
    encodedCalls.unshift(relayerCall);
  }

  const encodedCall = relayerInterface.encodeFunctionData('multicall', [
    encodedCalls,
  ]);
  // Convert wrapper amounts to underlying amounts for display
  const convertedAmountsOut = await Promise.all(
    erc4626Pool.wrappers.map(async (wrapper, i) => {
      const underlyingToken = erc4626Pool.underlying[i];
      // Find the correct index in tokensOut for this wrapper
      const tokenIndex = tokensOut.findIndex(token =>
        isSameAddress(token, wrapper)
      );
      if (tokenIndex === -1) {
        console.warn(`Wrapper ${wrapper} not found in tokensOut`);
        return {
          token: underlyingToken,
          amount: '0',
        };
      }
      const wrapperAmount = estimatedAmountsOut[tokenIndex];
      const underlyingAmount = await convertERC4626Wrap(wrapper, {
        amount: BigNumber.from(wrapperAmount),
        isWrap: false,
      });
      return {
        token: underlyingToken,
        amount: underlyingAmount.toString(),
      };
    })
  );

  // Create map of wrapper addresses to their underlying tokens
  const wrapperToUnderlying = Object.fromEntries(
    erc4626Pool.wrappers.map((w, i) => [
      w.toLowerCase(),
      erc4626Pool.underlying[i],
    ])
  );

  // Process all tokens (both wrapper and non-wrapper)
  const processedAmounts = tokensOut.map((token, i) => {
    const isWrapper = erc4626Pool.wrappers.some(w => isSameAddress(w, token));
    if (isWrapper) {
      // Find the converted amount for this wrapper
      const convertedAmount = convertedAmountsOut.find(
        ({ token: underlyingToken }) =>
          isSameAddress(
            underlyingToken,
            wrapperToUnderlying[token.toLowerCase()]
          )
      );
      return {
        amount: convertedAmount?.amount || '0',
        token: wrapperToUnderlying[token.toLowerCase()],
      };
    } else {
      // Keep original amount and token for non-wrappers
      return {
        amount: estimatedAmountsOut[i],
        token,
      };
    }
  });
  // Calculate min amounts for all tokens
  const minAmountsOut = processedAmounts.map(({ amount }) =>
    BigNumber.from(amount)
      .mul(BigNumber.from(1000 - Number(slippage) * 10))
      .div(1000)
      .toString()
  );

  return {
    expectedAmountsOut: processedAmounts.map(({ amount }) => amount),
    minAmountsOut,
    tokensOut: processedAmounts.map(({ token }) => token),
    priceImpact: priceImpact.toString(),
    txReady: true,
    to: configService.network.addresses.batchRelayer,
    encodedCall,
    rawCalls: [],
    encodedCalls,
  };
};
