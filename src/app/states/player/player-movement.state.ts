import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { SceneState } from '@states/scene/scene.state';
import { WorldState } from '@states/world/world.state';
import { Body } from 'cannon-es';
import { BehaviorSubject, map, tap, throttleTime } from 'rxjs';
import {
  ArrowHelper,
  Box3,
  Clock,
  Group,
  Raycaster,
  Vector2,
  Vector3,
} from 'three';

const PLAYER_COLLISION_RAY_NEAR = 0;
const PLAYER_COLLISION_RAY_FAR = 100;

@Injectable({
  providedIn: 'root',
})
export class PlayerMovementState {
  private moveSub = new BehaviorSubject<MouseEvent | null>(null);

  mainCamera = this.CameraState.mainCamera;
  staticObjects = this.WorldState.staticObjects;
  lastClickedPointer = new Vector2(0, 0);
  rayHelper = new ArrowHelper();
  raycaster = new Raycaster();
  targetPos = new Vector3();
  dirVector = new Vector3();
  nextPos = new Vector3();
  mouseIsDown = false;
  playerIsMoving = false;
  velocity = 10;

  playerRay = new Raycaster();
  clock?: Clock;
  player?: Group;
  playerBody?: Body;

  constructor(
    private SceneState: SceneState,
    private CameraState: CamerasState,
    private WorldState: WorldState
  ) {}

  initPlayerMovement(clock: Clock, player: Group, playerBody: Body) {
    this.clock = clock;
    this.player = player;
    this.playerBody = playerBody;
    this.playerRay.far = PLAYER_COLLISION_RAY_FAR;
    this.playerRay.near = PLAYER_COLLISION_RAY_NEAR;

    this.moveSub
      .pipe(
        throttleTime(20),
        map((event) => this.mapMouseEvent(this, event)),
        tap((targetPos) => {
          if (targetPos) {
            this.targetPos.copy(targetPos);
            this.playerIsMoving = true;
          }
        })
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
    if (
      this.player &&
      this.playerRay &&
      this.targetPos &&
      this.playerBody &&
      this.playerIsMoving
    ) {
      const actualMoveSpeed = delta * this.velocity; // velocity = 10 units
      const playerPos = this.player.position.clone();
      const distanceToTarget = playerPos.distanceTo(this.targetPos);

      this.player.lookAt(this.targetPos.x, playerPos.y, this.targetPos.z);

      this.dirVector
        .subVectors(this.targetPos, playerPos)
        .normalize()
        .multiplyScalar(actualMoveSpeed);

      this.dirVector.y = 0;

      // this.updateRay(this.player.position.clone(), this.dirVector.clone());
      // && !this.isPlayerColliding()

      // this.playerBody.position.copy(this.player.position as any);
      // this.playerBody.quaternion.copy(this.player.quaternion as any);
      this.playerBody.position.copy(this.player.position as any);
      this.playerBody.quaternion.copy(this.player.quaternion as any);

      this.nextPos.copy(this.player.position).add(this.dirVector);

      const nextPosIsCollidinAsIndex = this.WorldState.staticObjects.findIndex(
        (item) => {
          const box = item.box as Box3;

          box
            .copy(item.object.geometry.boundingBox)
            .applyMatrix4(item.object.matrixWorld);

          return box.containsPoint(this.nextPos);
        }
      );

      if (
        distanceToTarget > this.dirVector.length() &&
        nextPosIsCollidinAsIndex === -1
      ) {
        this.playerIsMoving = true;
        this.player.position.add(this.dirVector);
      } else {
        this.playerIsMoving = false;
      }
    }
  }

  mapMouseEvent(_self: PlayerMovementState, event: MouseEvent | null) {
    if (event && _self.player && _self.mainCamera) {
      _self.lastClickedPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      _self.lastClickedPointer.y =
        -(event.clientY / window.innerHeight) * 2 + 1;

      // update the picking ray with the camera and pointer position
      _self.raycaster.setFromCamera(_self.lastClickedPointer, _self.mainCamera);

      // calculate objects intersecting the picking ray
      const intersects = _self.raycaster.intersectObjects(
        _self.SceneState.mainScene.children
      );

      let i = intersects.length;

      while (i--) {
        if (intersects[i].object.userData['isFloor'] === true) {
          const targetPos = new Vector3().copy(intersects[i].point);

          return targetPos;
        }

        if (i <= 0) {
          break;
        }
      }
    }

    return null;
  }

  // private updateRay(origin: Vector3, direction: Vector3) {
  //   direction.subVectors(this.targetPos, origin).normalize();

  //   this.raycaster.set(origin, direction);
  // }

  // private isPlayerColliding(): boolean {
  //   const intersects = this.raycaster.intersectObjects(
  //     this.SceneState.mainScene.children
  //   );

  //   let i = intersects.length;

  //   while (i--) {
  //     if (
  //       intersects[i].object.userData['noIntersect'] !== true &&
  //       intersects[i].object.userData['isFloor'] !== true
  //     ) {
  //       return intersects[i].distance < 0.5;
  //     }

  //     if (i <= 0) {
  //       break;
  //     }
  //   }

  //   return false;
  // }
}
