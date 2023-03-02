import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LazyStandaloneComponent } from './lazy-standalone.component';

describe('LazyStandaloneComponent', () => {
  let component: LazyStandaloneComponent;
  let fixture: ComponentFixture<LazyStandaloneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LazyStandaloneComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LazyStandaloneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
