import { Injectable } from '@angular/core';
import { ActionControlsState } from '@states/action-controls/action-controls.state';
import { SelectedObjectState } from '@states/selected-object/selected-object.state';
import { tap } from 'rxjs';
import { PerspectiveCamera, Raycaster, Scene, Vector2 } from 'three';

export type TStatesIncoming = 'focus' | 'hover' | 'drag';

@Injectable({
  providedIn: 'root',
})
export class IntersectionState {
  private INTERSECTED?: any;

  onDragStart$ = this.ActionControlsState.onDragStart$
    .pipe(tap(() => this.setIntersectedState('drag', true)))
    .subscribe();

  onDragEnd$ = this.ActionControlsState.onDragEnd$
    .pipe(tap(() => this.setIntersectedState('drag', false)))
    .subscribe();

  constructor(
    private SelectedObjectState: SelectedObjectState,
    private ActionControlsState: ActionControlsState
  ) {}

  onIntersectedClick() {
    if (this.INTERSECTED) {
      const activeSelectedObj = this.SelectedObjectState.getSelectedObj();

      if (activeSelectedObj?.id === this.INTERSECTED?.id) {
        this.ActionControlsState.onDrag(this.INTERSECTED);
      } else {
        this.setIntersectedState('focus', false, activeSelectedObj);
        this.SelectedObjectState.setSelectedObj(this.INTERSECTED);
        this.setIntersectedState('focus', true);
      }
    }
  }

  raycasterCheckIntersects(
    raycaster: Raycaster,
    pointer: Vector2,
    camera: PerspectiveCamera,
    scene: Scene
  ) {
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(scene.children, false);

    if (
      intersects.length > 0 &&
      !intersects[0].object.userData['noIntersect']
    ) {
      const firstIntersect = intersects[0].object;

      if (this.INTERSECTED?.uuid !== firstIntersect.uuid) {
        this.INTERSECTED = firstIntersect;
        this.INTERSECTED.originalHex =
          this.INTERSECTED.originalHex ||
          this.INTERSECTED.material.color.getHex();
        this.setIntersectedState('hover', true);
      }
    } else {
      this.setIntersectedState('hover', false);
      this.INTERSECTED = null;
    }
  }

  setIntersectedState(
    stateName: TStatesIncoming,
    stateSetting: boolean,
    intersectedCheckItem?: any
  ) {
    const INTERSECTED = intersectedCheckItem || this.INTERSECTED;
    if (INTERSECTED) {
      if (!INTERSECTED.state) {
        INTERSECTED.state = {
          hover: false,
          drag: false,
          focus: false,
        };

        this.setColorBasedOnState(INTERSECTED);
      }

      INTERSECTED.state[stateName] = stateSetting;

      this.setColorBasedOnState(INTERSECTED);
    }
  }

  private setColorBasedOnState(INTERSECTED: any) {
    const state = INTERSECTED.state;

    if (state.drag) {
      INTERSECTED.material.color.setHex('0xFFFF00');
      document.body.style.cursor = 'grabbing';
    } else if (state.hover && state.focus) {
      INTERSECTED.material.color.setHex('0x33f666');
      document.body.style.cursor = 'grab';
    } else if (state.focus) {
      INTERSECTED.material.color.setHex('0x00ffff');
      document.body.style.cursor = 'context-menu';
    } else if (state.hover) {
      INTERSECTED.material.color.setHex('0x0000ff');
      document.body.style.cursor = 'pointer';
    } else {
      INTERSECTED.material.color.setHex(INTERSECTED.originalHex);
      document.body.style.cursor = 'default';
    }
  }
}
