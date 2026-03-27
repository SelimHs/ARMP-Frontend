import { Slot } from './slot.model';

export interface ParkingReservation {
  id_reservation?: number;
  userId: number;
  slotId: number;
  start_time: string;
  end_time: string;
  status?: string;
  slot?: Slot;
}