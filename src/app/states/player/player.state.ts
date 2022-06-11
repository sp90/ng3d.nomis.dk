import { Injectable } from '@angular/core';
import { BoxService } from '@services/box/box.service';
import { CamerasState } from '@states/cameras/cameras.state';
import { SceneState } from '@states/scene/scene.state';
import gsap from 'gsap';
import {
  BoxGeometry,
  Color,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Raycaster,
  Vector2,
  Vector3,
} from 'three';

@Injectable({
  providedIn: 'root',
})
export class PlayerState {
  mouseIsDown = false;
  lastClickedPointer = new Vector2(0, 0);
  playerMoveInterval?: ReturnType<typeof setInterval>;
  raycaster = new Raycaster();

  player?: Mesh;
  camera = this.CameraState.mainCamera;
  cameraDistance = {
    y: 7,
    x: 5,
    z: 5,
  };
  playerBottom = 0;

  constructor(
    private SceneState: SceneState,
    private CameraState: CamerasState,
    private BoxService: BoxService
  ) {}

  readyPlayer() {
    const _self = this;
    const material = new MeshStandardMaterial({ color: new Color('teal') });
    const playerHeight = 2;

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

    this.addCollisionTestBox();
    this.SceneState.addToScene(this.player);
    this.SceneState.addToScene(this.camera);
    this.fixedCameraPosToPlayer(this.camera, this.player);

    document.addEventListener('pointerdown', (event: MouseEvent) => {
      _self.mouseIsDown = true;
    });

    document.addEventListener('pointermove', (event: MouseEvent) => {
      if (_self.mouseIsDown) {
        _self.movePlayerTo(event);
      }
    });

    document.addEventListener('pointerup', (event: MouseEvent) => {
      _self.mouseIsDown = false;
    });

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

  movePlayerTo(event: MouseEvent) {
    this.lastClickedPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.lastClickedPointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and pointer position
    this.raycaster.setFromCamera(this.lastClickedPointer, this.camera);

    // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(
      this.SceneState.mainScene.children
    );

    let i = intersects.length;
    while (i--) {
      if (intersects[i].object.userData['isFloor'] === true) {
        const vector = new Vector3().copy(intersects[i].point);
        const vectorRoundY = Math.round(vector.y * 10) / 10 + this.playerBottom;

        if (this.player && this.camera) {
          gsap.to(this.player.position, {
            duration: 0.5,
            x: vector.x,
            y: vectorRoundY,
            z: vector.z,
          });

          gsap.to(this.camera.position, {
            duration: 0.5,
            x: vector.x + this.cameraDistance.x,
            y: vectorRoundY + this.cameraDistance.y,
            z: vector.z + this.cameraDistance.z,
          });
        }
      }

      if (i <= 0) {
        break;
      }
    }
  }

  fixedCameraPosToPlayer(camera: PerspectiveCamera, player: Mesh) {
    camera.position.x = player.position.x + this.cameraDistance.x;
    camera.position.y = player.position.y + this.cameraDistance.y;
    camera.position.z = player.position.z + this.cameraDistance.z;

    camera.lookAt(player.position);

    return camera;
  }
}
