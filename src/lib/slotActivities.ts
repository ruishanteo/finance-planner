import { salaryQualifies, spendQualifies } from './bankMeta';
import type { ActivityKey, BankProduct, BankSlot, UserProfile } from '../types';

export function slotToActivities(
  slot: BankSlot,
  bank: BankProduct,
  profile: UserProfile,
): Partial<Record<ActivityKey, boolean>> {
  const activities: Partial<Record<ActivityKey, boolean>> = {};

  if (slot.salary && salaryQualifies(bank, profile.monthlySalary)) {
    activities.salary = true;
  }
  if (slot.spendAmount > 0 && spendQualifies(bank, slot.spendAmount)) {
    activities.spend = true;
  }
  if (slot.save) activities.save = true;
  if (slot.invest) activities.invest = true;
  if (slot.insure) activities.insure = true;

  return activities;
}

export function emptySlot(bankId: string): BankSlot {
  return {
    bankId,
    balance: 0,
    salary: false,
    spendAmount: 0,
    save: false,
    invest: false,
    insure: false,
  };
}

export function slotHasAssignment(slot: BankSlot): boolean {
  return (
    slot.balance > 0 ||
    slot.salary ||
    slot.spendAmount > 0 ||
    slot.save ||
    slot.invest ||
    slot.insure
  );
}
