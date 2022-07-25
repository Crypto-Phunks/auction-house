import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  CryptoPhunksV2OwnershipTransferred as CryptoPhunksV2OwnershipTransferredEvent,
  Transfer as TransferEvent
} from "../generated/CryptoPhunksV2/CryptoPhunksV2"
import {
  Approval,
  ApprovalForAll,
  CryptoPhunksV2OwnershipTransferred,
  Transfer
} from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId
  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved
  entity.save()
}

export function handleCryptoPhunksV2OwnershipTransferred(
  event: CryptoPhunksV2OwnershipTransferredEvent
): void {
  let entity = new CryptoPhunksV2OwnershipTransferred(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner
  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId
  entity.save()
}
