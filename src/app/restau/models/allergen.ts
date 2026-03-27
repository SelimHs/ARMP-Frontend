export interface Allergen {
  id: string;
  name: string;
  emoji: string;
  keywords: string[];
  color: string;
}

export interface DetectedAllergen {
  allergenId: string;
  allergenName: string;
  emoji: string;
  detectedIn: string;
  severity: 'high' | 'medium' | 'low';
}

export interface MenuAllergenAnalysis {
  menuId: number;
  menuTitle: string;
  detectedAllergens: DetectedAllergen[];
  hasAllergens: boolean;
  warningMessage: string;
}