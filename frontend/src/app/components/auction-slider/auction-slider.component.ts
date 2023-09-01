import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from 'src/app/services/data.service';
import { StateService } from 'src/app/services/state.service';

import { Auction } from 'src/app/interfaces/auction';

import { BigNumber } from 'ethers';

import SwiperCore, { Virtual, Navigation, SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
SwiperCore.use([Virtual, Navigation]);

@Component({
  selector: 'app-auction-slider',
  templateUrl: './auction-slider.component.html',
  styleUrls: ['./auction-slider.component.scss']
})

export class AuctionSliderComponent implements OnInit, AfterViewInit, OnChanges {

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
    }
  }

  constructor(
    private stateSvc: StateService,
    public dataSvc: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    const current = changes['currentAuction']?.currentValue;
    const activeIndex = this.auctionData?.indexOf(current);
    this.swiper?.swiperRef.slideTo((activeIndex ?? 0) + 1);
  }

  async goToAuction(auctionId: string): Promise<void> {
    const auctionIdBN = BigNumber.from(auctionId);
    const { auctionIndex } = await this.stateSvc.getAuctionIndexAndData(auctionIdBN);
    if (auctionIndex === 0) this.router.navigate(['/']);
    else if (auctionIndex > -1) this.router.navigate(['/auction', auctionId]);
    else this.router.navigate(['/']);
  }

  nextSlide(): void {
    this.swiper?.swiperRef.slidePrev();
  }

  prevSlide(): void {
    this.swiper?.swiperRef.slideNext();
  }

  onSlideChange() {
    // console.log(this.swiper)
  }

}
