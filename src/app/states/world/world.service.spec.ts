import { TestBed } from '@angular/core/testing';

import { WorldState } from './world.state';

describe('WorldState', () => {
  let service: WorldState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorldState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
