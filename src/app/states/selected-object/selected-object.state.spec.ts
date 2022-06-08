import { TestBed } from '@angular/core/testing';
import { SelectedObjectState } from './selected-object.state';

describe('SelectedObjectState', () => {
  let service: SelectedObjectState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedObjectState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
