import { Injectable } from '@angular/core';
import { Menu } from '../models/menu';

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

// ─── Types internes ───────────────────────────────────────────────────────────

interface AllergenKeywordEntry {
  term: string;
  weight: number; // 3 = certain, 2 = probable, 1 = possible
}

interface AllergenDefinition {
  id: string;
  name: string;
  emoji: string;
  color: string;
  exactKeywords: AllergenKeywordEntry[];
  partialKeywords: AllergenKeywordEntry[]; // détection par inclusion (racine)
}

@Injectable({
  providedIn: 'root'
})
export class AiAllergenService {

  // ─── Base de données allergènes ─────────────────────────────────────────────
  private allergens: AllergenDefinition[] = [
    {
      id: 'gluten',
      name: 'Gluten',
      emoji: '🌾',
      color: '#FF6B6B',
      exactKeywords: [
        // Céréales brutes
        { term: 'blé', weight: 3 }, { term: 'froment', weight: 3 },
        { term: 'orge', weight: 3 }, { term: 'seigle', weight: 3 },
        { term: 'avoine', weight: 3 }, { term: 'épeautre', weight: 3 },
        { term: 'kamut', weight: 3 }, { term: 'farro', weight: 3 },
        { term: 'triticale', weight: 3 },
        // Farines
        { term: 'farine', weight: 3 }, { term: 'farine de blé', weight: 3 },
        { term: 'fécule de blé', weight: 3 }, { term: 'amidon de blé', weight: 3 },
        { term: 'gluten', weight: 3 },
        // Pains & viennoiseries
        { term: 'pain', weight: 3 }, { term: 'baguette', weight: 3 },
        { term: 'brioche', weight: 3 }, { term: 'croissant', weight: 3 },
        { term: 'pain de mie', weight: 3 }, { term: 'pain complet', weight: 3 },
        { term: 'pain pita', weight: 3 }, { term: 'pain naan', weight: 3 },
        { term: 'pain chapati', weight: 3 }, { term: 'focaccia', weight: 3 },
        { term: 'ciabatta', weight: 3 }, { term: 'toast', weight: 2 },
        // Pâtes & féculents
        { term: 'pâtes', weight: 3 }, { term: 'spaghetti', weight: 3 },
        { term: 'macaroni', weight: 3 }, { term: 'tagliatelle', weight: 3 },
        { term: 'lasagne', weight: 3 }, { term: 'ravioli', weight: 3 },
        { term: 'gnocchi', weight: 3 }, { term: 'couscous', weight: 3 },
        { term: 'semoule', weight: 3 }, { term: 'boulgour', weight: 3 },
        { term: 'fettuccine', weight: 3 }, { term: 'linguine', weight: 3 },
        { term: 'orzo', weight: 3 }, { term: 'vermicelle', weight: 2 },
        // Plats
        { term: 'pizza', weight: 3 }, { term: 'quiche', weight: 3 },
        { term: 'tarte', weight: 2 }, { term: 'crêpe', weight: 3 },
        { term: 'galette', weight: 2 }, { term: 'gaufre', weight: 3 },
        { term: 'beignet', weight: 3 }, { term: 'panini', weight: 3 },
        { term: 'wrap', weight: 2 }, { term: 'sandwich', weight: 2 },
        { term: 'burger', weight: 2 }, { term: 'hot dog', weight: 2 },
        // Pâtisseries & desserts
        { term: 'cake', weight: 3 }, { term: 'gâteau', weight: 2 },
        { term: 'biscuit', weight: 3 }, { term: 'cookie', weight: 3 },
        { term: 'muffin', weight: 3 }, { term: 'brownie', weight: 3 },
        { term: 'madeleine', weight: 3 }, { term: 'financier', weight: 3 },
        { term: 'éclair', weight: 3 }, { term: 'choux', weight: 3 },
        { term: 'feuilleté', weight: 3 }, { term: 'millefeuille', weight: 3 },
        { term: 'pain perdu', weight: 3 }, { term: 'crumble', weight: 3 },
        // Panure & enrobage
        { term: 'chapelure', weight: 3 }, { term: 'panure', weight: 3 },
        { term: 'croûton', weight: 3 }, { term: 'pané', weight: 3 },
        { term: 'panée', weight: 3 }, { term: 'enrobé', weight: 2 },
        // Tunisien & Maghrébin
        { term: 'makrouna', weight: 3 }, { term: 'makrout', weight: 3 },
        { term: 'khobz', weight: 3 }, { term: 'mlawi', weight: 3 },
        { term: 'mlewi', weight: 3 }, { term: 'tabouna', weight: 3 },
        { term: 'ftayer', weight: 3 }, { term: 'mhajeb', weight: 3 },
        { term: 'mhadjeb', weight: 3 }, { term: 'brik', weight: 3 },
        { term: 'malsouqa', weight: 3 }, { term: 'warka', weight: 3 },
        { term: 'dioul', weight: 3 }, { term: 'kesra', weight: 3 },
        { term: 'harcha', weight: 3 }, { term: 'rghaif', weight: 3 },
        { term: 'kaâk', weight: 2 }, { term: 'samsa', weight: 3 },
        { term: 'baklawa', weight: 2 }, { term: 'baklava', weight: 2 },
        { term: 'cornes de gazelle', weight: 3 }, { term: 'ghraïba', weight: 3 },
        // Sauces & divers
        { term: 'sauce soja', weight: 2 }, { term: 'soja', weight: 1 },
        { term: 'levure chimique', weight: 1 }, { term: 'malt', weight: 3 },
        { term: 'bière', weight: 3 },
      ],
      partialKeywords: [
        { term: 'farin', weight: 3 },    // farine, farineux
        { term: 'semouli', weight: 3 },  // semouline
        { term: 'gnocch', weight: 3 },
        { term: 'tartin', weight: 2 },   // tartine, tartiné
        { term: 'feuilletée', weight: 3 },
        { term: 'brioch', weight: 3 },
        { term: 'panett', weight: 3 },   // panettone
        { term: 'biscot', weight: 3 },   // biscotte
      ]
    },

    {
      id: 'lactose',
      name: 'Lactose',
      emoji: '🥛',
      color: '#FFD93D',
      exactKeywords: [
        // Laits
        { term: 'lait', weight: 3 }, { term: 'lait entier', weight: 3 },
        { term: 'lait demi-écrémé', weight: 3 }, { term: 'lait écrémé', weight: 3 },
        { term: 'lait concentré', weight: 3 }, { term: 'lait en poudre', weight: 3 },
        { term: 'lactose', weight: 3 }, { term: 'lactosérum', weight: 3 },
        { term: 'caséine', weight: 3 }, { term: 'babeurre', weight: 3 },
        // Crèmes
        { term: 'crème', weight: 3 }, { term: 'crème fraîche', weight: 3 },
        { term: 'crème liquide', weight: 3 }, { term: 'crème épaisse', weight: 3 },
        { term: 'crème fouettée', weight: 3 }, { term: 'crème chantilly', weight: 3 },
        { term: 'chantilly', weight: 3 }, { term: 'crème pâtissière', weight: 3 },
        { term: 'crème anglaise', weight: 3 }, { term: 'béchamel', weight: 3 },
        // Beurres
        { term: 'beurre', weight: 3 }, { term: 'beurre fondu', weight: 3 },
        { term: 'beurre clarifié', weight: 3 }, { term: 'ghee', weight: 3 },
        // Fromages
        { term: 'fromage', weight: 3 }, { term: 'emmental', weight: 3 },
        { term: 'gruyère', weight: 3 }, { term: 'parmesan', weight: 3 },
        { term: 'mozzarella', weight: 3 }, { term: 'ricotta', weight: 3 },
        { term: 'mascarpone', weight: 3 }, { term: 'cheddar', weight: 3 },
        { term: 'brie', weight: 3 }, { term: 'camembert', weight: 3 },
        { term: 'roquefort', weight: 3 }, { term: 'comté', weight: 3 },
        { term: 'gouda', weight: 3 }, { term: 'edam', weight: 3 },
        { term: 'feta', weight: 3 }, { term: 'halloumi', weight: 3 },
        { term: 'fromage blanc', weight: 3 }, { term: 'cottage cheese', weight: 3 },
        // Yaourts & fermentés
        { term: 'yaourt', weight: 3 }, { term: 'yogourt', weight: 3 },
        { term: 'kéfir', weight: 3 }, { term: 'laban', weight: 3 },
        // Tunisien & Maghrébin
        { term: 'jben', weight: 3 }, { term: 'j\'ben', weight: 3 },
        { term: 'lben', weight: 3 }, { term: 'rayeb', weight: 3 },
        { term: 'smen', weight: 3 }, { term: 'ben slimane', weight: 2 },
        { term: 'dèhen', weight: 3 }, { term: 'zebda', weight: 3 },
        // Desserts lactés
        { term: 'glace', weight: 2 }, { term: 'crème glacée', weight: 3 },
        { term: 'gelato', weight: 3 }, { term: 'sorbet au lait', weight: 3 },
        { term: 'milkshake', weight: 3 }, { term: 'pudding', weight: 2 },
        { term: 'flan', weight: 2 }, { term: 'riz au lait', weight: 3 },
        { term: 'semoule au lait', weight: 3 }, { term: 'mousse au chocolat', weight: 2 },
        { term: 'panna cotta', weight: 3 }, { term: 'tiramisu', weight: 3 },
        { term: 'crème brûlée', weight: 3 }, { term: 'île flottante', weight: 3 },
        { term: 'asida', weight: 2 }, { term: 'assida', weight: 2 },
        { term: 'zrir', weight: 2 }, { term: 'msemmen', weight: 2 },
        // Divers
        { term: 'chocolat au lait', weight: 3 }, { term: 'lait de coco', weight: 1 },
      ],
      partialKeywords: [
        { term: 'laitier', weight: 3 },   // produit laitier
        { term: 'laitière', weight: 3 },
        { term: 'fromagé', weight: 3 },
        { term: 'fromagère', weight: 3 },
        { term: 'beurré', weight: 3 },
        { term: 'beurrée', weight: 3 },
        { term: 'lacté', weight: 3 },
        { term: 'lactée', weight: 3 },
        { term: 'crémeux', weight: 3 },
        { term: 'crémeuse', weight: 3 },
        { term: 'yaourté', weight: 3 },
      ]
    },

    {
      id: 'oeufs',
      name: 'Œufs',
      emoji: '🥚',
      color: '#F4A261',
      exactKeywords: [
        { term: 'œuf', weight: 3 }, { term: 'oeuf', weight: 3 },
        { term: 'oeufs', weight: 3 }, { term: 'œufs', weight: 3 },
        { term: 'jaune d\'œuf', weight: 3 }, { term: 'blanc d\'œuf', weight: 3 },
        { term: 'omelette', weight: 3 }, { term: 'mayonnaise', weight: 3 },
        { term: 'mayo', weight: 2 }, { term: 'aïoli', weight: 3 },
        { term: 'meringue', weight: 3 }, { term: 'soufflé', weight: 3 },
        { term: 'quiche', weight: 3 }, { term: 'crêpe', weight: 2 },
        { term: 'brioche', weight: 2 }, { term: 'madeleine', weight: 3 },
        { term: 'macaron', weight: 3 }, { term: 'éclair', weight: 2 },
        { term: 'pâte à choux', weight: 3 }, { term: 'profiterole', weight: 3 },
        { term: 'clafoutis', weight: 3 }, { term: 'financier', weight: 3 },
        { term: 'far breton', weight: 3 }, { term: 'flan', weight: 2 },
        { term: 'crème anglaise', weight: 3 }, { term: 'crème pâtissière', weight: 3 },
        { term: 'île flottante', weight: 3 }, { term: 'tiramisu', weight: 3 },
        { term: 'œuf poché', weight: 3 }, { term: 'œuf cocotte', weight: 3 },
        { term: 'œuf mollet', weight: 3 }, { term: 'œuf dur', weight: 3 },
        // Tunisien
        { term: 'brik', weight: 3 }, { term: 'ojja', weight: 3 },
        { term: 'chakchouka', weight: 3 }, { term: 'shakshuka', weight: 3 },
        { term: 'mhajeb', weight: 2 }, { term: 'mhadjeb', weight: 2 },
        { term: 'pâtisserie', weight: 1 }, { term: 'tajine tunisien', weight: 3 },
        { term: 'tajine', weight: 2 }, { term: 'kaâk', weight: 2 },
        { term: 'makroud', weight: 2 }, { term: 'samsa', weight: 2 },
        // Autres
        { term: 'hollandaise', weight: 3 }, { term: 'béarnaise', weight: 3 },
        { term: 'lemon curd', weight: 3 }, { term: 'pasta all\'uovo', weight: 3 },
      ],
      partialKeywords: [
        { term: 'omelette', weight: 3 },
        { term: 'mayonnais', weight: 3 },
      ]
    },

    {
      id: 'arachides',
      name: 'Arachides',
      emoji: '🥜',
      color: '#A55D35',
      exactKeywords: [
        { term: 'arachide', weight: 3 }, { term: 'arachides', weight: 3 },
        { term: 'cacahuète', weight: 3 }, { term: 'cacahuètes', weight: 3 },
        { term: 'cacahouète', weight: 3 }, { term: 'peanut', weight: 3 },
        { term: 'beurre de cacahuète', weight: 3 }, { term: 'beurre d\'arachide', weight: 3 },
        { term: 'peanut butter', weight: 3 }, { term: 'sauce satay', weight: 3 },
        { term: 'satay', weight: 3 }, { term: 'nems', weight: 2 },
        { term: 'rouleaux de printemps', weight: 2 }, { term: 'pad thaï', weight: 2 },
        { term: 'huile d\'arachide', weight: 3 }, { term: 'huile de cacahuète', weight: 3 },
        // Tunisien
        { term: 'ftistik', weight: 3 }, { term: 'gandouz', weight: 3 },
      ],
      partialKeywords: [
        { term: 'arachid', weight: 3 },
        { term: 'cacahuèt', weight: 3 },
      ]
    },

    {
      id: 'fruits_coque',
      name: 'Fruits à coque',
      emoji: '🌰',
      color: '#8B4513',
      exactKeywords: [
        { term: 'amande', weight: 3 }, { term: 'amandes', weight: 3 },
        { term: 'noix', weight: 3 }, { term: 'noix de grenoble', weight: 3 },
        { term: 'noix de cajou', weight: 3 }, { term: 'cajou', weight: 3 },
        { term: 'noix de macadamia', weight: 3 }, { term: 'macadamia', weight: 3 },
        { term: 'noisette', weight: 3 }, { term: 'noisettes', weight: 3 },
        { term: 'pistache', weight: 3 }, { term: 'pistaches', weight: 3 },
        { term: 'pignon', weight: 3 }, { term: 'pignons de pin', weight: 3 },
        { term: 'châtaigne', weight: 3 }, { term: 'marron', weight: 3 },
        { term: 'noix de pécan', weight: 3 }, { term: 'pécan', weight: 3 },
        { term: 'noix du brésil', weight: 3 },
        { term: 'praliné', weight: 3 }, { term: 'gianduja', weight: 3 },
        { term: 'frangipane', weight: 3 }, { term: 'pâte d\'amande', weight: 3 },
        { term: 'massepain', weight: 3 }, { term: 'marzipan', weight: 3 },
        { term: 'nutella', weight: 2 }, { term: 'pâte à tartiner', weight: 2 },
        // Tunisien & Maghrébin
        { term: 'makroud', weight: 2 }, { term: 'makroudh', weight: 2 },
        { term: 'bambalouni', weight: 1 }, { term: 'chebakia', weight: 2 },
        { term: 'zlabia', weight: 1 }, { term: 'biskri', weight: 3 },
        { term: 'samia', weight: 2 }, { term: 'baklawa', weight: 3 },
        { term: 'baklava', weight: 3 }, { term: 'cornes de gazelle', weight: 3 },
        { term: 'ghraïba aux amandes', weight: 3 }, { term: 'kaâk bil louz', weight: 3 },
        { term: 'ka3k', weight: 1 }, { term: 'louz', weight: 3 },
        { term: 'tchicha', weight: 1 }, { term: 'asida', weight: 1 },
      ],
      partialKeywords: [
        { term: 'amand', weight: 3 },    // amandier, amandine
        { term: 'noisett', weight: 3 },
        { term: 'pistach', weight: 3 },
        { term: 'pralin', weight: 3 },
        { term: 'noix', weight: 3 },
      ]
    },

    {
      id: 'poisson',
      name: 'Poissons',
      emoji: '🐟',
      color: '#4A90E2',
      exactKeywords: [
        { term: 'poisson', weight: 3 }, { term: 'saumon', weight: 3 },
        { term: 'thon', weight: 3 }, { term: 'cabillaud', weight: 3 },
        { term: 'morue', weight: 3 }, { term: 'merlu', weight: 3 },
        { term: 'sardine', weight: 3 }, { term: 'anchois', weight: 3 },
        { term: 'truite', weight: 3 }, { term: 'maquereau', weight: 3 },
        { term: 'daurade', weight: 3 }, { term: 'dorade', weight: 3 },
        { term: 'bar', weight: 2 }, { term: 'loup de mer', weight: 3 },
        { term: 'mérou', weight: 3 }, { term: 'merrou', weight: 3 },
        { term: 'rouget', weight: 3 }, { term: 'sole', weight: 3 },
        { term: 'turbot', weight: 3 }, { term: 'colin', weight: 3 },
        { term: 'lieu noir', weight: 3 }, { term: 'pangasius', weight: 3 },
        { term: 'tilapia', weight: 3 }, { term: 'perche', weight: 2 },
        { term: 'carpe', weight: 3 }, { term: 'brochet', weight: 3 },
        { term: 'anguille', weight: 3 }, { term: 'espadon', weight: 3 },
        { term: 'thon rouge', weight: 3 }, { term: 'hareng', weight: 3 },
        // Préparations
        { term: 'brik au thon', weight: 3 }, { term: 'couscous au poisson', weight: 3 },
        { term: 'charmoula', weight: 2 }, { term: 'chermoula', weight: 2 },
        { term: 'souiri', weight: 3 }, { term: 'charmola', weight: 2 },
        { term: 'poisson grillé', weight: 3 }, { term: 'friture', weight: 2 },
        // Produits transformés
        { term: 'surimi', weight: 3 }, { term: 'fish and chips', weight: 3 },
        { term: 'fish cake', weight: 3 }, { term: 'bouillon de poisson', weight: 3 },
        { term: 'fumet de poisson', weight: 3 }, { term: 'sauce poisson', weight: 3 },
        { term: 'nuoc mam', weight: 3 }, { term: 'colatura', weight: 3 },
        { term: 'tarama', weight: 3 },
      ],
      partialKeywords: [
        { term: 'poisson', weight: 3 },
        { term: 'saumon', weight: 3 },
        { term: 'anchois', weight: 3 },
      ]
    },

    {
      id: 'crustaces',
      name: 'Crustacés',
      emoji: '🦐',
      color: '#E67E22',
      exactKeywords: [
        { term: 'crevette', weight: 3 }, { term: 'crevettes', weight: 3 },
        { term: 'gambas', weight: 3 }, { term: 'langoustine', weight: 3 },
        { term: 'langoustines', weight: 3 }, { term: 'crabe', weight: 3 },
        { term: 'homard', weight: 3 }, { term: 'langouste', weight: 3 },
        { term: 'écrevisse', weight: 3 }, { term: 'écrevisses', weight: 3 },
        { term: 'krill', weight: 3 }, { term: 'araignée de mer', weight: 3 },
        { term: 'tourteau', weight: 3 },
        // Préparations
        { term: 'bisque', weight: 3 }, { term: 'bisque de homard', weight: 3 },
        { term: 'bouillabaisse', weight: 2 }, { term: 'paella', weight: 2 },
        // Tunisien
        { term: 'couscous aux fruits de mer', weight: 3 },
        { term: 'fricassée', weight: 1 },
      ],
      partialKeywords: [
        { term: 'crevett', weight: 3 },
        { term: 'langousti', weight: 3 },
      ]
    },

    {
      id: 'mollusques',
      name: 'Mollusques',
      emoji: '🐚',
      color: '#1ABC9C',
      exactKeywords: [
        { term: 'moule', weight: 3 }, { term: 'moules', weight: 3 },
        { term: 'huître', weight: 3 }, { term: 'huîtres', weight: 3 },
        { term: 'calamar', weight: 3 }, { term: 'calamars', weight: 3 },
        { term: 'seiche', weight: 3 }, { term: 'poulpe', weight: 3 },
        { term: 'octopode', weight: 3 }, { term: 'escargot', weight: 3 },
        { term: 'coquillage', weight: 3 }, { term: 'clam', weight: 3 },
        { term: 'palourde', weight: 3 }, { term: 'praire', weight: 3 },
        { term: 'coque', weight: 2 }, { term: 'saint-jacques', weight: 3 },
        { term: 'noix de saint-jacques', weight: 3 }, { term: 'pétoncle', weight: 3 },
        // Tunisien
        { term: 'slata mechouia', weight: 1 },
        { term: 'couscous aux fruits de mer', weight: 3 },
      ],
      partialKeywords: [
        { term: 'calamar', weight: 3 },
        { term: 'poulpe', weight: 3 },
      ]
    },

    {
      id: 'soja',
      name: 'Soja',
      emoji: '🫘',
      color: '#2ECC71',
      exactKeywords: [
        { term: 'soja', weight: 3 }, { term: 'soya', weight: 3 },
        { term: 'tofu', weight: 3 }, { term: 'sauce soja', weight: 3 },
        { term: 'tamari', weight: 3 }, { term: 'edamame', weight: 3 },
        { term: 'miso', weight: 3 }, { term: 'tempeh', weight: 3 },
        { term: 'lait de soja', weight: 3 }, { term: 'crème de soja', weight: 3 },
        { term: 'fromage de soja', weight: 3 }, { term: 'yaourt soja', weight: 3 },
        { term: 'natto', weight: 3 }, { term: 'okara', weight: 3 },
        { term: 'farine de soja', weight: 3 }, { term: 'huile de soja', weight: 2 },
        { term: 'protéines de soja', weight: 3 }, { term: 'tvp', weight: 3 },
        { term: 'lécithine de soja', weight: 3 },
      ],
      partialKeywords: [
        { term: 'soja', weight: 3 },
        { term: 'tofu', weight: 3 },
      ]
    },

    {
      id: 'sesame',
      name: 'Sésame',
      emoji: '🌿',
      color: '#E67E22',
      exactKeywords: [
        { term: 'sésame', weight: 3 }, { term: 'sesame', weight: 3 },
        { term: 'graine de sésame', weight: 3 }, { term: 'graines de sésame', weight: 3 },
        { term: 'tahini', weight: 3 }, { term: 'tahin', weight: 3 },
        { term: 'halva', weight: 3 }, { term: 'halvah', weight: 3 },
        { term: 'gomasio', weight: 3 }, { term: 'huile de sésame', weight: 3 },
        { term: 'pain au sésame', weight: 3 }, { term: 'bun au sésame', weight: 3 },
        // Tunisien
        { term: 'chebakia', weight: 2 }, { term: 'kaâk', weight: 1 },
        { term: 'bambalouni', weight: 1 }, { term: 'simsim', weight: 3 },
        { term: 'samsa', weight: 2 }, { term: 'rghaif', weight: 1 },
        { term: 'zrir', weight: 2 }, { term: 'salade mechouia', weight: 1 },
      ],
      partialKeywords: [
        { term: 'sésam', weight: 3 },
        { term: 'tahini', weight: 3 },
        { term: 'simsim', weight: 3 },
      ]
    },

    {
      id: 'legumineuses',
      name: 'Légumineuses',
      emoji: '🫘',
      color: '#3498DB',
      exactKeywords: [
        { term: 'haricot', weight: 3 }, { term: 'haricots', weight: 3 },
        { term: 'haricots verts', weight: 3 }, { term: 'haricots blancs', weight: 3 },
        { term: 'haricots rouges', weight: 3 }, { term: 'haricots noirs', weight: 3 },
        { term: 'lentille', weight: 3 }, { term: 'lentilles', weight: 3 },
        { term: 'lentilles vertes', weight: 3 }, { term: 'lentilles rouges', weight: 3 },
        { term: 'pois chiche', weight: 3 }, { term: 'pois chiches', weight: 3 },
        { term: 'fève', weight: 3 }, { term: 'fèves', weight: 3 },
        { term: 'pois cassé', weight: 3 }, { term: 'pois cassés', weight: 3 },
        { term: 'soja', weight: 2 }, { term: 'lupin', weight: 3 },
        { term: 'flageolet', weight: 3 }, { term: 'mungo', weight: 3 },
        // Tunisien
        { term: 'loubya', weight: 3 }, { term: 'loubia', weight: 3 },
        { term: 'chorba', weight: 2 }, { term: 'chorba frik', weight: 3 },
        { term: 'lablabi', weight: 3 }, { term: 'hlalim', weight: 3 },
        { term: 'kaouame', weight: 3 }, { term: 'foul', weight: 3 },
        { term: 'bissara', weight: 3 }, { term: 'hummus', weight: 3 },
        { term: 'houmous', weight: 3 }, { term: 'falafel', weight: 3 },
        { term: 'couscous', weight: 1 }, { term: 'kafteji', weight: 2 },
      ],
      partialKeywords: [
        { term: 'lentill', weight: 3 },
        { term: 'haricot', weight: 3 },
        { term: 'légumineu', weight: 3 },
        { term: 'chiches', weight: 3 },
      ]
    }
  ];

