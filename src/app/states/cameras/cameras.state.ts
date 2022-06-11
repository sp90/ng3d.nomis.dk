import { Injectable } from '@angular/core';
import { PerspectiveCamera } from 'three';

export interface ISceneInitOptions {
  fov: number;
  width: number;
  height: number;
  near: number;
  far: number;
}

export const DEFAULT_CAMERA_OPTIONS: ISceneInitOptions = {
  fov: 75,
  width: window.innerWidth,
  height: window.innerHeight,
  near: 0.1,
  far: 2000,
};

@Injectable({
  providedIn: 'root',
})
export class CamerasState {
  mainCamera = this.getDefaultCamera();

  constructor() {
    this.mainCamera.position.z = 8;
    this.mainCamera.position.y = 8;
    this.mainCamera.position.x = 8;
  }

  getDefaultCamera(): PerspectiveCamera {
    const camera = new PerspectiveCamera(
      DEFAULT_CAMERA_OPTIONS.fov,
      DEFAULT_CAMERA_OPTIONS.width / DEFAULT_CAMERA_OPTIONS.height,
      DEFAULT_CAMERA_OPTIONS.near,
      DEFAULT_CAMERA_OPTIONS.far
    );
    return camera;
  }
}
