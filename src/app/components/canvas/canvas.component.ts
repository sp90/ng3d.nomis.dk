import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { CanvasState } from '@states/canvas/canvas.state';
import { PlayerState } from '@states/player/player.state';
import { SceneState } from '@states/scene/scene.state';
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
    private SceneState: SceneState
  ) {}

  ngAfterViewInit(): void {
    const _self = this;
    const canvas = this.canvas?.nativeElement as HTMLCanvasElement;

    this.SceneState.addBaseScene();

    if (canvas) {
      this.CanvasState.initSceneRenderer(canvas, (renderer: WebGLRenderer) => {
        this.PlayerState.readyPlayer();

        const stats = Stats();
        document.body.appendChild(stats.dom);

        tick();

        function tick() {
          _self.SceneState.updatePhysics();

          if (_self.PlayerState.player?.model.position) {
            _self.CameraState.setPosRelativeToPlayer(
              _self.PlayerState.player.model.position
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
    }
  }
}
