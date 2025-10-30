import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaMasterComponent } from './sla-master.component';

describe('SlaMasterComponent', () => {
  let component: SlaMasterComponent;
  let fixture: ComponentFixture<SlaMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlaMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlaMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
