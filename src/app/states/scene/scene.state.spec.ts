import { TestBed } from '@angular/core/testing';
import { SceneState } from './scene.state';

describe('SceneState', () => {
  let service: SceneState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SceneState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
