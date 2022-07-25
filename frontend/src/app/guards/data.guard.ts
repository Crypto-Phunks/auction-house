import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';

import { map, Observable, tap } from 'rxjs';

import { DataService } from '../services/data.service';

@Injectable({
  providedIn: 'root'
})

export class DataGuard implements CanActivate {

  constructor(
    private dataSvc: DataService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
}
