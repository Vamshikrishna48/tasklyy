import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tasskly.app',
  appName: 'Tasskly',
  webDir: 'dist',
  /* server: {
    androidScheme: 'https',
    url: 'http://192.168.1.109:8080',
    cleartext: true
  }, */
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'LIGHT',
      backgroundColor: '#ffffff'
    },
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;
