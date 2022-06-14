import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { CanvasState } from '@states/canvas/canvas.state';
import { PlayerState } from '@states/player/player.state';
import { SceneState } from '@states/scene/scene.state';
import { WebGLRenderer } from 'three';

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

    if (canvas) {
      this.CanvasState.initSceneRenderer(canvas, (renderer: WebGLRenderer) => {
        this.PlayerState.readyPlayer();

        tick();

        function tick() {
          renderer.render(
            _self.SceneState.mainScene,
            _self.CameraState.mainCamera
          );

          // Run the simulation independently of framerate every 1 / 60 ms
          _self.world.fixedStep();
          _self.SceneState.digestWorld();

          if (_self.PlayerState.player?.position) {
            _self.CameraState.setPosRelativeToPlayer(
              _self.PlayerState.player.position
            );
          }

          window.requestAnimationFrame(tick);
        }
      });

      this.SceneState.addBaseScene();
    }
  }
}
