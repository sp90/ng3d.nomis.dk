import { TestBed } from '@angular/core/testing';
import { IntersectionState } from './intersection.state';

describe('IntersectionState', () => {
  let service: IntersectionState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntersectionState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
