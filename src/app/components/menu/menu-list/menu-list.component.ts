import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../../services/menu.service';
import { Menu } from '../../../models/menu';

@Component({
  selector: 'app-menu-list',
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css']
})
export class MenuListComponent implements OnInit {
  menus: Menu[] = [];
  loading = false;
  error = '';

  constructor(
    private menuService: MenuService,
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
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des menus';
        this.loading = false;
        console.error(err);
      }
    });
  }

  editMenu(id: number): void {
    this.router.navigate([`/admin/menus/edit/${id}`]);
  }

  deleteMenu(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) {
      this.menuService.deleteMenu(id).subscribe({
        next: () => {
          this.loadMenus();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression du menu';
          console.error(err);
        }
      });
    }
  }

  // Nouvelle méthode pour convertir le format de semaine
  formatWeekRange(weekStr: string): string {
    // Si le format est déjà "du ... au ...", le retourner tel quel
    if (weekStr.includes('du') && weekStr.includes('au')) {
      return weekStr;
    }
    
    // Si le format est "2026-W13" (semaine ISO)
    const weekMatch = weekStr.match(/^(\d{4})-W(\d{1,2})$/);
    if (weekMatch) {
      const year = parseInt(weekMatch[1]);
      const week = parseInt(weekMatch[2]);
      const dateRange = this.getDateRangeFromWeek(year, week);
      return `du ${dateRange.start} au ${dateRange.end}`;
    }
    
    // Si le format est "01/03/2026 - 05/03/2026" (déjà formaté)
    if (weekStr.includes('-')) {
      const parts = weekStr.split('-');
      if (parts.length === 2) {
        return `du ${parts[0].trim()} au ${parts[1].trim()}`;
      }
    }
    
    // Sinon, retourner la valeur originale
    return weekStr;
  }

  // Calculer les dates de début et fin d'une semaine ISO
  private getDateRangeFromWeek(year: number, week: number): { start: string, end: string } {
    // Calculer le premier jour de l'année
    const firstDayOfYear = new Date(year, 0, 1);
    
    // Trouver le premier jeudi de l'année (pour la semaine ISO)
    const dayOfWeek = firstDayOfYear.getDay();
    const daysToFirstThursday = (4 - dayOfWeek + 7) % 7;
    const firstThursday = new Date(year, 0, 1 + daysToFirstThursday);
    
    // Calculer le lundi de la semaine donnée
    const monday = new Date(firstThursday);
    monday.setDate(firstThursday.getDate() + (week - 1) * 7 - 3);
    
    // Calculer le dimanche
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    // Formater les dates
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