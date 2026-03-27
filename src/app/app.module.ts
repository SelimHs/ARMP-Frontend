import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  // ← AJOUTER CETTE LIGNE

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Composants depuis restau/
import { MenuListComponent } from './restau/menu/menu-list/menu-list.component';  // ← AJOUTER CETTE LIGNE
import { MenuUserListComponent } from './restau/menu-user/menu-user-list/menu-user-list.component';
import { MenuFormComponent } from './restau/menu/menu-form/menu-form.component';
import { ReservationmenuListComponent } from './restau/reservationmenu/reservationmenu-list/reservationmenu-list.component';
import { ReservationmenuFormComponent } from './restau/reservationmenu/reservationmenu-form/reservationmenu-form.component';
import { UserListComponent } from './restau/user/user-list/user-list.component';
import { UserFormComponent } from './restau/user/user-form/user-form.component';
import { ChatbotComponent } from './restau/chatbot/chatbot.component';
import { RecipeSearchComponent } from './restau/recipes/recipe-search/recipe-search.component';

// Pipes depuis restau/pipes/
import { Nl2brPipe } from './restau/pipes/nl2br.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MenuListComponent,              // ← AJOUTER CETTE LIGNE
    MenuUserListComponent,
    MenuFormComponent,
    ReservationmenuListComponent,
    ReservationmenuFormComponent,
    UserListComponent,
    UserFormComponent,
    ChatbotComponent,
    RecipeSearchComponent,
    Nl2brPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule  // ← AJOUTER CETTE LIGNE
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }