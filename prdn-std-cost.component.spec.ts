import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrdnStdCostComponent } from './prdn-std-cost.component';

describe('PrdnStdCostComponent', () => {
  let component: PrdnStdCostComponent;
  let fixture: ComponentFixture<PrdnStdCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrdnStdCostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrdnStdCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
