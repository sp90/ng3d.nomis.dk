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

  playerIsMoving = false;
  targetPos: Vector3 | null = null;
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
        throttleTime(20),
        map((event) => this.mapMouseEvent(this, event)),
        tap((targetPos) => {
          if (targetPos) {
            this.targetPos = targetPos;
          }
        })
        // throttleTime(50),
        // tap((targetPos) => this.movePlayerTo(this, targetPos))
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

  tick(delta: number) {
    if (this.player && this.targetPos) {
      const currentPos = new Vector3();
      const actualMoveSpeed = delta * this.velocity; // velocity = 12

      currentPos.copy(this.player.position);

      const dirVector = new Vector3();

      this.player.lookAt(this.targetPos.x, currentPos.y, this.targetPos.z);

      dirVector.subVectors(this.targetPos, currentPos).normalize();

      const distance = currentPos.distanceTo(this.targetPos);

      if (distance > dirVector.length()) {
        this.playerIsMoving = true;

        dirVector.y = 0;
        dirVector.normalize();
        dirVector.multiplyScalar(actualMoveSpeed);

        this.player.position.add(dirVector);
      } else {
        this.playerIsMoving = false;
      }
    }
  }

  mapMouseEvent(_self: PlayerMovementState, event: MouseEvent | null) {
    if (event && _self.player && _self.camera) {
      _self.lastClickedPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      _self.lastClickedPointer.y =
        -(event.clientY / window.innerHeight) * 2 + 1;

      // update the picking ray with the camera and pointer position
      _self.raycaster.setFromCamera(_self.lastClickedPointer, _self.camera);

      // calculate objects intersecting the picking ray
      const intersects = _self.raycaster.intersectObjects(
        _self.SceneState.mainScene.children
      );

      let i = intersects.length;

      while (i--) {
        if (intersects[i].object.userData['isFloor'] === true) {
          const targetPos = new Vector3().copy(intersects[i].point);

          // _self.player.lookAt(
          //   targetPos.x,
          //   _self.player.position.y,
          //   targetPos.z
          // );

          return targetPos;
        }

        if (i <= 0) {
          break;
        }
      }
    }

    return null;
  }

  movePlayerTo(_self: PlayerMovementState, targetPos: Vector3 | null) {
    if (!_self.player || !targetPos) {
      return;
    }

    const currentPos = new Vector3().copy(_self.player.position);
    const distance = currentPos.distanceTo(targetPos);
    const duration = distance / _self.velocity;

    targetPos.y = _self.player.position.y;

    _self.playerMoveTween && _self.playerMoveTween.stop();
    _self.playerMoveTween = new Tween(_self.player.position)
      .to(targetPos, duration * 1000) // Seconds to MS
      .start();
  }

  // playerBoxIsColiding(): null | object {
  //   let i = this.SceneState.sceneObjectsCheckCollision.length;
  //   let isIntersectingWith = null;

  //   if (this.player && this.playerBox) {
  //     while (i--) {
  //       const obj = this.SceneState.sceneObjectsCheckCollision[i];

  //       if (this.playerBox.intersectsBox(obj.box)) {
  //         isIntersectingWith = obj;
  //       }

  //       if (isIntersectingWith) {
  //         break;
  //       }

  //       if (i <= 0) {
  //         break;
  //       }
  //     }
  //   }

  //   return isIntersectingWith;
  // }
}
