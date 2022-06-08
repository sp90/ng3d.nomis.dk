import { Injectable } from '@angular/core';
import { CanvasState } from '@states/canvas/canvas.state';
import { BoxGeometry, Color, Mesh, MeshStandardMaterial } from 'three';

const DEFAULT_SIZE = {
  width: 1,
  height: 1,
  depth: 1,
};

const DEFAULT_SEGMENTS = {
  width: 1,
  height: 1,
  depth: 1,
};

@Injectable({
  providedIn: 'root',
})
export class BoxService {
  itemIndex = 0;
  startPos = 0;

  constructor(private CanvasState: CanvasState) {}

  addBox(color = 0xff0000, size = DEFAULT_SIZE, segments = DEFAULT_SEGMENTS) {
    const material = new MeshStandardMaterial({ color: new Color(color) });
    const mesh = new Mesh(
      new BoxGeometry(
        size.width,
        size.height,
        size.depth,
        segments.width,
        segments.height,
        segments.depth
      ),
      material
    );

    mesh.position.y = this.startPos;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // TODO - Remove in favour of custom gui based on raycasting
    // this.GuiState.addFolder(
    //   `box-${this.itemIndex}`,
    //   mesh.position,
    //   ['x', 'y', 'z'],
    //   0,
    //   5,
    //   0.2
    // );

    this.startPos += 3;
    this.itemIndex += 1;

    this.CanvasState.addToScene(mesh);
  }

  // addBufferGeometry(color = 0xff0000) {
  //   const geometry = new BufferGeometry();
  //   // create a simple square shape. We duplicate the top left and bottom right
  //   // vertices because each vertex needs to appear once per triangle.
  //   const vertices = new Float32Array([
  //     -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,

  //     1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
  //   ]);

  //   // itemSize = 3 because there are 3 values (components) per vertex
  //   geometry.setAttribute('position', new BufferAttribute(vertices, 3));

  //   const material = new MeshBasicMaterial({ color: new Color(color) });
  //   const mesh = new Mesh(geometry, material);

  //   mesh.position.y = this.startPos;

  //   this.startPos += 3;

  //   this.CanvasState.addToScene(mesh);
  // }
}
