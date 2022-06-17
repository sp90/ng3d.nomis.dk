import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { SceneState } from '@states/scene/scene.state';
import TWEEN, { removeAll, Tween } from '@tweenjs/tween.js';
import { Box3, Mesh, Raycaster, Vector2, Vector3 } from 'three';

@Injectable({
  providedIn: 'root',
})
export class PlayerMovementState {
  mouseIsDown = false;
  lastClickedPointer = new Vector2(0, 0);
  raycaster = new Raycaster();
  tweenGroup = new TWEEN.Group();

  player?: Mesh;
  playerBox?: Box3;
  playerEasing = TWEEN.Easing.Linear.None;
  playerBottom = 0;
  camera = this.CameraState.mainCamera;

  playerMoveTween?: Tween<Vector3> | null;

  constructor(
    private SceneState: SceneState,
    private CameraState: CamerasState
  ) {}

  initPlayerMovement(player: Mesh, playerBox: Box3, playerBottom: number) {
    this.player = player;
    this.playerBox = playerBox;
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
  }

  movePlayerTo(event: MouseEvent) {
    if (this.player && this.camera) {
      const _self = this;
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
          const vectorRoundY =
            Math.round(vector.y * 10) / 10 + this.playerBottom;

          const distance = this.player.position.distanceTo(vector as any);
          const duration = (400 / 2.2) * distance;

          removeAll();

          this.player?.lookAt(vector.x, this.player.position.y, vector.z);

          const intersectsWith = _self.playerBoxIsColiding();

          if (!intersectsWith) {
            console.log(intersectsWith);

            new Tween(this.player.position)
              .to(
                {
                  x: vector.x,
                  y: vectorRoundY,
                  z: vector.z,
                },
                duration
              )
              .onUpdate((_) => {
                if (_self.playerBoxIsColiding()) {
                  removeAll();
                }
              })
              .start();
          }
        }

        if (i <= 0) {
          break;
        }
      }
    }
  }

  playerBoxIsColiding(): null | object {
    let i = this.SceneState.sceneObjectsCheckCollision.length;
    let isIntersectingWith = null;

    if (this.player && this.playerBox) {
      while (i--) {
        const obj = this.SceneState.sceneObjectsCheckCollision[i];

        if (this.playerBox.intersectsBox(obj.box)) {
          isIntersectingWith = obj;
        }

        if (isIntersectingWith) {
          break;
        }

        if (i <= 0) {
          break;
        }
      }
    }

    return isIntersectingWith;
  }
}
