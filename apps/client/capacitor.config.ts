import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.mxapps.packwise',
  appName: 'Packwise',
  webDir: 'dist/client/browser',
  android: {
    path: 'android',
  },
};

export default config;
