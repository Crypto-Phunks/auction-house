import { Injectable } from '@angular/core';
import { Theme } from '@/interfaces/global-state';

interface ThemeConfig {
  '--background': string;
  '--text-color': string;
};

export type ThemesConfig = {
  [key in Theme]: ThemeConfig;
};

@Injectable({
  providedIn: 'root'
})

export class ThemeService {

  themeStyles: ThemesConfig = {
    dark: {
      '--background': '19, 20, 21',
      '--text-color': '255, 255, 255',
    },
    light: {
      '--background': '255, 255, 255',
      '--text-color': '0, 0, 0',
    }
  };

  setTheme(theme: Theme | null) {
    if (!theme) {
      console.warn('No theme provided');
      return;
    }

    const styles = this.themeStyles[theme];
    (Object.keys(styles) as Array<keyof ThemeConfig>).forEach((property: keyof ThemeConfig) => {
      document.documentElement.style.setProperty(
        property,
        styles[property]
      );
    });

    document.body.dataset['theme'] = theme;
    localStorage.setItem('mode', theme);
  }

}
