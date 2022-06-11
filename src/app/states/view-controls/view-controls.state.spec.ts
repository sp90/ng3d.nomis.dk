import { TestBed } from '@angular/core/testing';
import { ViewControlsState } from './view-controls.state';

describe('ViewControlsState', () => {
  let service: ViewControlsState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewControlsState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
