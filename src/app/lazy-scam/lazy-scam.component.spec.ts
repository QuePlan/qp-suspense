import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LazyScamComponent } from './lazy-scam.component';

describe('LazyScamComponent', () => {
  let component: LazyScamComponent;
  let fixture: ComponentFixture<LazyScamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LazyScamComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LazyScamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
