import { Injectable } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { SceneState } from '@states/scene/scene.state';
import { Vec3 } from 'cannon-es';
import { debounce } from 'lodash-es';
import { Raycaster, Vector2 } from 'three';
import { IPlayerObj } from './player.state';

export enum Speed {
  WALK = 15,
  RUN = 30,
}

@Injectable({
  providedIn: 'root',
})
export class PlayerMovementState {
  private camera = this.CameraState.mainCamera;
  private mainWorld = this.SceneState.mainWorld;
  private raycaster = new Raycaster();
  private postStepHandler?: Function;
  private isMoving = false;

  player?: IPlayerObj;
  playerMaxVelocity = this.kmhourToMsec(Speed.RUN);

  constructor(
    private SceneState: SceneState,
    private CameraState: CamerasState
  ) {}

  initPlayerMovement(player: IPlayerObj) {
    this.player = player;

    document.addEventListener('click', (event: MouseEvent) => {
      this.movePlayerTo(event);
    });

    document.addEventListener('pointerdown', (_) => (this.isMoving = true));
    document.addEventListener('pointerup', (_) => (this.isMoving = false));
    document.addEventListener('pointermove', (event: MouseEvent) => {
      if (this.isMoving) {
        debounce(
          () => {
            this.movePlayerTo(event);
          },
          300,
          {
            leading: true,
            maxWait: 1200,
          }
        );
      }
    });
  }

  movePlayerTo(event: MouseEvent) {
    if (this.player && this.camera) {
      const pointer = new Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      // update the picking ray with the camera and pointer position
      this.raycaster.setFromCamera(pointer, this.camera);

      // // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects(
        this.SceneState.mainScene.children
      );

      let i = intersects.length;

      while (i--) {
        if (intersects[i].object.userData['isFloor'] === true) {
          const toPos = new Vec3().copy(intersects[i].point as any);

          this.moveTo(toPos);
        }

        if (i <= 0) {
          break;
        }
      }
    }
  }

  setMovementSpeed(speed: Speed) {
    return this.kmhourToMsec(speed);
  }

  killMovement() {
    if (this.postStepHandler) {
      this.mainWorld.removeEventListener('postStep', this.postStepHandler);
      this.postStepHandler = undefined;
    }
  }

  private moveTo(toPos: Vec3) {
    if (this.player) {
      const startTime = this.mainWorld.time;
      const fromPos = this.player.body.position.clone();
      const offset = new Vec3();
      const direction = new Vec3();
      toPos.vsub(fromPos, direction);
      const totalLength = direction.length();
      direction.normalize();

      // Kill active movement
      this.killMovement();

      this.postStepHandler = () => {
        if (this.player) {
          // Progress is a number where 0 is at start position and 1 is at end position
          let progress =
            (this.mainWorld.time - startTime) /
            (totalLength / this.playerMaxVelocity);

          if (progress < 1) {
            // Calculate current position
            direction.scale(progress * totalLength, offset);
            fromPos.vadd(offset, this.player.body.position);
          } else {
            // We passed the end position! Stop.
            this.player.body.velocity.set(0, 0, 0);
            this.player.body.position.copy(toPos);
            this.killMovement();
          }
        }
      };

      this.mainWorld.addEventListener('postStep', this.postStepHandler);
    }
  }

  private kmhourToMsec(kmh: number) {
    return kmh * (5 / 18);
  }
}
