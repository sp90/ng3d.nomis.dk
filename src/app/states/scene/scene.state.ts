import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import {
  Body,
  Box,
  ContactMaterial,
  GSSolver,
  Material,
  NaiveBroadphase,
  Plane,
  Vec3,
  World,
} from 'cannon-es';
import {
  Box3,
  BoxGeometry,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshLambertMaterial,
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
    gravity: new Vec3(0, -9.82, 0), // m/s²
    broadphase: new NaiveBroadphase(),
    quatNormalizeSkip: 0,
    quatNormalizeFast: false,
  });

  solver = new GSSolver();

  physicsMaterial = new Material('slipperyMaterial');
  solidMaterial = new Material('solidMaterial');
  physicsContactMaterial = new ContactMaterial(
    this.physicsMaterial,
    this.physicsMaterial,
    {
      friction: 0.0,
      restitution: 0.3,
    }
  );
  solidContactMaterial = new ContactMaterial(
    this.solidMaterial,
    this.solidMaterial,
    {
      friction: 0.2,
      restitution: 0.6,
    }
  );

  objs: any[] = [];

  constructor(private CamerasState: CamerasState) {
    this.mainWorld.addContactMaterial(this.physicsContactMaterial);
    this.mainWorld.addContactMaterial(this.solidContactMaterial);
    this.mainWorld.defaultContactMaterial = this.physicsContactMaterial;
    this.mainWorld.defaultContactMaterial.contactEquationStiffness = 1e9;
    this.mainWorld.defaultContactMaterial.contactEquationRelaxation = 4;

    this.solver.iterations = 3;
    this.solver.tolerance = 0.1;
  }

  addBaseScene() {
    this.mainScene.background = new Color(0x3333ff);

    this.addBasePlane();
    this.addCollisionTestBox();
    this.addToScene(this.mainCamera);
    this.addSunLight();
  }

  addToScene(object: Object3D, objectBody?: Body) {
    if (objectBody) {
      this.objs.push({
        object,
        objectBody,
      });
      this.mainWorld.addBody(objectBody);
    }

    this.mainScene.add(object);
  }

  updatePhysics() {
    // Perform a simulation step
    this.mainWorld.fixedStep();

    let i = this.objs.length;

    while (i--) {
      const obj = this.objs[i].object;
      const body = this.objs[i].objectBody;

      if (obj.userData['isPlayer']) {
        obj.position.x = body.position.x;
        obj.position.z = body.position.z;
      } else if (
        obj.userData['debug'] &&
        typeof obj.userData['debug'] === 'function'
      ) {
        obj.userData['debug'](obj, body);
      } else {
        obj.position?.copy(body.position);
        obj.quaternion?.copy(body.quaternion);
      }

      if (i <= 0) {
        break;
      }
    }
  }

  private addCollisionTestBox() {
    const size = [3, 6, 3];
    const pos = [6, 0, -6];

    const material = new MeshLambertMaterial({ color: 0x222222 });
    const mesh = new Mesh(new BoxGeometry(size[0], size[1], size[2]), material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(pos[0], pos[1], pos[2]);

    const halfExtents = new Vec3(size[0], size[1], size[2]);
    const boxShape = new Box(halfExtents);
    const boxBody = new Body({
      mass: 0,
      shape: boxShape,
      material: this.physicsMaterial,
      position: new Vec3(pos[0], pos[1], pos[2]),
    });

    // mesh.userData = {
    //   debug: (obj: any, body: any) => {
    //     console.log(obj.position);
    //   },
    // };
    this.addToScene(mesh, boxBody);
  }

  private addBasePlane() {
    const planeMaterial = new MeshStandardMaterial({ color: '0x999999' });
    const planeGeometry = new PlaneGeometry(100, 100, 100, 100);
    const plane = new Mesh(planeGeometry, planeMaterial);
    const planeBody = new Body({
      mass: 0,
      shape: new Plane(),
      material: this.physicsMaterial,
    });

    planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up
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
