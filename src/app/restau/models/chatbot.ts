import { Menu } from './menu';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'menu-card' | 'reservation-card';
  menu?: Menu;
}

export interface ChatSession {
  step: 'idle' | 'selecting_menu' | 'selecting_date' | 'selecting_alternative_date' | 'selecting_time' | 'confirming' | 'selecting_reservation_to_cancel' | 'confirming_cancellation';
  selectedMenu: Menu | null;
  selectedDate: string | null;
  selectedTime: string | null;
}