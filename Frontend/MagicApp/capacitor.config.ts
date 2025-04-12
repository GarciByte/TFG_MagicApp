import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.magic.magicHub',
  appName: 'MagicHub',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {},
  android: {
    allowMixedContent: true
  }
};

export default config;
