import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Composants
import { MenuListComponent } from './components/menu/menu-list/menu-list.component';
import { MenuFormComponent } from './components/menu/menu-form/menu-form.component';
import { ReservationmenuListComponent } from './components/reservationmenu/reservationmenu-list/reservationmenu-list.component';
import { ReservationmenuFormComponent } from './components/reservationmenu/reservationmenu-form/reservationmenu-form.component';
import { UserListComponent } from './components/user/user-list/user-list.component';
import { UserFormComponent } from './components/user/user-form/user-form.component';
import { MenuUserListComponent } from './components/menu-user/menu-user-list/menu-user-list.component';
import { RecipeSearchComponent } from './components/recipes/recipe-search/recipe-search.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { Nl2brPipe } from './pipes/nl2br.pipe'; 


@NgModule({
  declarations: [
    AppComponent,
    MenuListComponent,
    MenuFormComponent,
    ReservationmenuListComponent,
    ReservationmenuFormComponent,
    UserListComponent,
    UserFormComponent,
    MenuUserListComponent,
    RecipeSearchComponent,
    ChatbotComponent,
    Nl2brPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }