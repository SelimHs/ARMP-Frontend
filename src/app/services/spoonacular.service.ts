import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from '../models/recipe';

@Injectable({
  providedIn: 'root'
})
export class SpoonacularService {
  private apiUrl = 'http://localhost:8082/api/recipes';

  constructor(private http: HttpClient) {}

  // Rechercher par ingrédients
  searchByIngredients(ingredients: string, number: number = 10): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/search-by-ingredients?ingredients=${ingredients}&number=${number}`);
  }

  // Rechercher par nom
  searchRecipes(query: string, number: number = 10): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/search?query=${query}&number=${number}`);
  }

  // Obtenir les détails d'une recette
  getRecipeDetails(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }
}