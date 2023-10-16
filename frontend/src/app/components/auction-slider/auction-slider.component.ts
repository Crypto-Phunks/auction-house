import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';

import SwiperCore, { Virtual, Navigation, SwiperOptions } from 'swiper';
import { SwiperComponent, SwiperModule } from 'swiper/angular';
import { TimeagoModule } from 'ngx-timeago';

import { DataService } from '@/services/data.service';

import { PhunkImageDirective } from '@/directives/phunk-image.directive';

import { GlobalState } from '@/interfaces/global-state';
import { Auction } from '@/interfaces/auction';

import * as actions from '@/state/actions/app-state.action';

SwiperCore.use([Virtual, Navigation]);
@Component({
  standalone: true,
  imports: [
    CommonModule,
    SwiperModule,
    TimeagoModule,

    PhunkImageDirective
  ],
  selector: 'app-auction-slider',
  templateUrl: './auction-slider.component.html',
  styleUrls: ['./auction-slider.component.scss']
})

export class AuctionSliderComponent implements OnChanges {

  @Input() auctionData!: Auction[] | null;
  @Input() currentAuction!: Auction | null;

  @ViewChild('swiper') swiper?: SwiperComponent;
  @ViewChild('prev') prev!: ElementRef;
  @ViewChild('next') next!: ElementRef;

  sliderConfig: SwiperOptions = {
    slidesPerView: 2,
    virtual: true,
    breakpoints: {
      500: { slidesPerView: 3 },
      650: { slidesPerView: 4 },
      700: { slidesPerView: 5 },
      1040: { slidesPerView: 3 },
      1130: { slidesPerView: 4 },
      1250: { slidesPerView: 5 }
    },
    // on: {
    //   slideChange: (swiper) => {}
    // },
  }

  constructor(
    private store: Store<GlobalState>,
    public dataSvc: DataService,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const current = changes['currentAuction']?.currentValue;
    const activeIndex = this.auctionData?.indexOf(current);
    this.swiper?.swiperRef.slideTo((activeIndex ?? 0));
  }

  async goToAuction(auctionId: string): Promise<void> {
    this.router.navigate(['/auction', auctionId]);
  }

  nextSlide(): void {
    this.swiper?.swiperRef.slidePrev();
  }

  prevSlide(): void {
    this.swiper?.swiperRef.slideNext();
  }

  onSlideChange() {
    // console.log(this.swiper);
    // console.log(this.swiper?.activeSlides)
  }

  trackByFn(index: number, item: Auction): string {
    return item.id;
  }

}
