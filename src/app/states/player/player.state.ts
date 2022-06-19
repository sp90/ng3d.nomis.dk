import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { SceneState } from '@states/scene/scene.state';
import { Body, Box, ContactMaterial, Material, Vec3 } from 'cannon-es';
import {
  BoxGeometry,
  Color,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
} from 'three';
import { PlayerMovementState } from './player-movement.state';

export interface IPlayerObj {
  model: Mesh<BoxGeometry, MeshStandardMaterial>;
  shape: Box;
  body: Body;
  bottom: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerState {
  player?: IPlayerObj;

  playerMaterialPhy = new Material('playerMat');
  playerContactMaterial = new ContactMaterial(
    this.playerMaterialPhy,
    this.playerMaterialPhy,
    {
      friction: 0.0,
      restitution: 0.3,
    }
  );

  camera = this.CameraState.mainCamera;
  cameraDistance = {
    y: 7,
    x: 5,
    z: 5,
  };

  constructor(
    private SceneState: SceneState,
    private CameraState: CamerasState,
    private PlayerMovementState: PlayerMovementState
  ) {
    this.SceneState.mainWorld.addContactMaterial(this.playerContactMaterial);
  }

  readyPlayer() {
    const player = this.createPlayer();

    this.player = player;

    this.initPlayerCameraPos(this.camera, this.player.model);
    this.SceneState.addToScene(this.player.model, this.player.body);
    this.SceneState.addToScene(this.camera);
    this.PlayerMovementState.initPlayerMovement(this.player);

    return this.player;
  }

  private createPlayer() {
    const material = new MeshStandardMaterial({ color: new Color('teal') });
    const playerHeight = 2;
    const playerBottom = playerHeight / 2;

    const model = new Mesh(new BoxGeometry(0.5, playerHeight, 0.4), material);

    model.castShadow = true;
    model.receiveShadow = true;

    const shape = new Box(new Vec3(0.5, playerHeight, 0.4));
    const body = new Body({
      mass: 50,
      type: Body.KINEMATIC,
      shape: shape,
      material: this.playerMaterialPhy,
    });

    model.userData = {
      isPlayer: true,
    };

    model.position.set(0, playerBottom, 0);
    body.position.set(0, playerBottom, 0);

    body.linearDamping = 0.01;
    body.angularDamping = 0.01;

    body.addEventListener('collide', (e: any) => {
      console.log('collide: ', e);

      this.PlayerMovementState.killMovement();
    });

    return {
      model,
      shape,
      body,
      bottom: playerBottom,
    };
  }

  private initPlayerCameraPos(camera: PerspectiveCamera, player: Mesh) {
    camera.position.x = player.position.x + this.cameraDistance.x;
    camera.position.y = player.position.y + this.cameraDistance.y;
    camera.position.z = player.position.z + this.cameraDistance.z;

    camera.lookAt(player.position);

    return camera;
  }
}

// // Initialize the mesh or use a provided custom mesh
// var mesh = customMesh || null;

// // Check for rigid body and convert the shape to a THREE.js mesh representation
// if (body instanceof CANNON.RigidBody && !mesh) {
// 	mesh = _cannon.shape2mesh(body.shape, material);
// }

// // Populate the bodies and visuals arrays
// if (mesh) {
// 	_cannon.bodies.push(body);
// 	_cannon.visuals.push(mesh);

// 	body.visualref = mesh;
// 	body.visualref.visualId = _cannon.bodies.length - 1;

// 	// Add body/mesh to scene/world
// 	_three.scene.add(mesh);
// 	_cannon.world.add(body);
// }

// return mesh;
