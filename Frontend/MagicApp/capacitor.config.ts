import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.magic.magicHub',
  appName: 'MagicHub',
  webDir: 'www',
  plugins: {},
  android: {
    allowMixedContent: false
  }
};

export default config;
