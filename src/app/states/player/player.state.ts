import { Injectable } from '@angular/core';
import { BoxService } from '@services/box/box.service';
import { CamerasState } from '@states/cameras/cameras.state';
import { SceneState } from '@states/scene/scene.state';
import { Body, Sphere } from 'cannon-es';
import {
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
    private PlayerMovementState: PlayerMovementState,
    private BoxService: BoxService
  ) {}

  readyPlayer() {
    const material = new MeshStandardMaterial({ color: new Color('teal') });
    const playerHeight = 2;

    this.player = new Mesh(
      new BoxGeometry(0.5, playerHeight, 0.4, 2, 2, 2),
      material
    );

    this.initPlayerBasicSettings();

    const shape = new Sphere(1);
    const body = new Body({
      mass: 1,
      shape,
    });

    this.playerBottom = playerHeight / 2;

    this.addCollisionTestBox();
    this.initCameraPos(this.camera, this.player);
    this.SceneState.addToScene(this.player, body, ['y']);
    this.SceneState.addToScene(this.camera);
    this.PlayerMovementState.initPlayerMovement(this.player, this.playerBottom);

    return this.player;
  }

  addCollisionTestBox() {
    const box = this.BoxService.addBox(0xff0000, {
      width: 3,
      height: 0.5,
      depth: 3,
    });

    box.position.x = 6;
    box.position.y = 0.25;
    box.position.z = -6;
    box.userData = {
      isFloor: true,
    };
  }

  private initPlayerBasicSettings() {
    if (this.player) {
      this.player.castShadow = true;
      this.player.receiveShadow = true;
      this.player.position.x = 0;
      this.player.position.y = 1;
      this.player.position.z = 0;
      this.player.userData = {
        noIntersect: true,
      };
    }
  }

  private initCameraPos(camera: PerspectiveCamera, player: Mesh) {
    camera.position.x = player.position.x + this.cameraDistance.x;
    camera.position.y = player.position.y + this.cameraDistance.y;
    camera.position.z = player.position.z + this.cameraDistance.z;

    camera.lookAt(player.position);

    return camera;
  }
}
