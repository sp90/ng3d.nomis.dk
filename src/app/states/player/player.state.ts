import { Injectable } from '@angular/core';
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
  cameraDistance = 5;

  constructor(
    private SceneState: SceneState,
    private CameraState: CamerasState
  ) {}

  readyPlayer() {
    const _self = this;
    const material = new MeshStandardMaterial({ color: new Color('teal') });

    this.player = new Mesh(new BoxGeometry(0.5, 2, 0.4, 2, 2, 2), material);
    this.player.castShadow = true;
    this.player.receiveShadow = true;
    this.player.position.x = 0;
    this.player.position.y = 0;
    this.player.position.z = 0;
    this.player.userData = {
      noIntersect: true,
    };

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
      if (intersects[0].object.userData['isFloor']) {
        const vector = new Vector3().copy(intersects[0].point);

        if (this.player && this.camera) {
          gsap.to(this.player.position, {
            duration: 0.5,
            x: vector.x,
            z: vector.z,
          });

          gsap.to(this.camera.position, {
            duration: 0.5,
            x: vector.x + this.cameraDistance,
            z: vector.z + this.cameraDistance,
          });
        }
      }

      if (i <= 0) {
        break;
      }
    }
  }

  fixedCameraPosToPlayer(camera: PerspectiveCamera, player: Mesh) {
    camera.position.x = player.position.x + this.cameraDistance;
    camera.position.y = player.position.y + this.cameraDistance + 2;
    camera.position.z = player.position.z + this.cameraDistance;

    camera.lookAt(player.position);

    return camera;
  }
}
