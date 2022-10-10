import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { SceneState } from '@states/scene/scene.state';
import TWEEN, { Tween } from '@tweenjs/tween.js';
import { BehaviorSubject, map, tap, throttleTime } from 'rxjs';
import { Box3, Clock, Mesh, Raycaster, Vector2, Vector3 } from 'three';

@Injectable({
  providedIn: 'root',
})
export class PlayerMovementState {
  private moveSub = new BehaviorSubject<MouseEvent | null>(null);

  mouseIsDown = false;
  lastClickedPointer = new Vector2(0, 0);
  raycaster = new Raycaster();
  tweenGroup = new TWEEN.Group();

  clock?: Clock;
  player?: Mesh;
  playerBox?: Box3;
  playerBottom = 0;
  camera = this.CameraState.mainCamera;

  targetPosition: Vector3 | null = null;
  playerMoveTween?: Tween<Vector3> | null;
  velocity = 12;

  constructor(
    private SceneState: SceneState,
    private CameraState: CamerasState
  ) {}

  initPlayerMovement(
    clock: Clock,
    player: Mesh,
    playerBox: Box3,
    playerBottom: number
  ) {
    this.clock = clock;
    this.player = player;
    this.playerBox = playerBox;
    this.playerBottom = playerBottom;

    this.moveSub
      .pipe(
        map((event) => {
          if (event) {
            // Kill animation
            if (this.player && this.camera) {
              this.lastClickedPointer.x =
                (event.clientX / window.innerWidth) * 2 - 1;
              this.lastClickedPointer.y =
                -(event.clientY / window.innerHeight) * 2 + 1;

              // update the picking ray with the camera and pointer position
              this.raycaster.setFromCamera(
                this.lastClickedPointer,
                this.camera
              );

              // calculate objects intersecting the picking ray
              const intersects = this.raycaster.intersectObjects(
                this.SceneState.mainScene.children
              );

              let i = intersects.length;

              while (i--) {
                if (intersects[i].object.userData['isFloor'] === true) {
                  const targetPos = new Vector3().copy(intersects[i].point);

                  this.player.lookAt(
                    targetPos.x,
                    this.player.position.y,
                    targetPos.z
                  );

                  return targetPos;
                }

                if (i <= 0) {
                  break;
                }
              }
            }
          }

          return null;
        }),
        throttleTime(50),
        tap((event) => event && this.movePlayerTo(event))
      )
      .subscribe();

    const _self = this;

    document.addEventListener('click', (event: MouseEvent) => {
      _self.moveSub.next(event);
    });

    document.addEventListener('pointerdown', (event: MouseEvent) => {
      _self.mouseIsDown = true;
    });

    document.addEventListener('pointermove', (event: MouseEvent) => {
      if (_self.mouseIsDown) {
        _self.moveSub.next(event);
      }
    });

    document.addEventListener('pointerup', (event: MouseEvent) => {
      _self.mouseIsDown = false;
    });
  }

  movePlayerTo(targetPos: Vector3) {
    if (!this.player) {
      return;
    }

    const currentPos = new Vector3().copy(this.player.position);
    const distance = currentPos.distanceTo(targetPos);
    const duration = distance / this.velocity;

    targetPos.y = this.player.position.y;

    this.playerMoveTween && this.playerMoveTween.stop();
    this.playerMoveTween = new Tween(this.player.position)
      .to(targetPos, duration * 1000) // Seconds to MS
      .start();
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
