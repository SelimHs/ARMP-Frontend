import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { ReservationMenuService } from '../../services/reservationmenu.service';
import { AiAllergenService, DetectedAllergen } from '../../services/ai-allergen.service';
import { Menu } from '../../models/menu';

@Component({
  selector: 'app-menu-user-list',
  templateUrl: './menu-user-list.component.html',
  styleUrls: ['./menu-user-list.component.css']
})
export class MenuUserListComponent implements OnInit {
  menus: Menu[] = [];
  loading = false;
  error = '';
  selectedDate: string = new Date().toISOString().split('T')[0];
  availabilities: Map<number, { available: boolean; remaining: number; total: number; alreadyReserved: boolean }> = new Map();
  allergenAnalyses: Map<number, any> = new Map();
  analyzing = false;
  showChatbot = true;

  constructor(
    private menuService: MenuService,
    private reservationService: ReservationMenuService,
    private aiAllergenService: AiAllergenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMenus();
  }

  loadMenus(): void {
    this.loading = true;
    this.menuService.getAllMenus().subscribe({
      next: (data) => {
        this.menus = data;
        this.loading = false;
        this.checkAllAvailabilities();
        this.analyzeAllMenus();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des menus';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getRealMenuDate(menu: Menu): string {
    const weekStr = menu.semaine;
    const dateMatch = weekStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (dateMatch) {
      const day = dateMatch[1];
      const month = dateMatch[2];
      const year = dateMatch[3];
      return `${year}-${month}-${day}`;
    }
    return this.selectedDate;
  }

  checkAllAvailabilities(): void {
    this.menus.forEach(menu => {
      const realDate = this.getRealMenuDate(menu);
      this.checkAvailability(menu, realDate);
    });
  }

  checkAvailability(menu: Menu, date: string): void {
    if (!menu.id_menu) return;
    
    this.reservationService.checkAvailability(menu.id_menu, date).subscribe({
      next: (response) => {
        const alreadyReserved = response.reservedCount > 0;
        const available = response.availablePlaces > 0;
        
        this.availabilities.set(menu.id_menu!, {
          available: available,
          remaining: response.availablePlaces,
          total: response.maxPlaces,
          alreadyReserved: alreadyReserved
        });
      },
      error: (err) => {
        console.error('Erreur vérification disponibilité', err);
        if (menu.id_menu) {
          this.availabilities.set(menu.id_menu, {
            available: false,
            remaining: 0,
            total: menu.nombre_disponible,
            alreadyReserved: false
          });
        }
      }
    });
  }

  analyzeAllMenus(): void {
    this.analyzing = true;
    this.allergenAnalyses = this.aiAllergenService.analyzeAllMenus(this.menus);
    this.analyzing = false;
  }

  refreshData(): void {
    this.loadMenus();
  }

  onBookingCompleted(): void {
    setTimeout(() => {
      this.refreshData();
    }, 500);
  }

  reserveMenu(menuId: number): void {
    const menu = this.menus.find(m => m.id_menu === menuId);
    if (!menu) return;
    
    const realDate = this.getRealMenuDate(menu);
    
    const analysis = this.allergenAnalyses.get(menuId);
    if (analysis && analysis.hasAllergens) {
      const allergenList = analysis.detectedAllergens
        .map((a: DetectedAllergen) => `${a.emoji} ${a.allergenName} (dans ${a.detectedIn})`)
        .join('\n');
      
      const confirmReservation = confirm(
        `⚠️ ALERTE ALLERGÈNES ⚠️\n\n` +
        `Ce menu contient :\n${allergenList}\n\n` +
        `Voulez-vous quand même réserver ce menu ?`
      );
      
      if (!confirmReservation) return;
    }
    
    const availability = this.availabilities.get(menuId);
    
    if (!availability?.available) {
      alert('Désolé, plus de places disponibles pour ce menu !');
      return;
    }
    
    if (availability.alreadyReserved) {
      alert('Vous avez déjà réservé ce menu !');
      return;
    }
    
    this.router.navigate(['/reservationmenus/new'], { 
      queryParams: { menuId: menuId, date: realDate }
    });
  }

  formatWeekRange(weekStr: string): string {
    if (weekStr.includes('du') && weekStr.includes('au')) {
      return weekStr;
    }
    
    const weekMatch = weekStr.match(/^(\d{4})-W(\d{1,2})$/);
    if (weekMatch) {
      const year = parseInt(weekMatch[1]);
      const week = parseInt(weekMatch[2]);
      const dateRange = this.getDateRangeFromWeek(year, week);
      return `du ${dateRange.start} au ${dateRange.end}`;
    }
    
    if (weekStr.includes('-')) {
      const parts = weekStr.split('-');
      if (parts.length === 2) {
        return `du ${parts[0].trim()} au ${parts[1].trim()}`;
      }
    }
    
    return weekStr;
  }

  private getDateRangeFromWeek(year: number, week: number): { start: string, end: string } {
    const firstDayOfYear = new Date(year, 0, 1);
    const dayOfWeek = firstDayOfYear.getDay();
    const daysToFirstThursday = (4 - dayOfWeek + 7) % 7;
    const firstThursday = new Date(year, 0, 1 + daysToFirstThursday);
    const monday = new Date(firstThursday);
    monday.setDate(firstThursday.getDate() + (week - 1) * 7 - 3);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    return {
      start: formatDate(monday),
      end: formatDate(sunday)
    };
  }
}