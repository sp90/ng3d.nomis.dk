import { Injectable } from '@angular/core';
import { SceneState } from '@states/scene/scene.state';
import { Body, Plane, Sphere, Vec3, World } from 'cannon-es';
import uuidv4 from 'src/app/utility/uuid';
import { Mesh, MeshNormalMaterial, SphereGeometry } from 'three';

@Injectable({
  providedIn: 'root',
})
export class WorldState {
  mainWorld = new World({
    gravity: new Vec3(0, -9.82, 0), // m/s²
  });

  movableObjects: any[] = [];

  constructor(private SceneState: SceneState) {
    this.createTestWorldObj();
  }

  createTestWorldObj() {
    // Create a sphere body
    const radius = 1;
    const sphereBody = new Body({
      mass: 15, // kg
      shape: new Sphere(radius),
    });
    sphereBody.position.set(0, 10, 0);

    const geometry = new SphereGeometry(radius);
    const material = new MeshNormalMaterial();
    const mesh = new Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.mainWorld.addBody(sphereBody);
    this.SceneState.addToScene(mesh);

    this.movableObjects.push({
      id: uuidv4(),
      body: sphereBody,
      object: mesh,
    });

    // Create a static plane for the ground
    const groundBody = new Body({
      type: Body.STATIC, // can also be achieved by setting the mass to 0
      shape: new Plane(),
    });
    groundBody.position.y = 0;
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up
    this.mainWorld.addBody(groundBody);
  }

  tick() {
    this.mainWorld.fixedStep();

    let i = this.movableObjects.length;

    while (i--) {
      this.movableObjects[i].object.position.copy(
        this.movableObjects[i].body.position
      );
      this.movableObjects[i].object.quaternion.copy(
        this.movableObjects[i].body.quaternion
      );

      if (i <= 0) {
        break;
      }
    }
  }
}
