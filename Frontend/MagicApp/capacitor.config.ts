import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.magic.magicHub',
  appName: 'MagicHub',
  webDir: 'www',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#3f51b5',
      style: 'DARK'
    }
  },
  android: {
    allowMixedContent: false
  }
};

export default config;