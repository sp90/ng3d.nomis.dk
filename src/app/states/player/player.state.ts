import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { SceneState } from '@states/scene/scene.state';
import { WorldState } from '@states/world/world.state';
import { Body, Cylinder } from 'cannon-es';
import {
  BoxGeometry,
  Clock,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
} from 'three';
import { PlayerMovementState } from './player-movement.state';

const playerHeight = 2;
const playerSightHeight = 1.75;

@Injectable({
  providedIn: 'root',
})
export class PlayerState {
  player: Group = new Group();
  playerBodyShape = new Cylinder(0.25, 0.25, playerHeight, 20);
  playerBody = new Body({
    mass: 80,
    shape: this.playerBodyShape,
  });

  camera = this.CameraState.mainCamera;
  cameraDistance = {
    y: 7,
    x: 5,
    z: 5,
  };

  constructor(
    private SceneState: SceneState,
    private WorldState: WorldState,
    private CameraState: CamerasState,
    private PlayerMovementState: PlayerMovementState
  ) {}

  readyPlayer(clock: Clock) {
    const material = new MeshStandardMaterial({ color: new Color('teal') });
    const material2 = new MeshStandardMaterial({ color: new Color('yellow') });
    const playerMesh = new Mesh(
      new CylinderGeometry(0.25, 0.25, playerHeight, 20),
      material
    );

    // Main player box
    playerMesh.position.set(0, playerHeight / 2, 0);
    playerMesh.geometry.computeBoundingBox();
    playerMesh.castShadow = true;
    playerMesh.receiveShadow = true;
    playerMesh.userData = {
      noIntersect: true,
    };

    this.playerBody.position.copy(playerMesh.position as any);

    // Direction mesh
    const playerDirMesh = new Mesh(new BoxGeometry(0.05, 0.05, 0.5), material2);

    playerDirMesh.position.set(0, playerSightHeight, 0.25);
    playerDirMesh.userData = {
      noIntersect: true,
    };

    // Add to player group
    this.player.add(playerDirMesh);
    this.player.add(playerMesh);
    this.WorldState.mainWorld.addBody(this.playerBody);

    this.initPlayerCameraPos(this.camera, this.player);
    this.SceneState.addPlayerToScene(this.player);
    this.SceneState.addToScene(this.camera);
    this.PlayerMovementState.initPlayerMovement(
      clock,
      this.player,
      this.playerBody
    );

    return this.player;
  }

  private initPlayerCameraPos(camera: PerspectiveCamera, player: Group) {
    camera.position.x = player.position.x + this.cameraDistance.x;
    camera.position.y = player.position.y + this.cameraDistance.y;
    camera.position.z = player.position.z + this.cameraDistance.z;

    camera.lookAt(player.position);

    return camera;
  }
}
