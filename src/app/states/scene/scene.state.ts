import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { Body, Plane, Vec3, World } from 'cannon-es';
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
  PlaneGeometry,
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
  private mainCamera = this.CamerasState.mainCamera;

  mainScene = new Scene();
  mainWorld = new World({
    gravity: new Vec3(0, -10, 0), // m/s²
  });

  sceneObjectsToUpdate: any[] = [];
  sceneObjectsCheckCollision: any[] = [];
  sceneUpdates: Function[] = [];

  constructor(private CamerasState: CamerasState) {
    this.mainWorld.quatNormalizeSkip = 0;
    this.mainWorld.quatNormalizeFast = false;
    this.mainWorld.defaultContactMaterial.contactEquationStiffness = 1e9;
  }

  addBaseScene() {
    this.mainScene.background = new Color(0x3333ff);

    this.addCollisionTestBox();
    this.addBasePlane();
    // this.addToScene(this.mainCamera);
    this.addSunLight();
  }

  addToScene(object: Object3D, objectBody?: Body) {
    this.mainScene.add(object);

    if (objectBody) {
      this.mainWorld.addBody(objectBody);
    }
  }

  addPlayerToScene(object: Group, playerBox?: Box3) {
    this.mainScene.add(object);

    if (playerBox) {
      this.sceneObjectsToUpdate.push({ mesh: object, box: playerBox });
    }
  }

  digestWorld() {
    let i = this.sceneUpdates.length;

    while (i--) {
      this.sceneUpdates[i]();

      if (i <= 0) {
        break;
      }
    }
  }

  digestObjects() {
    let i = this.sceneObjectsToUpdate.length;

    while (i--) {
      this.sceneObjectsToUpdate[i].box
        .copy(this.sceneObjectsToUpdate[i].mesh.geometry.boundingBox)
        .applyMatrix4(this.sceneObjectsToUpdate[i].mesh.matrixWorld);

      if (i <= 0) {
        break;
      }
    }
  }

  private addCollisionTestBox() {
    const material = new MeshStandardMaterial({ color: new Color(0xff0000) });
    const box = new Box3();
    const mesh = new Mesh(new BoxGeometry(3, 1, 3), material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.x = 6;
    mesh.position.y = 0.5;
    mesh.position.z = -6;
    mesh.userData = {
      isStatic: true,
    };

    mesh.geometry.computeBoundingBox();

    this.addToScene(mesh);
    this.sceneObjectsToUpdate.push({ mesh, box });
    this.sceneObjectsCheckCollision.push({ mesh, box });
  }

  private addBasePlane() {
    const planeMaterial = new MeshStandardMaterial({ color: '0x999999' });
    const planeGeometry = new PlaneGeometry(100, 100, 100, 100);
    const plane = new Mesh(planeGeometry, planeMaterial);
    const planeBody = new Body({
      mass: 0, // can also be achieved by setting the mass to 0
      shape: new Plane(),
    });

    planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up

    plane.position.y = 0;
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    plane.userData = {
      isFloor: true,
    };

    this.addToScene(plane, planeBody);

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
