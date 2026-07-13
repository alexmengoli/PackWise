import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { LibraryPage } from './pages/library/library.page';
import { PrivacyPage } from './pages/privacy/privacy.page';
import { SettingsPage } from './pages/settings/settings.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'library',
    component: LibraryPage,
  },
  {
    path: 'settings',
    component: SettingsPage,
  },
  {
    path: 'docs/privacy',
    component: PrivacyPage,
  },
];
