import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Scene,
} from 'three';

@Injectable({
  providedIn: 'root',
})
export class SceneState {
  private mainCamera = this.CamerasState.mainCamera;

  mainScene = new Scene();

  constructor(private CamerasState: CamerasState) {}

  addBaseScene() {
    const ambientLight = new AmbientLight(0x505050);
    const directionalLight = this.addDirLight();
    const plane = this.addBasePlane();

    this.mainCamera.lookAt(plane.position);
    this.mainScene.background = new Color(0x3333ff);

    this.addToScene(this.mainCamera);
    this.addToScene(plane);
    this.addToScene(directionalLight);
    this.addToScene(ambientLight);
  }

  addToScene(object: Object3D, lookAt: boolean = false) {
    this.mainScene.add(object);

    lookAt && this.mainCamera.lookAt(object.position);
  }

  private addBasePlane() {
    const planeMaterial = new MeshStandardMaterial({ color: '0x999999' });
    const planeGeometry = new PlaneGeometry(100, 100, 100, 100);
    const plane = new Mesh(planeGeometry, planeMaterial);

    plane.position.y = -0.5;
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    plane.userData = {
      isFloor: true,
      noIntersect: true,
    };

    return plane;
  }

  private addDirLight() {
    const directionalLight = new DirectionalLight(0xffffff, 0.5);

    directionalLight.position.set(4, 6, 3);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.intensity = 0.4;
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 1500;

    return directionalLight;
  }
}
