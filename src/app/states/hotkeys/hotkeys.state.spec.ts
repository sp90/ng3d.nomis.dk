import { TestBed } from '@angular/core/testing';
import { HotkeysState } from './hotkeys.state';

describe('HotkeysState', () => {
  let service: HotkeysState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HotkeysState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
