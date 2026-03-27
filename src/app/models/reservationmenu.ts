import { Menu } from './menu';
import { User } from './user';

export interface ReservationMenu {
  id_reservation?: number;
  user: User;
  menu: Menu;
  date_reservation: string;
  a_emporter: boolean;
  heure_recuperation: string;
}

export interface ReservationMenuRequest {
  userId: number;
  menuId: number;
  date_reservation: string;
  a_emporter: boolean;
  heure_recuperation: string;
}

// NOUVEAU : Exporter l'interface AvailabilityResponse
export interface AvailabilityResponse {
  availablePlaces: number;
  reservedCount: number;
  maxPlaces: number;
}