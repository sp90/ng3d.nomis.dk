import { Component, HostListener } from '@angular/core';
import { IntersectionState } from '@states/intersection/intersection.state';
import { SelectedObjectState } from '@states/selected-object/selected-object.state';
import { tap } from 'rxjs';
import { Object3D } from 'three';

@Component({
  selector: 'app-selected-object',
  templateUrl: './selected-object.component.html',
  styleUrls: ['./selected-object.component.scss'],
})
export class SelectedObjectComponent {
  selectedObj: Object3D | null = null;
  selectedObj$ = this.SelectedObjectState.selectedObj$.pipe(
    tap((o) => {
      if (o === null) {
        this.IntersectionState.setIntersectedState(
          'focus',
          false,
          this.selectedObj
        );
      }

      this.selectedObj = o;
    })
  );

  constructor(
    private SelectedObjectState: SelectedObjectState,
    private IntersectionState: IntersectionState
  ) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.selectedObj) {
      if (event.key === 'ArrowDown') {
        this.selectedObj.position.x += 1;
      }

      if (event.key === 'ArrowUp') {
        this.selectedObj.position.x -= 1;
      }

      if (event.key === 'ArrowLeft') {
        this.selectedObj.position.z += 1;
      }

      if (event.key === 'ArrowRight') {
        this.selectedObj.position.z -= 1;
      }

      if (event.key === 'Escape') {
        this.SelectedObjectState.removeSelectedObj();
      }
    }
  }
}
