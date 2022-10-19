import { Injectable } from '@angular/core';
import { SceneState } from '@states/scene/scene.state';
import {
  Body,
  BODY_TYPES,
  Box,
  ContactMaterial,
  GSSolver,
  Material,
  Plane,
  Sphere,
  SplitSolver,
  Vec3,
  World,
} from 'cannon-es';
import uuidv4 from 'src/app/utility/uuid';
import {
  Box3,
  BoxGeometry,
  Color,
  Mesh,
  MeshNormalMaterial,
  MeshStandardMaterial,
  SphereGeometry,
} from 'three';

/**
 * For now only enemies will collide with the world, this is because it does not do anything for game play
 *
 * In terms of player collision with walls i will write this my self
 *
 * Why having cannon in here is to at a later stage make enemies fly on knockback and kills, together with moving them towards our player
 *
 * Subject to change
 */

type IPos = [number, number, number];
type ISize = [number, number, number];

@Injectable({
  providedIn: 'root',
})
export class WorldState {
  mainWorld = new World({
    gravity: new Vec3(0, -20, 0), // m/s²
  });

  movableObjects: any[] = [];
  staticObjects: any[] = [];

  constructor(private SceneState: SceneState) {
    this.createTestWorldObj();
  }

  createTestWorldObj() {
    const physicsMaterial = new Material('physics');
    const physics_physics = new ContactMaterial(
      physicsMaterial,
      physicsMaterial,
      {
        friction: 0.8,
        restitution: 0.0,
      }
    );

    const solver = new GSSolver();
    solver.iterations = 7;
    solver.tolerance = 0.1;
    this.mainWorld.solver = new SplitSolver(solver);
    this.mainWorld.broadphase.useBoundingBoxes = true;
    this.mainWorld.defaultContactMaterial.contactEquationStiffness = 1e9;
    this.mainWorld.defaultContactMaterial.contactEquationRelaxation = 4;
    this.mainWorld.addContactMaterial(physics_physics);

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
      // material: physicsMaterial,
    });
    groundBody.position.y = 0;
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up
    this.mainWorld.addBody(groundBody);

    this.addCollisionTestBox([6, -0.5, -6], [3, 2, 3]);
    this.addCollisionTestBox([-6, -0.5, 6], [3, 2, 3]);
  }

  tick() {
    this.mainWorld.fixedStep();

    let i = this.movableObjects.length;

    while (i--) {
      this.movableObjects[i].object.position.copy(
        this.movableObjects[i].body.position
      );
      // this.movableObjects[i].object.quaternion.copy(
      //   this.movableObjects[i].body.quaternion
      // );

      if (i <= 0) {
        break;
      }
    }
  }

  private addCollisionTestBox(pos: IPos, size: ISize) {
    const material = new MeshStandardMaterial({ color: new Color(0xff0000) });
    const mesh = new Mesh(new BoxGeometry(size[0], size[1], size[2]), material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.userData = {
      isStatic: true,
    };

    const meshBody = new Body({
      shape: new Box(new Vec3(size[0], size[1], size[2])),
      type: BODY_TYPES.STATIC,
    });

    meshBody.position.set(pos[0], pos[1], pos[2]);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.geometry.computeBoundingBox();

    this.mainWorld.addBody(meshBody);
    this.SceneState.addToScene(mesh);
    this.staticObjects.push({
      id: uuidv4(),
      body: meshBody,
      object: mesh,
      box: new Box3(),
    });
  }
}
