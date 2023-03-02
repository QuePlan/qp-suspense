import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotLazyEventdrivenComponent } from './not-lazy-eventdriven.component';

describe('NotLazyEventdrivenComponent', () => {
  let component: NotLazyEventdrivenComponent;
  let fixture: ComponentFixture<NotLazyEventdrivenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotLazyEventdrivenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotLazyEventdrivenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
