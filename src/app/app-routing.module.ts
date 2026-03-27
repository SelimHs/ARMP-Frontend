import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuListComponent } from './restau/menu/menu-list/menu-list.component';
import { MenuFormComponent } from './restau/menu/menu-form/menu-form.component';
import { MenuUserListComponent } from './restau/menu-user/menu-user-list/menu-user-list.component';
import { ReservationmenuListComponent } from './restau/reservationmenu/reservationmenu-list/reservationmenu-list.component';
import { ReservationmenuFormComponent } from './restau/reservationmenu/reservationmenu-form/reservationmenu-form.component';
import { UserListComponent } from './restau/user/user-list/user-list.component';
import { UserFormComponent } from './restau/user/user-form/user-form.component';
import { RecipeSearchComponent } from './restau/recipes/recipe-search/recipe-search.component';

const routes: Routes = [
  { path: '', redirectTo: '/user/menus', pathMatch: 'full' },
  
  // Routes Admin
  { path: 'admin/menus', component: MenuListComponent },
  { path: 'admin/menus/new', component: MenuFormComponent },
  { path: 'admin/menus/edit/:id', component: MenuFormComponent },
  { path: 'admin/reservations', component: ReservationmenuListComponent },
  { path: 'admin/users', component: UserListComponent },
  { path: 'admin/users/new', component: UserFormComponent },
  
  // Routes User
  { path: 'user/menus', component: MenuUserListComponent },
  { path: 'reservationmenus/new', component: ReservationmenuFormComponent },
  { path: 'reservationmenus', component: ReservationmenuListComponent },
  { path: 'recipes/search', component: RecipeSearchComponent },
  
  // Redirection
  { path: 'menus', redirectTo: '/admin/menus', pathMatch: 'full' },
  { path: 'users', redirectTo: '/admin/users', pathMatch: 'full' },
  { path: 'parking', loadChildren: () => import('./parking/parking.module').then(m => m.ParkingModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }