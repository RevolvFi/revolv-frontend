import { Contract } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { WeiPerEther as ONE } from '@ethersproject/constants';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import {
  BalancerSDK,
  BalancerRelayer__factory,
  EncodeJoinPoolInput,
  JoinPoolRequest,
  Relayer,
  SimulationType,
  StablePoolEncoder,
  WeightedPoolEncoder,
} from '@symmetric-v3/sdk';
import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumberish } from '@ethersproject/bignumber';
import { Pool } from '@/services/pool/types';

type ConversionParams = {
  amount: BigNumber;
  isWrap: boolean; // e.g. is stETH to wstETH
};

function getRateProviderAddress(wrapper: string) {
  const rateProviderInfo =
    configService.network.rateProviders[wrapper.toLowerCase()];
  if (!rateProviderInfo || Object.keys(rateProviderInfo).length === 0)
    throw new Error('ERC4626 wrapper rate provider not set in config');
  const rateProvider = Object.keys(rateProviderInfo)[0];
  return rateProvider;
}

const relayerInterface = BalancerRelayer__factory.createInterface();

/**
 * Convert stETH amount to wstETH or vice versa. Only relevant on mainnet when wrapping or unwrapping.
 * @param {string} wrapper - The address of the wrapper contract.
 * @param {BigNumber} amount - The amount to convert, could be stETH or wstETH value.
 * @param {boolean} isWrap - True if wrapping stETH to wstETH, false if unwrapping wstETH to stETH.
 * @returns Converted value for wrap or unwrap, if input is stETH, returns wstETH value and vice versa.
 */
export async function convertERC4626Wrap(
  wrapper: string,
  { amount, isWrap }: ConversionParams
) {
  try {
    console.log('convertERC4626Wrap', wrapper, amount, isWrap);
    console.log(getRateProviderAddress(wrapper));
    const rateProvider = new Contract(
      getRateProviderAddress(wrapper),
      ['function getRate() external view returns (uint256)'],
      rpcProviderService.jsonProvider
    );

    const rate = await rateProvider.getRate();

    return isWrap ? amount.mul(ONE).div(rate) : amount.mul(rate).div(ONE);
  } catch (error) {
    throw new Error('Failed to convert to ERC4626 wrapper', { cause: error });
  }
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
  tokenAddresses: string[],
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
  console.log('tokenAddresses', tokenAddresses);
  console.log('amountsIn', amountsIn);

  const erc4626Pool = configService.network.pools?.Erc4626?.[pool.id];
  if (!erc4626Pool) {
    throw new Error(`Pool ${pool.id} is not configured as an ERC4626 pool`);
  }

  const estimatedWrapperAmounts = await Promise.all(
    erc4626Pool.wrappers.map(async (wrapper, index) => {
      const underlyingToken = erc4626Pool.underlying[index];
      const tokenIndex = tokenAddresses.indexOf(underlyingToken);
      return convertERC4626Wrap(wrapper, {
        amount: BigNumber.from(amountsIn[tokenIndex]),
        isWrap: true,
      });
    })
  );

  // Create array of all amounts in correct order for pool tokens (excluding BPT)
  const allAmounts = erc4626Pool.tokensList
    .filter(token => token !== pool.address) // Exclude BPT
    .map(token => {
      const wrapperIndex = erc4626Pool.wrappers.indexOf(token);
      if (wrapperIndex >= 0) {
        return estimatedWrapperAmounts[wrapperIndex].toString(); // Wrapper tokens
      }
      const tokenIndex = tokenAddresses.indexOf(token);
      return tokenIndex >= 0 ? amountsIn[tokenIndex] : '0'; // Non-wrapper tokens
    });

  // Call SDK to get expected output
  const { expectedOut, minOut, priceImpact } = await sdk.pools.generalisedJoin(
    pool.id,
    erc4626Pool.tokensList.filter(token => token !== pool.address), // Exclude BPT from tokens list
    allAmounts,
    signerAddress,
    slippage,
    signer,
    simulationType,
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
  const wrapperCalls = erc4626Pool.wrappers.map((address, index) => {
    const tokenIndex = tokenAddresses.indexOf(erc4626Pool.underlying[index]);
    return Relayer.encodeWrapErc4626({
      wrappedToken: address,
      sender: signerAddress,
      recipient: signerAddress,
      amount: amountsIn[tokenIndex],
      outputReference: chainedReferences[index],
    });
  });

  // For userData, include both wrapper references and non-wrapper amounts (no BPT)
  const userDataAmounts = erc4626Pool.tokensList
    .filter(token => token !== pool.address) // Exclude BPT
    .map(token => {
      const wrapperIndex = erc4626Pool.wrappers.indexOf(token);
      if (wrapperIndex >= 0) {
        return chainedReferences[wrapperIndex]; // Use chainedReference for wrappers
      }
      const tokenIndex = tokenAddresses.indexOf(token);
      return tokenIndex >= 0 ? amountsIn[tokenIndex] : '0'; // Use actual amount for non-wrapper tokens
    });

  let userData: string;
  if (pool.poolType === 'Weighted') {
    userData = WeightedPoolEncoder.joinExactTokensInForBPTOut(
      userDataAmounts,
      '0'
    );
  } else {
    userData = StablePoolEncoder.joinExactTokensInForBPTOut(
      userDataAmounts,
      '0'
    );
  }

  // For assets and maxAmountsIn, include all tokens (including BPT)
  const joinPoolCall: EncodeJoinPoolInput = Relayer.formatJoinPoolInput({
    poolId: pool.id,
    kind: 0,
    sender: signerAddress,
    recipient: signerAddress,
    value: '0',
    outputReference: '0',
    joinPoolRequest: {} as JoinPoolRequest,
    assets: erc4626Pool.tokensList,
    maxAmountsIn: erc4626Pool.tokensList.map(token => {
      if (token === pool.address) return '0'; // BPT token
      const wrapperIndex = erc4626Pool.wrappers.indexOf(token);
      return wrapperIndex >= 0 ? chainedReferences[wrapperIndex] : '0';
    }),
    userData,
    fromInternalBalance: false,
  });

  const encodedJoinPoolCall = Relayer.encodeJoinPool(joinPoolCall);

  const encodedCalls = [...wrapperCalls, encodedJoinPoolCall];

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
