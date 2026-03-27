import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationMenuService } from '../../../services/reservationmenu.service';
import { MenuService } from '../../../services/menu.service';
import { Menu } from '../../../models/menu';

@Component({
  selector: 'app-reservationmenu-form',
  templateUrl: './reservationmenu-form.component.html',
  styleUrls: ['./reservationmenu-form.component.css']
})
export class ReservationmenuFormComponent implements OnInit {
  reservationMenuForm: FormGroup;
  menus: Menu[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  private readonly FIXED_USER_ID = 1;
  selectedMenuId: number | null = null;
  selectedDate: string = '';

  constructor(
    private fb: FormBuilder,
    private reservationMenuService: ReservationMenuService,
    private menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.reservationMenuForm = this.fb.group({
      userId: [this.FIXED_USER_ID, Validators.required],
      menuId: [null, Validators.required],
      date_reservation: ['', Validators.required],
      a_emporter: [false],
      heure_recuperation: ['12:00', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMenus();
    
    // Récupérer les paramètres de l'URL (depuis la vue utilisateur)
    this.route.queryParams.subscribe(params => {
      if (params['menuId']) {
        this.selectedMenuId = +params['menuId'];
        this.reservationMenuForm.patchValue({ menuId: this.selectedMenuId });
      }
      if (params['date']) {
        this.selectedDate = params['date'];
        this.reservationMenuForm.patchValue({ date_reservation: this.selectedDate });
      }
    });
  }

  loadMenus(): void {
    this.menuService.getAllMenus().subscribe({
      next: (data) => {
        this.menus = data;
      },
      error: (err) => console.error('Erreur chargement menus', err)
    });
  }

  onSubmit(): void {
    if (this.reservationMenuForm.invalid) {
      this.errorMessage = 'Veuillez sélectionner un menu et une date';
      return;
    }
    
    this.loading = true;
    
    const formValue = this.reservationMenuForm.value;
    
    let heure = formValue.heure_recuperation;
    if (heure && heure.length === 5 && heure.includes(':')) {
      heure = heure + ':00';
    }
    
    const dataToSend = {
      userId: Number(formValue.userId),
      menuId: Number(formValue.menuId),
      date_reservation: formValue.date_reservation,
      a_emporter: formValue.a_emporter,
      heure_recuperation: heure
    };
    
    this.reservationMenuService.createReservationMenu(dataToSend).subscribe({
      next: (response) => {
        this.successMessage = 'Réservation créée avec succès !';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/reservationmenus']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = 'Erreur: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }
}