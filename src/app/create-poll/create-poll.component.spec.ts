import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPollComponent } from './create-poll.component';

describe('NewPollComponent', () => {
  let component: NewPollComponent;
  let fixture: ComponentFixture<NewPollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPollComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewPollComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
