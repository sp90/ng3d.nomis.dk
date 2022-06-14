import { Injectable } from '@angular/core';
import { PerspectiveCamera, Vector3 } from 'three';

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
  cameraDistance = {
    y: 7,
    x: 5,
    z: 5,
  };

  constructor() {
    this.mainCamera.position.z = 8;
    this.mainCamera.position.y = 8;
    this.mainCamera.position.x = 8;
  }

  setPosRelativeToPlayer(playerPos: Vector3) {
    const x = playerPos.x + this.cameraDistance.x;
    const y = playerPos.y + this.cameraDistance.y;
    const z = playerPos.z + this.cameraDistance.z;
    this.mainCamera.position.set(x, y, z);
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
