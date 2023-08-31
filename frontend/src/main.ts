import { enableProdMode, importProvidersFrom, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';

import { GraphQLModule } from '@/graphql.module';
import { TimeagoClock, TimeagoDefaultClock, TimeagoDefaultFormatter, TimeagoFormatter } from 'ngx-timeago';

import { AppComponent } from '@/app.component';
import { routes } from '@/routes';

import { WeiPipe } from '@/pipes/wei.pipe';
import { MinBidPipe } from '@/pipes/min-bid.pipe';

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
    importProvidersFrom(HttpClientModule, GraphQLModule),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
        // enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    })
]
});
