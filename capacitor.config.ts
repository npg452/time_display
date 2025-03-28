import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.timeapp',
  appName: 'Hiển Thị Thời Gian',
  webDir: 'build',
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_clock",
      iconColor: "#3498db",
    },
  },
};

export default config;