import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Object3D } from 'three';

@Injectable({
  providedIn: 'root',
})
export class SelectedObjectState {
  private selectedObjSource = new BehaviorSubject<Object3D | null>(null);

  selectedObj$ = this.selectedObjSource.asObservable();

  constructor() {}

  getSelectedObj() {
    return this.selectedObjSource.getValue();
  }

  setSelectedObj(obj: Object3D) {
    this.selectedObjSource.next(obj);
  }

  removeSelectedObj() {
    this.selectedObjSource.next(null);
  }
}
