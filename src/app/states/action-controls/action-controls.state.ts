import { EventEmitter, Injectable } from '@angular/core';
import { ISceneInitOptions } from '@states/canvas/canvas.state';
import { Camera, Object3D, PerspectiveCamera } from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const SCENE_INIT_DEFAULT_OPTIONS: ISceneInitOptions = {
  fov: 75,
  width: window.innerWidth,
  height: window.innerHeight,
  near: 0.1,
  far: 2000,
};

@Injectable({
  providedIn: 'root',
})
export class ActionControlsState {
  private camera?: Camera;
  private canvas?: HTMLCanvasElement;
  private orbitControls?: OrbitControls;

  onDragStart$ = new EventEmitter<undefined>();
  onDragEnd$ = new EventEmitter<undefined>();

  isDragging = false;

  constructor() {}

  initControls(camera: Camera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.canvas = canvas;

    return this.addOrbitControls();
  }

  onDrag(object: Object3D) {
    if (this.canvas && this.camera) {
      const objectTopDownCamera = new PerspectiveCamera(
        SCENE_INIT_DEFAULT_OPTIONS.fov,
        SCENE_INIT_DEFAULT_OPTIONS.width / SCENE_INIT_DEFAULT_OPTIONS.height,
        SCENE_INIT_DEFAULT_OPTIONS.near,
        SCENE_INIT_DEFAULT_OPTIONS.far
      );

      objectTopDownCamera.position.y = 5;
      objectTopDownCamera.lookAt(object.position);

      const camera = this.camera || objectTopDownCamera;

      const dragControls = new DragControls([object], camera, this.canvas);
      const _self = this;

      dragControls.addEventListener('dragstart', () => {
        this.onDragStart$.emit();

        if (_self.orbitControls) {
          _self.orbitControls.enabled = false;
        }
      });

      dragControls.addEventListener('dragend', () => {
        this.onDragEnd$.emit();

        if (_self.orbitControls) {
          _self.orbitControls.enabled = true;
        }
      });
    }
  }

  private addOrbitControls() {
    if (this.camera && this.canvas) {
      this.orbitControls = new OrbitControls(this.camera, this.canvas);

      this.orbitControls.enableDamping = true;
      this.orbitControls.minPolarAngle = Math.PI / 6;
      this.orbitControls.maxPolarAngle = Math.PI / 2;

      return this.orbitControls;
    }

    return undefined;
  }
}

// this.IntersectionState.initDrag(this.camera, canvas);
