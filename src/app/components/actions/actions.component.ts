import { Component, OnInit } from '@angular/core';
import { BoxService } from '@services/box/box.service';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
})
export class ActionsComponent implements OnInit {
  constructor(private BoxService: BoxService) {}

  ngOnInit(): void {}

  addBox() {
    this.BoxService.addBox();
  }
}
