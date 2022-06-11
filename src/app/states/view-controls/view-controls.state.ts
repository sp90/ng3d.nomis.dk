import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { IntersectionState } from '@states/intersection/intersection.state';
import { SelectedObjectState } from '@states/selected-object/selected-object.state';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Injectable({
  providedIn: 'root',
})
export class ViewControlsState {
  private canvas?: HTMLCanvasElement;

  mainControls?: OrbitControls;

  constructor(
    private CamerasState: CamerasState,
    private SelectedObjectState: SelectedObjectState,
    private IntersectionState: IntersectionState
  ) {}

  initControls(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.mainControls = new OrbitControls(this.CamerasState.mainCamera, canvas);

    this.mainControls.enableDamping = true;
    this.mainControls.minPolarAngle = Math.PI / 6;
    this.mainControls.maxPolarAngle = Math.PI / 2;

    return this.mainControls;
  }

  onDrag() {
    const object = this.SelectedObjectState.getSelectedObj();

    if (object && this.canvas && this.CamerasState.mainCamera) {
      const dragControls = new DragControls(
        [object],
        this.CamerasState.mainCamera,
        this.canvas
      );
      const _self = this;

      dragControls.addEventListener('dragstart', () => {
        _self.IntersectionState.setIntersectedState('drag', true);

        if (_self.mainControls) {
          _self.mainControls.enabled = false;
        }
      });

      dragControls.addEventListener('dragend', () => {
        _self.IntersectionState.setIntersectedState('drag', false);

        if (_self.mainControls) {
          _self.mainControls.enabled = true;
        }
      });
    }
  }

  updateControls() {
    if (this.mainControls) {
      this.mainControls.update();
    }
  }
}
