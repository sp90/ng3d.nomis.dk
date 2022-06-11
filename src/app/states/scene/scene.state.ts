import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import {
  Color,
  DirectionalLight,
  HemisphereLight,
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
    const plane = this.addBasePlane();

    this.mainCamera.lookAt(plane.position);
    this.mainScene.background = new Color(0x3333ff);

    this.addToScene(this.mainCamera);
    this.addToScene(plane);
    this.addSunLight();
  }

  addToScene(object: Object3D, lookAt: boolean = false) {
    this.mainScene.add(object);

    lookAt && this.mainCamera.lookAt(object.position);
  }

  private addBasePlane() {
    const planeMaterial = new MeshStandardMaterial({ color: '0x999999' });
    const planeGeometry = new PlaneGeometry(100, 100, 100, 100);
    const plane = new Mesh(planeGeometry, planeMaterial);

    plane.position.y = 0;
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    plane.userData = {
      isFloor: true,
      noIntersect: true,
    };

    return plane;
  }

  private addSunLight() {
    var hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.8);
    hemiLight.color.setHSL(0.6, 0.75, 0.5);
    hemiLight.groundColor.setHSL(0.095, 0.5, 0.5);
    hemiLight.position.set(0, 500, 0);

    this.mainScene.add(hemiLight);

    const dirLight = new DirectionalLight(0xffffff, 1);

    dirLight.position.set(-1, 0.75, 1);
    dirLight.position.multiplyScalar(5);
    dirLight.intensity = 0.4;
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    let d = 25;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 15000;

    this.mainScene.add(dirLight);
  }
}
