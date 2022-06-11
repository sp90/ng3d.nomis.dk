import { Injectable } from '@angular/core';
import { SelectedObjectState } from '@states/selected-object/selected-object.state';
import { PerspectiveCamera, Raycaster, Scene, Vector2 } from 'three';

export type TStatesIncoming = 'focus' | 'hover' | 'drag';

@Injectable({
  providedIn: 'root',
})
export class IntersectionState {
  private raycaster = new Raycaster();

  INTERSECTED?: any;

  constructor(private SelectedObjectState: SelectedObjectState) {}

  isIntersecting() {
    return (
      this.SelectedObjectState.getSelectedObj()?.id === this.INTERSECTED?.id
    );
  }

  raycasterCheckIntersects(
    pointer: Vector2,
    camera: PerspectiveCamera,
    scene: Scene
  ) {
    this.raycaster.setFromCamera(pointer, camera);

    const intersects = this.raycaster.intersectObjects(scene.children, false);

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
