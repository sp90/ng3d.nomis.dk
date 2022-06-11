import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CamerasState } from '@states/cameras/cameras.state';
import { CanvasState } from '@states/canvas/canvas.state';
import { IntersectionState } from '@states/intersection/intersection.state';
import { PlayerState } from '@states/player/player.state';
import { SceneState } from '@states/scene/scene.state';
import { SelectedObjectState } from '@states/selected-object/selected-object.state';
import { ViewControlsState } from '@states/view-controls/view-controls.state';
import { Vector2, WebGLRenderer } from 'three';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas') canvas?: ElementRef<HTMLCanvasElement>;

  private pointer = new Vector2(0, 0);

  constructor(
    private CanvasState: CanvasState,
    private ViewControlsState: ViewControlsState,
    private IntersectionState: IntersectionState,
    private SelectedObjectState: SelectedObjectState,
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

          window.requestAnimationFrame(tick);
        }
      });

      this.SceneState.addBaseScene();
    }
  }
}
