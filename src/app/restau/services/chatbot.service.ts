import { Injectable } from '@angular/core';
import { Menu } from '../models/menu';
import { ReservationMenuService } from './reservationmenu.service';
import { AiAllergenService } from './ai-allergen.service';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  
  private readonly FIXED_USER_ID = 1;

  constructor(
    private reservationService: ReservationMenuService,
    private allergenService: AiAllergenService
  ) {}

  private normalizeText(text: string): string {
    const accents: { [key: string]: string } = {
      'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
      'à': 'a', 'â': 'a', 'ä': 'a',
      'î': 'i', 'ï': 'i',
      'ô': 'o', 'ö': 'o',
      'ù': 'u', 'û': 'u', 'ü': 'u',
      'ç': 'c', 'œ': 'oe', 'æ': 'ae'
    };
    let result = text.toLowerCase();
    for (const [accent, normal] of Object.entries(accents)) {
      result = result.replace(new RegExp(accent, 'g'), normal);
    }
    return result.replace(/[^a-z0-9\s]/g, '');
  }

  extractSearchTermFromSentence(text: string): string | null {
    const normalizedText = this.normalizeText(text);
    
    const stopWords = [
      'je', 'veux', 'cherche', 'il', 'y', 'a', 'du', 'de', 'la', 'le', 'des', 
      'un', 'une', 'dans', 'pour', 'avec', 'sans', 'est', 'que', 'qui', 'quoi', 
      'comment', 'pourquoi', 'menus', 'menu', 'contenant', 'contient', 'as-tu',
      'as', 't', 'est-ce', 'qu', 'moi', 'toi', 'lui', 'eux', 'cette', 'ce', 'ces'
    ];
    
    let words = normalizedText.split(/[\s,;:.?!]+/);
    words = words.filter(w => w.length > 2 && !stopWords.includes(w));
    
    if (words.length > 0) {
      return words[0];
    }
    return null;
  }

  searchMenusByTerm(menus: Menu[], searchTerm: string): Menu[] {
    const normalizedTerm = this.normalizeText(searchTerm);
    
    if (!normalizedTerm || normalizedTerm.length < 2) {
      return [];
    }
    
    const foundMenus: Menu[] = [];
    const menuScores: Map<number, number> = new Map();
    
    for (const menu of menus) {
      let score = 0;
      
      const platPrincipal = this.normalizeText(menu.plat_principal);
      const entree = this.normalizeText(menu.entree);
      const dessert = this.normalizeText(menu.dessert);
      const jour = this.normalizeText(menu.jour);
      
      if (platPrincipal.includes(normalizedTerm)) score += 10;
      else if (entree.includes(normalizedTerm)) score += 7;
      else if (dessert.includes(normalizedTerm)) score += 7;
      else if (jour.includes(normalizedTerm)) score += 3;
      else if (`${platPrincipal} ${entree} ${dessert}`.includes(normalizedTerm)) score += 2;
      
      if (score > 0) {
        menuScores.set(menu.id_menu!, score);
        foundMenus.push(menu);
      }
    }
    
    foundMenus.sort((a, b) => (menuScores.get(b.id_menu!) || 0) - (menuScores.get(a.id_menu!) || 0));
    return foundMenus;
  }

  async hasUserAlreadyReserved(menuId: number, date: string): Promise<boolean> {
    try {
      const reservations = await this.reservationService.getReservationMenusByUser(this.FIXED_USER_ID).toPromise();
      if (!reservations) return false;
      return reservations.some(r => r.menu.id_menu === menuId && r.date_reservation === date);
    } catch (error) {
      return false;
    }
  }

  async checkAvailability(menuId: number, date: string): Promise<{ available: boolean; remaining: number; max: number; alreadyReserved: boolean }> {
    try {
      const [response, alreadyReserved] = await Promise.all([
        this.reservationService.checkAvailability(menuId, date).toPromise(),
        this.hasUserAlreadyReserved(menuId, date)
      ]);
      
      if (response) {
        return {
          available: response.availablePlaces > 0 && !alreadyReserved,
          remaining: response.availablePlaces,
          max: response.maxPlaces,
          alreadyReserved: alreadyReserved
        };
      }
      return { available: false, remaining: 0, max: 0, alreadyReserved: false };
    } catch (error) {
      return { available: false, remaining: 0, max: 0, alreadyReserved: false };
    }
  }

  async createReservation(menuId: number, date: string, time: string): Promise<any> {
    const heureRecuperation = time.includes(':') ? time + ':00' : time + ':00:00';
    const request = {
      userId: this.FIXED_USER_ID,
      menuId: menuId,
      date_reservation: date,
      a_emporter: true,
      heure_recuperation: heureRecuperation
    };
    return this.reservationService.createReservationMenu(request).toPromise();
  }

  formatMenuDetails(menu: Menu, date: string, availability: { available: boolean; remaining: number; max: number; alreadyReserved: boolean }): string {
    const analysis = this.allergenService.analyzeMenuForAllergens(menu);
    const allergenText = analysis.hasAllergens 
      ? `\n⚠️ Allergènes : ${analysis.detectedAllergens.map(a => `${a.emoji} ${a.allergenName}`).join(', ')}`
      : '\n✅ Aucun allergène détecté';
    
    let statusText = '';
    if (availability.alreadyReserved) {
      statusText = '\n✅ **Vous avez déjà réservé ce menu pour cette date !**';
    } else if (!availability.available) {
      statusText = '\n❌ **Complet - Plus de places disponibles**';
    } else {
      statusText = `\n✅ **${availability.remaining} places disponibles sur ${availability.max}**`;
    }
    
    return `🍽️ **${menu.plat_principal}**
📅 Jour : ${menu.jour}
📆 Date : ${date}
🥗 Entrée : ${menu.entree}
🍰 Dessert : ${menu.dessert}${allergenText}${statusText}`;
  }

  getRealMenuDate(menu: Menu): string {
    const weekStr = menu.semaine;
    const dateRangeMatch = weekStr.match(/du (\d{2})\/(\d{2})\/(\d{4})/i);
    if (dateRangeMatch) {
      const day = dateRangeMatch[1];
      const month = dateRangeMatch[2];
      const year = dateRangeMatch[3];
      return `${year}-${month}-${day}`;
    }
    const dashMatch = weekStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (dashMatch) {
      const day = dashMatch[1];
      const month = dashMatch[2];
      const year = dashMatch[3];
      return `${year}-${month}-${day}`;
    }
    return this.getDateForDay(menu.jour);
  }

  getDateForDay(dayName: string, referenceDate: Date = new Date()): string {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const targetDay = days.indexOf(dayName.toLowerCase());
    if (targetDay === -1) return '';
    const currentDay = referenceDate.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    const targetDate = new Date(referenceDate);
    targetDate.setDate(referenceDate.getDate() + daysToAdd);
    return targetDate.toISOString().split('T')[0];
  }

  formatDateFrench(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  getAvailableDatesForMenu(menu: Menu): string[] {
    const dates: string[] = [];
    const weekStr = menu.semaine;
    
    const dateRangeMatch = weekStr.match(/du (\d{2})\/(\d{2})\/(\d{4}) au (\d{2})\/(\d{2})\/(\d{4})/i);
    if (dateRangeMatch) {
      const startDay = parseInt(dateRangeMatch[1]);
      const startMonth = parseInt(dateRangeMatch[2]);
      const startYear = parseInt(dateRangeMatch[3]);
      const endDay = parseInt(dateRangeMatch[4]);
      const endMonth = parseInt(dateRangeMatch[5]);
      const endYear = parseInt(dateRangeMatch[6]);
      
      const startDate = new Date(startYear, startMonth - 1, startDay);
      const endDate = new Date(endYear, endMonth - 1, endDay);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
      }
    }
    
    if (dates.length === 0) {
      const menuDate = this.getRealMenuDate(menu);
      dates.push(menuDate);
    }
    
    return dates;
  }
}