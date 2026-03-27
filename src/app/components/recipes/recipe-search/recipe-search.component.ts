import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { SpoonacularService } from '../../../services/spoonacular.service';
import { Recipe } from '../../../models/recipe';

@Component({
  selector: 'app-recipe-search',
  templateUrl: './recipe-search.component.html',
  styleUrls: ['./recipe-search.component.css']
})
export class RecipeSearchComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  recipes: Recipe[] = [];
  loading = false;
  error = '';
  selectedRecipe: Recipe | null = null;
  hasSearched = false;  // Nouvelle variable pour savoir si une recherche a été effectuée
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private spoonacularService: SpoonacularService
  ) {
    this.searchForm = this.fb.group({
      ingredients: ['', Validators.required],
      number: [10, Validators.min(1)]
    });
  }

  ngOnInit(): void {
    // Recherche en temps réel avec debounce
    this.searchForm.get('ingredients')?.valueChanges
      .pipe(
        debounceTime(800), // Attendre 800ms après la dernière frappe
        distinctUntilChanged(), // Ignorer si la valeur n'a pas changé
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        if (value && value.trim().length > 2) { // Au moins 3 caractères
          this.performSearch();
        } else if (!value || value.trim().length === 0) {
          this.recipes = [];
          this.hasSearched = false;
          this.error = '';
        }
      });
    
    // Surveiller les changements du nombre de résultats
    this.searchForm.get('number')?.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const ingredients = this.searchForm.get('ingredients')?.value;
        if (ingredients && ingredients.trim().length > 2) {
          this.performSearch();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  performSearch(): void {
    const ingredients = this.searchForm.get('ingredients')?.value;
    const number = this.searchForm.get('number')?.value;
    
    if (!ingredients || ingredients.trim().length === 0) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.hasSearched = true;
    
    this.spoonacularService.searchByIngredients(ingredients, number).subscribe({
      next: (data) => {
        this.recipes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la recherche';
        this.recipes = [];
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    this.performSearch();
  }

  viewRecipeDetails(recipeId: number): void {
    this.loading = true;
    this.spoonacularService.getRecipeDetails(recipeId).subscribe({
      next: (recipe) => {
        this.selectedRecipe = recipe;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des détails';
        this.loading = false;
        console.error(err);
      }
    });
  }

  closeDetails(): void {
    this.selectedRecipe = null;
  }

  getCalorieColor(calories: number): string {
    if (calories < 300) return 'text-success';
    if (calories < 600) return 'text-warning';
    return 'text-danger';
  }
}