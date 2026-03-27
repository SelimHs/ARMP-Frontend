import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReservationMenuService } from '../../services/reservationmenu.service';
import { ReservationMenu } from '../../models/reservationmenu';

@Component({
  selector: 'app-reservationmenu-list',
  templateUrl: './reservationmenu-list.component.html',
  styleUrls: ['./reservationmenu-list.component.css']
})
export class ReservationmenuListComponent implements OnInit {
  reservationMenus: ReservationMenu[] = [];
  loading = false;
  error = '';

  constructor(
    private reservationMenuService: ReservationMenuService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservationMenus();
  }

  loadReservationMenus(): void {
    this.loading = true;
    this.reservationMenuService.getAllReservationMenus().subscribe({
      next: (data) => {
        this.reservationMenus = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des réservations';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteReservation(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      this.reservationMenuService.deleteReservationMenu(id).subscribe({
        next: (response) => {
          console.log('Réponse:', response); // Affichera "Réservation supprimée avec succès"
          this.loadReservationMenus(); // Recharger la liste
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression de la réservation';
          console.error(err);
        }
      });
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }
}