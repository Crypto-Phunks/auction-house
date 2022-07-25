import { log } from '@graphprotocol/graph-ts';
import { Transfer } from '../generated/CryptoPhunksV2/CryptoPhunksV2';

import { getOrCreateAccount } from '../src/utils/helpers';
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from './utils/constants';

import { Phunk } from '../generated/schema';

let transferredPhunkId: string; // Use WebAssembly global due to lack of closure support
export function handleTransfer(event: Transfer): void {

  let fromHolder = getOrCreateAccount(event.params.from.toHexString());
  let toHolder = getOrCreateAccount(event.params.to.toHexString());
  transferredPhunkId = event.params.tokenId.toString();

  let fromHolderPreviousBalance = fromHolder.tokenBalanceRaw;
  fromHolder.tokenBalanceRaw = fromHolder.tokenBalanceRaw - BIGINT_ONE;
  fromHolder.tokenBalance = fromHolder.tokenBalanceRaw;
  let fromHolderPhunks = fromHolder.phunks; // Re-assignment required to update array
  fromHolder.phunks = fromHolderPhunks.filter(n => n != transferredPhunkId);

  if (fromHolder.tokenBalanceRaw < BIGINT_ZERO) {
    log.error('Negative balance on holder {} with balance {}', [
      fromHolder.id,
      fromHolder.tokenBalanceRaw.toString(),
    ]);
  }

  fromHolder.save();

  let toHolderPreviousBalance = toHolder.tokenBalanceRaw;
  toHolder.tokenBalanceRaw = toHolder.tokenBalanceRaw + BIGINT_ONE;
  toHolder.tokenBalance = toHolder.tokenBalanceRaw;
  toHolder.totalTokensHeldRaw = toHolder.totalTokensHeldRaw + BIGINT_ONE;
  toHolder.totalTokensHeld = toHolder.totalTokensHeldRaw;

  let toHolderPhunks = toHolder.phunks; // Re-assignment required to update array
  toHolderPhunks.push(event.params.tokenId.toString());
  toHolder.phunks = toHolderPhunks;

  let phunk = Phunk.load(transferredPhunkId);
  if (phunk == null) phunk = new Phunk(transferredPhunkId);

  phunk.owner = toHolder.id;

  phunk.save();
  toHolder.save();
}