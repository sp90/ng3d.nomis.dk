import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { SceneState } from '@states/scene/scene.state';
import { WorldState } from '@states/world/world.state';
import { Body, BODY_TYPES, Cylinder } from 'cannon-es';
import {
  Box3,
  BoxGeometry,
  BoxHelper,
  Clock,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { PlayerMovementState } from './player-movement.state';

const playerSize = 0.25;
export const playerHeight = 2;
const playerSightHeight = 0.75;
const playerSegments = 32;

@Injectable({
  providedIn: 'root',
})
export class PlayerState {
  player: Group = new Group();
  playerBodyShape = new Cylinder(
    playerSize,
    playerSize,
    playerHeight,
    playerSegments
  );
  playerBox = new Box3();
  playerBody = new Body({
    mass: 80,
    shape: this.playerBodyShape,
    type: BODY_TYPES.KINEMATIC,
    fixedRotation: true,
  });

  camera = this.CameraState.mainCamera;
  cameraDistance = new Vector3(7, 10, 7);

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
      new CylinderGeometry(
        playerSize,
        playerSize,
        playerHeight,
        playerSegments
      ),
      material
    );

    // Main player box
    playerMesh.position.set(0, 0, 0);
    playerMesh.geometry.computeBoundingBox();
    playerMesh.castShadow = true;
    playerMesh.receiveShadow = true;
    playerMesh.userData = {
      noIntersect: true,
    };

    this.playerBody.position.copy(playerMesh.position as any);
    this.playerBody.boundingRadius = playerSize;

    // Direction mesh
    const playerDirMesh = new Mesh(new BoxGeometry(0.05, 0.05, 0.5), material2);

    playerDirMesh.position.set(0, playerSightHeight, playerSize);
    playerDirMesh.userData = {
      noIntersect: true,
    };

    const boxHelper = new BoxHelper(playerMesh, 0xffff00);

    // Add to player group
    this.player.add(playerDirMesh);
    this.player.add(playerMesh);
    this.player.add(boxHelper);
    this.WorldState.mainWorld.addBody(this.playerBody);

    this.initPlayerCameraPos(this.camera, this.player);
    this.SceneState.addPlayerToScene(this.player);
    this.SceneState.addToScene(this.camera);
    this.PlayerMovementState.initPlayerMovement(
      clock,
      this.player,
      this.playerBox,
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
