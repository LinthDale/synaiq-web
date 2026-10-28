// One reviewed incident, not a general exemption for vendor-managed blocks.
// Compared with decrypted hostinger-backup-38330034089-1 evidence on 2026-10-28.
// Only LSCACHE changed: broader .litespeed_conf protection and REST AUTH/POSTPASS
// no-cache rules. Preserve the host bytes; normal activation commits the new state.
// All four identities must still match. Later releases cannot reuse this receipt.
export const reviewedRoutingRepair = Object.freeze({
  id: '20261028-litespeed-routing',
  active: 'synaiq-release-ci-38330034089-1',
  stateSha256: '38fdb0f8b35b15dfc56780815b6ddb1b1fc618d07280f8e3ee369083c473c532',
  previousRoutingSha256: '80ac7d057e272fc80cf9e63132f30e4aa43bb41a76f91e79354be8563e8eca72',
  observedRoutingSha256: '81c9ba2bf763941eb9c38af82f13aea15572ef2c06eecaf4de37892aa86503a8',
});
