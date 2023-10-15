import { enableProdMode, importProvidersFrom, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

import { TimeagoClock, TimeagoDefaultClock, TimeagoDefaultFormatter, TimeagoFormatter } from 'ngx-timeago';

import { GraphQLModule } from '@/graphql.module';
import { AppComponent } from '@/app.component';

import { DecimalPipe } from '@angular/common';
import { WeiPipe } from '@/pipes/wei.pipe';
import { MinBidPipe } from '@/pipes/min-bid.pipe';

import { routes } from '@/routes';

import { environment } from './environments/environment';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { appStateReducer } from '@/state/reducers/app-state.reducer';
import { AppStateEffects } from '@/state/effects/app-state.effect';

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

    provideRouterStore(),
    provideStore({
      appState: appStateReducer,
      router: routerReducer
    }),
    provideEffects([
      AppStateEffects,
    ]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      trace: true,
    }),

    importProvidersFrom(HttpClientModule, GraphQLModule),
  ],
});
