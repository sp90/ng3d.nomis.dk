import { TestBed } from '@angular/core/testing';
import { ActionControlsState } from './action-controls.state';

describe('ActionControlsState', () => {
  let service: ActionControlsState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionControlsState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
