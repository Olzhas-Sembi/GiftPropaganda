// Telegram WebApp API для React
class TelegramWebAppClass {
  private webApp: any = null;

  init() {
    // Проверяем, что мы внутри Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.webApp.ready();
      this.webApp.expand();

      // Устанавливаем цветовую схему только если поддерживается
      try {
        if (this.webApp.setHeaderColor) {
          this.webApp.setHeaderColor('secondary_bg_color');
        }
        if (this.webApp.setBackgroundColor) {
          this.webApp.setBackgroundColor('bg_color');
        }
      } catch (e) {
        console.log('Color methods not supported in this version');
      }

      console.log('Telegram WebApp инициализирован');
    } else {
      console.log('Telegram WebApp не доступен (разработка)');
    }
  }

  getThemeParams() {
    if (this.webApp?.themeParams) {
      return this.webApp.themeParams;
    }

    // Дефолтная светлая тема для разработки
    return {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#007AFF',
      button_color: '#007AFF',
      button_text_color: '#ffffff',
      secondary_bg_color: '#f8f9fa',
      destructive_text_color: '#ff3b30'
    };
  }

  triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'selection_change' = 'light') {
    // Проверяем поддержку HapticFeedback
    if (this.webApp?.HapticFeedback) {
      try {
        switch (type) {
          case 'light':
            this.webApp.HapticFeedback.impactOccurred('light');
            break;
          case 'medium':
            this.webApp.HapticFeedback.impactOccurred('medium');
            break;
          case 'heavy':
            this.webApp.HapticFeedback.impactOccurred('heavy');
            break;
          case 'selection_change':
            this.webApp.HapticFeedback.selectionChanged();
            break;
        }
      } catch (e) {
        console.log('HapticFeedback not supported in this version');
      }
    }
  }

  showAlert(message: string) {
    if (this.webApp?.showAlert) {
      this.webApp.showAlert(message);
    } else {
      // eslint-disable-next-line no-alert
      alert(message);
    }
  }

  showConfirm(message: string, callback: (confirmed: boolean) => void) {
    if (this.webApp?.showConfirm) {
      this.webApp.showConfirm(message, callback);
    } else {
      // eslint-disable-next-line no-restricted-globals
      callback(confirm(message));
    }
  }

  openLink(url: string) {
    if (this.webApp?.openLink) {
      this.webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  close() {
    if (this.webApp?.close) {
      this.webApp.close();
    }
  }

  getUser() {
    return this.webApp?.initDataUnsafe?.user || null;
  }

  isExpanded() {
    return this.webApp?.isExpanded || false;
  }

  getViewportHeight() {
    return this.webApp?.viewportHeight || window.innerHeight;
  }

  onThemeChanged(callback: () => void) {
    if (this.webApp) {
      this.webApp.onEvent('themeChanged', callback);
    }
  }

  onViewportChanged(callback: () => void) {
    if (this.webApp) {
      this.webApp.onEvent('viewportChanged', callback);
    }
  }
}

const TelegramWebApp = new TelegramWebAppClass();

export default TelegramWebApp;
