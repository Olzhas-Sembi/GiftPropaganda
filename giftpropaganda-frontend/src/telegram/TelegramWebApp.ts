// Telegram WebApp API для React
class TelegramWebApp {
  private webApp: any = null;

  init() {
    // Проверяем, что мы внутри Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.webApp.ready();
      this.webApp.expand();

      // Настройка темы
      this.webApp.setHeaderColor('#1a1a1a');
      this.webApp.setBackgroundColor('#1a1a1a');

      console.log('Telegram WebApp инициализирован');
    } else {
      console.log('Telegram WebApp недоступен - работаем в браузере');
    }
  }

  isAvailable(): boolean {
    return this.webApp !== null;
  }

  getThemeParams() {
    if (this.webApp) {
      return this.webApp.themeParams;
    }
    return {
      bg_color: '#1a1a1a',
      text_color: '#ffffff',
      hint_color: '#999999',
      link_color: '#0088cc',
      button_color: '#0088cc',
      button_text_color: '#ffffff'
    };
  }

  getUserData() {
    if (this.webApp && this.webApp.initDataUnsafe) {
      return this.webApp.initDataUnsafe.user;
    }
    return null;
  }

  triggerHapticFeedback(type: 'impact' | 'notification' = 'impact') {
    if (this.webApp && this.webApp.HapticFeedback) {
      if (type === 'impact') {
        this.webApp.HapticFeedback.impactOccurred('light');
      } else {
        this.webApp.HapticFeedback.notificationOccurred('success');
      }
    }
  }

  showAlert(message: string) {
    if (this.webApp) {
      this.webApp.showAlert(message);
    } else {
      alert(message);
    }
  }

  showConfirm(message: string, callback: (confirmed: boolean) => void) {
    if (this.webApp) {
      this.webApp.showConfirm(message, callback);
    } else {
      const confirmed = window.confirm(message);
      callback(confirmed);
    }
  }

  openLink(url: string) {
    if (this.webApp) {
      this.webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  close() {
    if (this.webApp) {
      this.webApp.close();
    }
  }

  setMainButton(params: {
    text: string;
    color?: string;
    isVisible?: boolean;
    onClick?: () => void;
  }) {
    if (this.webApp && this.webApp.MainButton) {
      const { text, color = '#0088cc', isVisible = true, onClick } = params;

      this.webApp.MainButton.setText(text);
      this.webApp.MainButton.color = color;

      if (onClick) {
        this.webApp.MainButton.onClick(onClick);
      }

      if (isVisible) {
        this.webApp.MainButton.show();
      } else {
        this.webApp.MainButton.hide();
      }
    }
  }

  hideMainButton() {
    if (this.webApp && this.webApp.MainButton) {
      this.webApp.MainButton.hide();
    }
  }
}

export default new TelegramWebApp();
