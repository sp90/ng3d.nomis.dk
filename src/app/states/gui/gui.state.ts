import { Injectable } from '@angular/core';
import GUI from 'lil-gui';

@Injectable({
  providedIn: 'root',
})
export class GuiState {
  gui = new GUI({ width: 400 });

  constructor() {}

  addFolder(
    name: string,
    obj: object,
    properties: string[],
    min = 0,
    max = 5,
    step = 0.1
  ) {
    const folder = this.gui.addFolder(name);

    folder.close();

    properties.forEach((prop) => folder.add(obj, prop, min, max, step));
  }
}
