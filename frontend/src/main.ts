import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { TimeagoClock, TimeagoDefaultClock, TimeagoDefaultFormatter, TimeagoFormatter } from 'ngx-timeago';

import { GraphQLModule } from '@/graphql.module';
import { AppComponent } from '@/app.component';

import { DecimalPipe } from '@angular/common';
import { WeiPipe } from '@/pipes/wei.pipe';
import { MinBidPipe } from '@/pipes/min-bid.pipe';

import { routes } from '@/routes';

import { environment } from './environments/environment';

import { provideServiceWorker } from '@angular/service-worker';

if (environment.production) enableProdMode();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: TimeagoFormatter, useClass: TimeagoDefaultFormatter },
    { provide: TimeagoClock, useClass: TimeagoDefaultClock },
    { provide: WeiPipe, useClass: WeiPipe },
    { provide: MinBidPipe, useClass: MinBidPipe },
    { provide: DecimalPipe, useClass: DecimalPipe },
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideServiceWorker('firebase-messaging-sw.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    importProvidersFrom(HttpClientModule, GraphQLModule),
  ],
});
