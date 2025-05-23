import { Component, OnInit, Input, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonHeader, IonToolbar, IonButton, IonButtons, IonIcon, IonTitle, IonContent, IonFooter, IonText } from '@ionic/angular/standalone';
import { NgClass } from '@angular/common';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
@Component({
  selector: 'ion-viewer-modal',
  templateUrl: './viewer-modal.component.html',
  styleUrls: ['./viewer-modal.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonHeader,
    IonToolbar,
    IonButton,
    NgClass,
    IonButtons,
    IonIcon,
    IonTitle,
    IonContent,
    IonFooter,
    IonText,
  ],
})
export class ViewerModalComponent implements OnInit {
  @Input() alt?: string = '';
  @Input() scheme?: string = 'auto';
  @Input() slideOptions?: object = {};
  @Input() src!: string;
  @Input() srcFallback?: string = '';
  @Input() srcHighRes?: string = '';
  @Input() swipeToClose?: boolean = true;
  @Input() text?: string = '';
  @Input() title?: string = '';
  @Input() titleSize?: string = '';

  defaultSlideOptions = {
    zoom: {
      enabled: true,
    },
  };

  options = {};

  swipeState = {
    phase: 'init',
    direction: 'none',
    swipeType: 'none',
    startX: 0,
    startY: 0,
    distance: 0,
    distanceX: 0,
    distanceY: 0,
    threshold: 150, // required min distance traveled to be considered swipe
    restraint: 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime: 500, // maximum time allowed to travel that distance
    elapsedTime: 0,
    startTime: 0,
  };

  @ViewChild('swiper') swiperRef: ElementRef | undefined;

  // @ViewChild('sliderRef', { static: true }) slides!: IonSlides;

  constructor(private modalController: ModalController) {
    addIcons({close})
  }

  async ngOnInit() {
    this.options = { ...this.defaultSlideOptions, ...this.slideOptions };
    this.src = this.srcHighRes || this.src;
    this.setStyle();
    this.setScheme(this.scheme);
    this.initSwipeToClose(this.swipeToClose);

    /**
     * Current Workaround
     * See reported bug: https://github.com/ionic-team/ionic/issues/19638#issuecomment-584828315
     * Hint: Comment in '<ion-slide>' in component
     */
  }

  setStyle() {
    const el: HTMLElement | null = document.querySelector('.ion-img-viewer');
    el?.style.setProperty('--height', '100%');
    el?.style.setProperty('--width', '100%');
    el?.style.setProperty('--border-radius', '0');
  }

  setScheme(scheme: string | undefined) {
    if (scheme && scheme === 'auto') {
      return;
    }

    const el: HTMLElement | null = document.querySelector('.ion-img-viewer');

    if (this.scheme === 'light') {
      el?.style.setProperty('--ion-background-color', '#ffffff');
      el?.style.setProperty('--ion-background-color-rgb', '255, 255, 255');
      el?.style.setProperty('--ion-text-color', '#000');
      el?.style.setProperty('--ion-text-color-rgb', '0,0,0');
    }

    if (this.scheme === 'dark') {
      if (el?.classList.contains('ios')) {
        el?.style.setProperty('--ion-background-color', '#000000');
        el?.style.setProperty('--ion-background-color-rgb', '0, 0, 0');
      } else {
        el?.style.setProperty('--ion-background-color', '#121212');
        el?.style.setProperty('--ion-background-color-rgb', '18,18,18');
      }
      el?.style.setProperty('--ion-text-color', '#ffffff');
      el?.style.setProperty('--ion-text-color-rgb', '255,255,255');
    }
  }

  /**
   * @see http://www.javascriptkit.com/javatutors/touchevents3.shtml
   */
  initSwipeToClose(isActive = true) {
    if (!isActive) {
      return;
    }

    const el = document.querySelector('ion-modal');
    el?.addEventListener('mousedown', (event) => this.swipeStart(event), true);
    el?.addEventListener('mousemove', (event) => this.swipeMove(event), true);
    el?.addEventListener('mouseup', () => this.swipeEnd(), true);
    el?.addEventListener('touchstart', (event) => this.swipeStart(event), true);
    el?.addEventListener('touchmove', (event) => this.swipeMove(event), true);
    el?.addEventListener('touchend', () => this.swipeEnd(), true);

    this.modalController.getTop().then((modal) => {
      modal?.onWillDismiss().then(() => {
        document.removeEventListener('mousedown', this.swipeStart, true);
        document.removeEventListener('mousemove', this.swipeMove, true);
        document.removeEventListener('mouseup', this.swipeMove, true);
        document.removeEventListener('touchstart', this.swipeStart, true);
        document.removeEventListener('touchmove', this.swipeMove, true);
        document.removeEventListener('touchend', this.swipeMove, true);
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  swipeStart(event: any) {
    const { pageX, pageY } =
      event.type === 'touchstart' && event?.changedTouches
        ? event.changedTouches[0]
        : event;

    this.swipeState = {
      ...this.swipeState,
      phase: 'start',
      direction: 'none',
      distance: 0,
      startX: pageX,
      startY: pageY,
      startTime: new Date().getTime(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  swipeMove(event: any) {
    const { pageX, pageY } =
      event.type === 'touchmove' && event?.changedTouches
        ? event.changedTouches[0]
        : event;
    // get horizontal dist traveled by finger while in contact with surface
    const distanceX = pageX - this.swipeState.startX;
    // get vertical dist traveled by finger while in contact with surface
    const distanceY = pageY - this.swipeState.startY;
    let direction;
    let distance;

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // if distance traveled horizontally is greater than vertically, consider this a horizontal swipe
      direction = distanceX < 0 ? 'left' : 'right';
      distance = distanceX;
    } else {
      // else consider this a vertical swipe
      direction = distanceY < 0 ? 'up' : 'down';
      distance = distanceY;
    }
    this.swipeState = {
      ...this.swipeState,
      phase: 'move',
      direction,
      distance,
      distanceX,
      distanceY,
    };
    if (event.cancelable) {
      event.preventDefault();
    }
  }

  swipeEnd() {
    if (this.swipeState.phase === 'none') {
      return;
    }
    const {
      allowedTime,
      direction,
      restraint,
      startTime,
      threshold,
      distanceX,
      distanceY,
    } = this.swipeState;
    let swipeType = null;

    const elapsedTime = new Date().getTime() - startTime; // get time elapsed
    if (elapsedTime <= allowedTime) {
      // first condition for a swipe met
      if (
        Math.abs(distanceX) >= threshold &&
        Math.abs(distanceY) <= restraint
      ) {
        // 2nd condition for horizontal swipe met
        swipeType = direction; // set swipeType to either "left" or "right"
      } else if (
        Math.abs(distanceY) >= threshold &&
        Math.abs(distanceX) <= restraint
      ) {
        // 2nd condition for vertical swipe met
        swipeType = direction; // set swipeType to either "top" or "down"
      }
    }

    this.swipeState = {
      ...this.swipeState,
      phase: 'end',
      swipeType: swipeType ?? '',
    };

    if (swipeType === 'down') {
      return this.closeModal();
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
