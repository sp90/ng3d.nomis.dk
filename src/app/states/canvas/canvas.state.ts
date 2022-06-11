import { Injectable } from '@angular/core';
import {
  CamerasState,
  DEFAULT_CAMERA_OPTIONS,
} from '@states/cameras/cameras.state';
import { SceneState } from '@states/scene/scene.state';
import { PCFSoftShadowMap, WebGLRenderer } from 'three';

@Injectable({
  providedIn: 'root',
})
export class CanvasState {
  private renderer?: WebGLRenderer;
  private scene = this.SceneState.mainScene;
  private camera = this.CamerasState.mainCamera;

  canvas?: HTMLCanvasElement;

  constructor(
    private CamerasState: CamerasState,
    private SceneState: SceneState
  ) {}

  initSceneRenderer(canvas: HTMLCanvasElement, animationTick: Function) {
    this.canvas = canvas;
    this.renderer = new WebGLRenderer({
      canvas,
    });

    this.baseRendererSettings(this.renderer);
    this.handleResize(this.renderer);

    animationTick(this.renderer);

    return this.renderer;
  }

  private baseRendererSettings(renderer: WebGLRenderer) {
    renderer.setSize(
      DEFAULT_CAMERA_OPTIONS.width,
      DEFAULT_CAMERA_OPTIONS.height
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.render(this.scene, this.camera);
  }

  private handleResize(renderer: WebGLRenderer) {
    const camera = this.camera;

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }
}
