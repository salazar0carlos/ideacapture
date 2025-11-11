import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.ideacapture',
  appName: 'IdeaCapture',
  webDir: 'out',
  server: {
    // For development: point to your local dev server
    // For production: point to your deployed URL
    url: process.env.CAPACITOR_SERVER_URL || 'http://localhost:3000',
    cleartext: true, // Allow HTTP for local development
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
  android: {
    allowMixedContent: true, // Allow HTTP for local development
    backgroundColor: '#0A0A0F',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A0A0F',
      showSpinner: false,
    },
  },
};

export default config;
