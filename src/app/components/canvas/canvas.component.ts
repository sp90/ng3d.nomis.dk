import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { CanvasState } from '@states/canvas/canvas.state';
import { PlayerMovementState } from '@states/player/player-movement.state';
import { PlayerState } from '@states/player/player.state';
import { SceneState } from '@states/scene/scene.state';
import { WorldState } from '@states/world/world.state';
import CannonDebugger from 'cannon-es-debugger';
import { Clock, WebGLRenderer } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas') canvas?: ElementRef<HTMLCanvasElement>;

  constructor(
    private CanvasState: CanvasState,
    private CameraState: CamerasState,
    private PlayerState: PlayerState,
    private PlayerMovementState: PlayerMovementState,
    private WorldState: WorldState,
    private SceneState: SceneState
  ) {}

  ngAfterViewInit(): void {
    const _self = this;
    const canvas = this.canvas?.nativeElement as HTMLCanvasElement;
    const clock = new Clock();

    const cannonDebugger = CannonDebugger(
      this.SceneState.mainScene,
      this.WorldState.mainWorld
    );

    if (canvas) {
      this.CanvasState.initSceneRenderer(canvas, (renderer: WebGLRenderer) => {
        this.PlayerState.readyPlayer(clock);

        const stats = Stats();
        document.body.appendChild(stats.dom);

        tick();

        function tick() {
          const deltaTime = clock.getDelta();

          _self.PlayerMovementState.tick(deltaTime);
          _self.WorldState.tick();
          cannonDebugger.update();

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
