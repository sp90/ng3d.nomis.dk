import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { SceneState } from '@states/scene/scene.state';
import TWEEN from '@tweenjs/tween.js';
import gsap, { Linear } from 'gsap';
import { Mesh, Raycaster, Vector2, Vector3 } from 'three';

@Injectable({
  providedIn: 'root',
})
export class PlayerMovementState {
  mouseIsDown = false;
  lastClickedPointer = new Vector2(0, 0);
  raycaster = new Raycaster();
  tweenGroup = new TWEEN.Group();

  player?: Mesh;
  playerEasing = TWEEN.Easing.Linear.None;
  playerBottom = 0;
  camera = this.CameraState.mainCamera;

  playerMoveTween?: gsap.core.Tween | null;
  // cameraMoveTween?: gsap.core.Tween | null;

  constructor(
    private SceneState: SceneState,
    private CameraState: CamerasState
  ) {}

  initPlayerMovement(player: Mesh, playerBottom: number) {
    this.player = player;
    this.playerBottom = playerBottom;

    const _self = this;

    document.addEventListener('click', (event: MouseEvent) => {
      _self.movePlayerTo(event);
    });

    document.addEventListener('dblclick', (event: MouseEvent) => {
      _self.movePlayerTo(event);
    });
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

    // document.addEventListener('keydown', (event: KeyboardEvent) => {
    //   _self.mouseIsDown = false;
    // });
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
          const distance = this.player.position.distanceTo(vector);

          this.player.lookAt(vector.x, this.player.position.y, vector.z);
          this.playerMoveTween = gsap.to(this.player.position, {
            duration: (0.36 / 2.2) * distance,
            ease: Linear.easeNone,
            overwrite: true,
            x: vector.x,
            y: vectorRoundY,
            z: vector.z,
          });
        }
      }

      if (i <= 0) {
        break;
      }
    }
  }
}