  // ─── API publique ────────────────────────────────────────────────────────────

  getAllergens(): any[] {
    return this.allergens;
  }

  analyzeMenuForAllergens(menu: Menu): MenuAllergenAnalysis {
    const detectedAllergens: DetectedAllergen[] = [];

    const sections: { label: string; text: string }[] = [
      { label: 'Entrée',          text: (menu.entree          || '').toLowerCase() },
      { label: 'Plat principal',  text: (menu.plat_principal  || '').toLowerCase() },
      { label: 'Dessert',         text: (menu.dessert         || '').toLowerCase() },
    ];

    for (const allergen of this.allergens) {
      let totalScore = 0;
      const locationParts: string[] = [];

      for (const section of sections) {
        const { hits, score } = this.detectInText(section.text, allergen);
        if (hits.length > 0) {
          totalScore += score;
          locationParts.push(`${section.label} (${hits.join(', ')})`);
        }
      }

      if (totalScore > 0) {
        detectedAllergens.push({
          allergenId:   allergen.id,
          allergenName: allergen.name,
          emoji:        allergen.emoji,
          detectedIn:   locationParts.join(' | '),
          severity:     this.computeSeverity(totalScore),
        });
      }
    }

    // Trier : high → medium → low
    detectedAllergens.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    });

    const warningMessage = detectedAllergens.length > 0
      ? `⚠️ Contient : ${detectedAllergens.map(a => `${a.emoji} ${a.allergenName}`).join(', ')}`
      : '✅ Aucun allergène détecté';

    return {
      menuId:            menu.id_menu!,
      menuTitle:         menu.plat_principal,
      detectedAllergens,
      hasAllergens:      detectedAllergens.length > 0,
      warningMessage,
    };
  }

  analyzeAllMenus(menus: Menu[]): Map<number, MenuAllergenAnalysis> {
    const analyses = new Map<number, MenuAllergenAnalysis>();
    menus.forEach(menu => {
      if (menu.id_menu) {
        analyses.set(menu.id_menu, this.analyzeMenuForAllergens(menu));
      }
    });
    return analyses;
  }

  // ─── Détection interne ───────────────────────────────────────────────────────

  /**
   * Cherche les mots-clés d'un allergène dans un texte.
   * Retourne la liste des termes trouvés et le score cumulé.
   */
  private detectInText(
    text: string,
    allergen: AllergenDefinition
  ): { hits: string[]; score: number } {
    const hits: string[] = [];
    let score = 0;
    const seen = new Set<string>();

    // 1. Correspondance exacte (word-boundary aware)
    for (const entry of allergen.exactKeywords) {
      const normalized = this.normalize(entry.term);
      if (seen.has(normalized)) continue;

      if (this.matchExact(text, normalized)) {
        hits.push(entry.term);
        score += entry.weight;
        seen.add(normalized);
      }
    }

    // 2. Correspondance partielle (inclusion de racine)
    for (const entry of allergen.partialKeywords) {
      const normalized = this.normalize(entry.term);
      if (seen.has(normalized)) continue;

      if (text.includes(normalized)) {
        // Vérifier qu'on n'a pas déjà capturé ce terme via exactKeywords
        const alreadyCovered = hits.some(h =>
          this.normalize(h).includes(normalized)
        );
        if (!alreadyCovered) {
          hits.push(`~${entry.term}`);   // préfixe ~ pour indiquer détection partielle
          score += entry.weight * 0.8;  // légère réduction pour les partiels
          seen.add(normalized);
        }
      }
    }

    return { hits, score };
  }

  /**
   * Vérifie si un terme apparaît dans le texte en tant que mot complet
   * ou sous-chaîne significative (pas de faux positifs sur des sous-mots).
   */
  private matchExact(text: string, term: string): boolean {
    // Pour les termes courts (≤ 3 chars) on exige une vraie délimitation
    if (term.length <= 3) {
      const pattern = new RegExp(`(^|[\\s,;.()\\/\\-])${this.escapeRegex(term)}($|[\\s,;.()\\/\\-])`, 'i');
      return pattern.test(text);
    }
    return text.includes(term);
  }

  /**
   * Convertit le score numérique en niveau de sévérité.
   *
   * Score  ≥ 9  → high   (plusieurs ingrédients certains, ou plat clairement identifié)
   * Score  ≥ 4  → medium (au moins un ingrédient certain + contexte)
   * Score   > 0 → low    (trace ou mention indirecte)
   */
  private computeSeverity(score: number): 'high' | 'medium' | 'low' {
    if (score >= 9) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  /** Normalise un texte : minuscules + suppression des accents */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /** Échappe les caractères spéciaux pour une RegExp */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}