import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { CanvasState } from '@states/canvas/canvas.state';
import { PlayerMovementState } from '@states/player/player-movement.state';
import { PlayerState } from '@states/player/player.state';
import { SceneState } from '@states/scene/scene.state';
import { update } from '@tweenjs/tween.js';
import { WebGLRenderer } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas') canvas?: ElementRef<HTMLCanvasElement>;

  world = this.SceneState.mainWorld;

  constructor(
    private CanvasState: CanvasState,
    private CameraState: CamerasState,
    private PlayerState: PlayerState,
    private PlayerMovementState: PlayerMovementState,
    private SceneState: SceneState
  ) {}

  ngAfterViewInit(): void {
    const _self = this;
    const canvas = this.canvas?.nativeElement as HTMLCanvasElement;

    if (canvas) {
      this.CanvasState.initSceneRenderer(canvas, (renderer: WebGLRenderer) => {
        this.PlayerState.readyPlayer();

        const stats = Stats();
        document.body.appendChild(stats.dom);

        tick();

        function tick() {
          // Animation tween
          update();

          _self.SceneState.digestObjects();
          _self.world.fixedStep();

          if (_self.PlayerState.player?.position) {
            _self.CameraState.setPosRelativeToPlayer(
              _self.PlayerState.player.position
            );
          }

          stats.update();
          renderer.render(
            _self.SceneState.mainScene,
            _self.CameraState.mainCamera
          );

          window.requestAnimationFrame(tick);
        }
      });

      this.SceneState.addBaseScene();
    }
  }

  // checkStaticCollision(bbPlayer: Box3) {
  //   const staticObjects = this.SceneState.sceneStaticObjects;
  //   let i = staticObjects.length;
  //   let foundIntersect = false;

  //   while (i--) {
  //     if (staticObjects[i].bbox.intersectsBox(bbPlayer)) {
  //       foundIntersect = true;
  //       break;
  //     }

  //     if (i <= 0) {
  //       break;
  //     }
  //   }

  //   return foundIntersect;
  // }
}
