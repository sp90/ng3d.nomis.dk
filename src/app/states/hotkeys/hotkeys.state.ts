import { Injectable } from '@angular/core';

// import { HOTKEYS_DRAG } from './hotkeys-drag.const';

@Injectable({
  providedIn: 'root',
})
export class HotkeysState {
  constructor() {}

  keyAction(event: KeyboardEvent) {}
}
