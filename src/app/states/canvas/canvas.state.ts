import { Injectable } from '@angular/core';
import { ActionControlsState } from '@states/action-controls/action-controls.state';
import { IntersectionState } from '@states/intersection/intersection.state';
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface ISceneInitOptions {
  fov: number;
  width: number;
  height: number;
  near: number;
  far: number;
}

export interface ICameraPosObj {
  x?: number;
  y?: number;
  z?: number;
}

const SCENE_INIT_DEFAULT_OPTIONS: ISceneInitOptions = {
  fov: 75,
  width: window.innerWidth,
  height: window.innerHeight,
  near: 0.1,
  far: 2000,
};

@Injectable({
  providedIn: 'root',
})
export class CanvasState {
  private pointer = new Vector2(0, 0);
  private renderer?: WebGLRenderer;
  private controls?: OrbitControls;
  private raycaster = new Raycaster();
  private scene = new Scene();
  private camera = new PerspectiveCamera(
    SCENE_INIT_DEFAULT_OPTIONS.fov,
    SCENE_INIT_DEFAULT_OPTIONS.width / SCENE_INIT_DEFAULT_OPTIONS.height,
    SCENE_INIT_DEFAULT_OPTIONS.near,
    SCENE_INIT_DEFAULT_OPTIONS.far
  );

  constructor(
    private IntersectionState: IntersectionState,
    private ActionControlsState: ActionControlsState
  ) {}

  initSceneRenderer(canvas: HTMLCanvasElement) {
    /**
     * Needs to be moved:
     */
    const _self = this;
    const ambientLight = new AmbientLight(0x505050);
    // const axesHelper = new AxesHelper(10);
    const directionalLight = this.addDirLight();
    const plane = this.addBasePlane();

    this.camera.position.z = 8;
    this.camera.position.y = 8;
    this.camera.position.x = 8;
    this.camera.lookAt(plane.position);
    this.scene.background = new Color(0x3333ff);

    // this.addToScene(axesHelper);
    this.addToScene(plane);
    this.addToScene(directionalLight);
    this.addToScene(ambientLight);
    this.addToScene(this.camera);

    this.renderer = new WebGLRenderer({
      canvas,
    });

    // this.pointer = new Vector2();
    this.baseRendererSettings(this.renderer);
    this.handleResize(this.renderer);
    this.initFrameRate(this.renderer);

    this.controls = this.ActionControlsState.initControls(this.camera, canvas);

    document.addEventListener('mousemove', (event: MouseEvent) => {
      _self.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      _self.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      _self.IntersectionState.raycasterCheckIntersects(
        _self.raycaster,
        _self.pointer,
        _self.camera,
        _self.scene
      );
    });
  }

  addToScene(object: Object3D) {
    console.log(object);

    this.camera.lookAt(object.position);
    this.scene.add(object);
  }

  updateCameraPosition(obj: ICameraPosObj) {
    if (this.camera) {
      obj.x && (this.camera.position.x = obj.x);
      obj.y && (this.camera.position.y = obj.y);
      obj.z && (this.camera.position.z = obj.z);
    }
  }

  private baseRendererSettings(renderer: WebGLRenderer) {
    renderer.setSize(
      SCENE_INIT_DEFAULT_OPTIONS.width,
      SCENE_INIT_DEFAULT_OPTIONS.height
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.render(this.scene, this.camera);
  }

  private addBasePlane() {
    const planeMaterial = new MeshStandardMaterial({ color: '0x999999' });
    const planeGeometry = new PlaneGeometry(100, 100, 100, 100);
    const plane = new Mesh(planeGeometry, planeMaterial);

    plane.position.y = -0.5;
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    plane.userData = {
      noIntersect: true,
    };

    return plane;
  }

  private addDirLight() {
    const directionalLight = new DirectionalLight(0xffffff, 0.5);

    directionalLight.position.set(4, 6, 3);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.intensity = 0.4;
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 1500;

    return directionalLight;
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

  private initFrameRate(renderer: WebGLRenderer) {
    const controls = this.controls;
    const scene = this.scene;
    const camera = this.camera;

    tick();

    function tick() {
      controls?.update();
      camera.updateMatrixWorld();

      renderer.render(scene, camera);

      window.requestAnimationFrame(tick);
    }
  }

  onCanvasClick() {
    this.IntersectionState.onIntersectedClick();
  }
}
