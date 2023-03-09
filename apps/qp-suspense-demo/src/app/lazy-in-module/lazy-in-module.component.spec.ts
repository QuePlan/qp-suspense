import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LazyInModuleComponent } from './lazy-in-module.component';

describe('LazyInModuleComponent', () => {
  let component: LazyInModuleComponent;
  let fixture: ComponentFixture<LazyInModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LazyInModuleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LazyInModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
