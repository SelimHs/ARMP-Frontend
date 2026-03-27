import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../../../services/menu.service';

@Component({
  selector: 'app-menu-form',
  templateUrl: './menu-form.component.html',
  styleUrls: ['./menu-form.component.css']
})
export class MenuFormComponent implements OnInit {
  menuForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  isEditMode = false;
  menuId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.menuForm = this.fb.group({
      semaine: ['', Validators.required],
      jour: ['', Validators.required],
      entree: ['', Validators.required],
      plat_principal: ['', Validators.required],
      dessert: ['', Validators.required],
      nombre_disponible: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.menuId = +params['id'];
        this.loadMenu();
      }
    });
  }

  loadMenu(): void {
    if (this.menuId) {
      this.loading = true;
      this.menuService.getMenuById(this.menuId).subscribe({
        next: (menu) => {
          this.menuForm.patchValue(menu);
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors du chargement du menu';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.menuForm.valid) {
      this.loading = true;
      
      const menuData = this.menuForm.value;
      
      if (this.isEditMode && this.menuId) {
        this.menuService.updateMenu(this.menuId, menuData).subscribe({
          next: () => {
            this.successMessage = 'Menu modifié avec succès !';
            this.loading = false;
            setTimeout(() => {
              this.router.navigate(['/menus']);
            }, 2000);
          },
          error: (err) => {
            this.errorMessage = 'Erreur lors de la modification du menu';
            this.loading = false;
            console.error(err);
          }
        });
      } else {
        this.menuService.createMenu(menuData).subscribe({
          next: () => {
            this.successMessage = 'Menu créé avec succès !';
            this.loading = false;
            setTimeout(() => {
              this.router.navigate(['/menus']);
            }, 2000);
          },
          error: (err) => {
            this.errorMessage = 'Erreur lors de la création du menu';
            this.loading = false;
            console.error(err);
          }
        });
      }
    }
  }
}