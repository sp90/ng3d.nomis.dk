import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CanvasState } from '@states/canvas/canvas.state';
import { IntersectionState } from '@states/intersection/intersection.state';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas') canvas?: ElementRef<HTMLCanvasElement>;

  constructor(
    private CanvasState: CanvasState,
    private IntersectionState: IntersectionState
  ) {}

  ngAfterViewInit(): void {
    console.log(this.canvas?.nativeElement);

    this.CanvasState.initSceneRenderer(
      this.canvas?.nativeElement as HTMLCanvasElement
    );
  }

  onCanvasClick() {
    this.IntersectionState.onIntersectedClick();
  }
}
