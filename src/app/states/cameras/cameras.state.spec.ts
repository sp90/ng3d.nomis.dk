import { TestBed } from '@angular/core/testing';
import { CamerasState } from './cameras.state';

describe('CamerasState', () => {
  let service: CamerasState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CamerasState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
