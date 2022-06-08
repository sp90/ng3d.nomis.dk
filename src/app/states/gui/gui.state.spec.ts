import { TestBed } from '@angular/core/testing';
import { GuiState } from './gui.state';

describe('GuiState', () => {
  let service: GuiState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuiState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
