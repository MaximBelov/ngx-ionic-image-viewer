import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewerModalComponent } from './viewer-modal.component';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ViewerModalComponent', () => {
  let component: ViewerModalComponent;
  let fixture: ComponentFixture<ViewerModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [provideIonicAngular()],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
