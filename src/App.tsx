import React, { useState, useRef, useEffect } from 'react';
import { Share } from '@capacitor/share';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Dialog } from '@capacitor/dialog';
import * as htmlToImage from 'html-to-image';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FaClock, FaBell, FaShareAlt, FaCamera } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";

import './App.css';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentTime) {
        getCurrentTime();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentTime]);

  const getCurrentTime = (): string => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    setCurrentTime(timeString);
    return timeString;
  };

  const showTimeNotification = async (): Promise<void> => {
    const timeString = getCurrentTime();
    setIsAnimating(true);

    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Thời gian hiện tại",
          body: timeString,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) }
        }
      ]
    });

    setTimeout(() => setIsAnimating(false), 1000);
  };

  const shareCurrentTime = async (): Promise<void> => {
    const timeString = getCurrentTime();
    setIsAnimating(true);

    try {
      await Share.share({
        title: 'Thời gian hiện tại',
        text: `⏰ Bây giờ là: ${timeString}`,
        dialogTitle: 'Chia sẻ thời gian'
      });
    } catch (error) {
      await Dialog.alert({
        title: 'Lỗi',
        message: 'Không thể chia sẻ: ' + (error as Error).message,
      });
    }

    setTimeout(() => setIsAnimating(false), 1000);
  };

  const takeScreenshot = async (): Promise<void> => {
    if (!appRef.current) return;
    setIsAnimating(true);

    try {
      const dataUrl = await htmlToImage.toPng(appRef.current);

      const fileName = `screenshot-${Date.now()}.png`;
      const base64Data = dataUrl.split(',')[1];

      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      const fileUri = await Filesystem.getUri({
        directory: Directory.Cache,
        path: fileName,
      });

      await Share.share({
        title: 'Ảnh chụp ứng dụng',
        text: 'Đây là ảnh chụp ứng dụng hiển thị thời gian',
        url: fileUri.uri,
        dialogTitle: 'Chia sẻ ảnh chụp'
      });
    } catch (error) {
      await Dialog.alert({
        title: 'Lỗi',
        message: 'Không thể chụp màn hình: ' + (error as Error).message,
      });
    }

    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <div className={`app ${isAnimating ? 'pulse-effect' : ''}`} ref={appRef}>
      <div className="header">
        <FaClock className="header-icon" />
        <h1>Hiển Thị Thời Gian</h1>
      </div>

      <div className="time-display">
        <MdAccessTime className="time-icon" />
        <div className="time-text">
          {currentTime || 'Nhấn nút để xem thời gian'}
        </div>
      </div>

      <div className="button-group">
        <button onClick={getCurrentTime} className="time-button">
          <FaClock className="button-icon" />
          <span>Hiển thị thời gian</span>
        </button>
        <button onClick={showTimeNotification} className="notify-button">
          <FaBell className="button-icon" />
          <span>Thông báo</span>
        </button>
        <button onClick={shareCurrentTime} className="share-button">
          <FaShareAlt className="button-icon" />
          <span>Chia sẻ</span>
        </button>
        <button onClick={takeScreenshot} className="screenshot-button">
          <FaCamera className="button-icon" />
          <span>Chụp màn hình</span>
        </button>
      </div>
    </div>
  );
};

export default App;