import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

// Routing
import { AppRoutingModule } from './app-routing.module';

// GraphQL Module
import { GraphQLModule } from './graphql.module';

// Vendor Modules
import { CountdownModule } from 'ngx-countdown';
import { SwiperModule } from 'swiper/angular';
import { TimeagoModule } from 'ngx-timeago';

// Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { PhunkInfoComponent } from './components/phunk-info/phunk-info.component';

// Auction Components
import { AuctionComponent } from './routes/auction/auction.component';
import { BidHistoryComponent } from './components/bid-history/bid-history.component';
import { BidComponent } from './components/bid/bid.component';
import { AuctionSliderComponent } from './components/auction-slider/auction-slider.component';
import { TimerComponent } from './components/timer/timer.component';

// Directives
import { EthAddressDirective } from './directives/eth-address.directive';
import { PhunkImageDirective } from './directives/phunk-image.directive';
import { TippyDirective } from './directives/tippy.directive';

// Pipes
import { WeiPipe } from './pipes/wei.pipe';
import { MinBidPipe } from './pipes/min-bid.pipe';
import { DecimalPipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AuctionComponent,
    EthAddressDirective,
    WeiPipe,
    BidHistoryComponent,
    BidComponent,
    PhunkInfoComponent,
    PhunkImageDirective,
    TippyDirective,
    AuctionSliderComponent,
    TimerComponent,
    MinBidPipe,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    GraphQLModule,
    CountdownModule,
    SwiperModule,
    TimeagoModule.forRoot()
  ],
  providers: [
    WeiPipe,
    DecimalPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
