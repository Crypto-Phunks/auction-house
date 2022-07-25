import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ThemeService {

  private theme = new BehaviorSubject<any>(localStorage.getItem('mode') || 'light');
  theme$ = this.theme.asObservable();

  constructor() {

    const themeStyles: any = {
      dark: {
        '--background': '19, 20, 21',
        '--text-color': '255, 255, 255',
      },
      light: {
        '--background': '255, 255, 255',
        '--text-color': '0, 0, 0',
      }
    }

    this.theme$.subscribe((res: any) => {
      // console.log(res);
      this.setThemeStyles(res, themeStyles[res]);
    });
  }

  setThemeStyles(theme: string, themeStyles: any) {
    Object.keys(themeStyles).map((property) => {
      document.documentElement.style.setProperty(
        property,
        themeStyles[property]
      );
    });
    document.body.dataset['theme'] = theme;
  }

  setTheme(value: string, temporary?: boolean) {
    this.theme.next(value);
    if (!temporary) localStorage.setItem('mode', value);
  }

}