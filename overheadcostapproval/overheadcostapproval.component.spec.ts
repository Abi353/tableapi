import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverheadcostapprovalComponent } from './overheadcostapproval.component';

describe('OverheadcostapprovalComponent', () => {
  let component: OverheadcostapprovalComponent;
  let fixture: ComponentFixture<OverheadcostapprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverheadcostapprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverheadcostapprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
