import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { SceneState } from '@states/scene/scene.state';
import { Body } from 'cannon-es';
import {
  Box3,
  BoxGeometry,
  Color,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
} from 'three';
import { PlayerMovementState } from './player-movement.state';

@Injectable({
  providedIn: 'root',
})
export class PlayerState {
  player?: Mesh;
  playerBox?: Box3;
  playerBody?: Body;
  playerBottom = 0;
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
  ) {}

  readyPlayer() {
    const material = new MeshStandardMaterial({ color: new Color('teal') });
    const playerHeight = 2;

    this.playerBox = new Box3();
    this.player = new Mesh(
      new BoxGeometry(0.5, playerHeight, 0.4, 2, 2, 2),
      material
    );

    this.playerBottom = playerHeight / 2;
    this.player.castShadow = true;
    this.player.receiveShadow = true;
    this.player.position.x = 0;
    this.player.position.y = this.playerBottom;
    this.player.position.z = 0;
    this.player.userData = {
      noIntersect: true,
    };
    this.player.geometry.computeBoundingBox();

    this.initPlayerCameraPos(this.camera, this.player);
    this.SceneState.addPlayerToScene(this.player, this.playerBox);
    this.SceneState.addToScene(this.camera);
    this.PlayerMovementState.initPlayerMovement(
      this.player,
      this.playerBox,
      this.playerBottom
    );

    return this.player;
  }

  private initPlayerCameraPos(camera: PerspectiveCamera, player: Mesh) {
    camera.position.x = player.position.x + this.cameraDistance.x;
    camera.position.y = player.position.y + this.cameraDistance.y;
    camera.position.z = player.position.z + this.cameraDistance.z;

    camera.lookAt(player.position);

    return camera;
  }
}
