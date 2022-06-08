import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedObjectComponent } from './selected-object.component';

describe('SelectedObjectComponent', () => {
  let component: SelectedObjectComponent;
  let fixture: ComponentFixture<SelectedObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectedObjectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
