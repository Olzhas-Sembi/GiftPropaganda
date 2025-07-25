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

  expand() {
    if (this.webApp && this.webApp.expand) {
      this.webApp.expand();
    }
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
      } else if (type === 'notification') {
        this.webApp.HapticFeedback.notificationOccurred('success');
      }
    }
  }

  showPopup(title: string, message: string, buttons?: any[]) {
    if (this.webApp && this.webApp.showPopup) {
      return this.webApp.showPopup({
        title,
        message,
        buttons: buttons || [{ type: 'ok' }]
      });
    }
  }

  close() {
    if (this.webApp && this.webApp.close) {
      this.webApp.close();
    }
  }

  openLink(url: string) {
    if (this.webApp && this.webApp.openLink) {
      this.webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  setMainButton(text: string, callback?: () => void) {
    if (this.webApp && this.webApp.MainButton) {
      this.webApp.MainButton.text = text;
      this.webApp.MainButton.show();

      if (callback) {
        this.webApp.MainButton.onClick(callback);
      }
    }
  }

  hideMainButton() {
    if (this.webApp && this.webApp.MainButton) {
      this.webApp.MainButton.hide();
    }
  }
}

// Создаем единственный экземпляр
const telegramWebApp = new TelegramWebApp();

export default telegramWebApp;
