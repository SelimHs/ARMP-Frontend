import { TestBed } from '@angular/core/testing';

import { AiAllergenService } from './ai-allergen.service';

describe('AiAllergenService', () => {
  let service: AiAllergenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiAllergenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
