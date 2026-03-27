import { Zone } from './zone.model';

export interface Slot {
  id_slot?: number;
  slot_number: string;
  is_covered: boolean;
  is_ev_charging: boolean;
  is_available: boolean;
  zone?: Zone;
  zoneId?: number;
}