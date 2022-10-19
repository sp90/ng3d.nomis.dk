import { Injectable } from '@angular/core';
import { Body, BODY_TYPES, Box, Vec3 } from 'cannon-es';
import {
  Box3,
  BoxGeometry,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
} from 'three';

export interface IStaticObjects {
  object: Object3D;
  bbox: Box3;
}

@Injectable({
  providedIn: 'root',
})
export class SceneState {
  mainScene = new Scene();

  constructor() {}

  addBaseScene() {
    this.mainScene.background = new Color(0x3333ff);

    // this.addBasePlane();
    this.addSunLight();
  }

  addToScene(object: Object3D) {
    this.mainScene.add(object);
  }

  addPlayerToScene(object: Group) {
    this.mainScene.add(object);
  }

  private addCollisionTestBox() {
    const material = new MeshStandardMaterial({ color: new Color(0xff0000) });
    const mesh = new Mesh(new BoxGeometry(3, 1, 3), material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.x = 6;
    mesh.position.y = 0.5;
    mesh.position.z = -6;
    mesh.userData = {
      isStatic: true,
    };

    const meshBody = new Body({
      shape: new Box(new Vec3(3, 1, 3)),
      type: BODY_TYPES.STATIC,
    });
    meshBody.position.set(0, 10, 0);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // this.mainWorld.addBody(meshBody);
    this.addToScene(mesh);
  }

  // private addBasePlane() {
  //   const planeMaterial = new MeshStandardMaterial({ color: '0x999999' });
  //   const planeGeometry = new PlaneGeometry(100, 100, 100, 100);
  //   const plane = new Mesh(planeGeometry, planeMaterial);

  //   plane.position.y = 0;
  //   plane.rotation.x = -Math.PI / 2;
  //   plane.receiveShadow = true;
  //   plane.userData = {
  //     isFloor: true,
  //   };

  //   this.addToScene(plane);

  //   return plane;
  // }

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
