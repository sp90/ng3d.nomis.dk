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

/**
 * Investigate how to use cannon-es to move the character around
 */
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

  // direction = new Vec3();
  // target = new Vec3();

  nextPos = new Vector3();
  // velocity = new Vector3();
  mouseIsDown = false;
  playerIsMoving = false;
  fixedSpeed = 10;

  playerRay = new Raycaster();
  clock?: Clock;
  player?: Group;
  playerBox?: Box3;
  playerBody?: Body;

  constructor(
    private SceneState: SceneState,
    private CameraState: CamerasState,
    private WorldState: WorldState
  ) {}

  initPlayerMovement(
    clock: Clock,
    player: Group,
    playerBox: Box3,
    playerBody: Body
  ) {
    this.clock = clock;
    this.player = player;
    this.playerBox = playerBox;
    this.playerBody = playerBody;
    this.playerRay.far = PLAYER_COLLISION_RAY_FAR;
    this.playerRay.near = PLAYER_COLLISION_RAY_NEAR;

    this.moveSub
      .pipe(
        throttleTime(20),
        map((event) => this.mapMouseEvent(this, event)),
        throttleTime(20),
        tap(() => (this.playerIsMoving = true))
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
      this.playerBox &&
      this.playerBody &&
      this.playerIsMoving
    ) {
      const velocity = 10;
      const actualMoveSpeed = delta * velocity;
      const playerPos = this.player.position.clone();
      const distanceToTarget = playerPos.distanceTo(this.targetPos);

      this.player.lookAt(this.targetPos.x, 0, this.targetPos.z);
      this.dirVector
        .subVectors(this.targetPos, playerPos)
        .normalize()
        .multiplyScalar(actualMoveSpeed);

      this.dirVector.y = 0;

      if (distanceToTarget > this.dirVector.length()) {
        this.playerIsMoving = true;
        this.player.position.add(this.dirVector);
        this.playerBody.position.copy(this.player.position as any);
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
          this.targetPos.copy(intersects[i].point);

          // this.target.set(intersects[i].point.x, 0, intersects[i].point.z);
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
