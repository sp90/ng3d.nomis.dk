import { TestBed } from '@angular/core/testing';
import { PlayerMovementState } from './player-movement.state';

describe('PlayerMovementState', () => {
  let service: PlayerMovementState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerMovementState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
