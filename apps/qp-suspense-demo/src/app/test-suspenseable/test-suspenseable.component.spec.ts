import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSuspenseableComponent } from './test-suspenseable.component';

describe('TestSuspenseableComponent', () => {
  let component: TestSuspenseableComponent;
  let fixture: ComponentFixture<TestSuspenseableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestSuspenseableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestSuspenseableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
