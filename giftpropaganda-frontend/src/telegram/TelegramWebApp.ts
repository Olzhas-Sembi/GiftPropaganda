// Telegram Web App SDK интеграция
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        requestWriteAccess: (callback?: (granted: boolean) => void) => void;
        requestContact: (callback?: (granted: boolean, contact?: any) => void) => void;
      };
    };
  }
}

export class TelegramWebApp {
  private static instance: TelegramWebApp;
  public webApp: any;

  private constructor() {
    this.webApp = window.Telegram?.WebApp;
    if (this.webApp) {
      this.webApp.ready();
      this.webApp.expand();
    }
  }

  public static getInstance(): TelegramWebApp {
    if (!TelegramWebApp.instance) {
      TelegramWebApp.instance = new TelegramWebApp();
    }
    return TelegramWebApp.instance;
  }

  public isAvailable(): boolean {
    return !!this.webApp;
  }

  public getTheme() {
    if (!this.webApp) return { colorScheme: 'light', themeParams: {} };

    return {
      colorScheme: this.webApp.colorScheme || 'light',
      themeParams: this.webApp.themeParams || {}
    };
  }

  public getUserData() {
    if (!this.webApp?.initDataUnsafe) return null;

    return {
      user: this.webApp.initDataUnsafe.user,
      chat: this.webApp.initDataUnsafe.chat,
      start_param: this.webApp.initDataUnsafe.start_param
    };
  }

  public showMainButton(text: string, callback: () => void) {
    if (!this.webApp?.MainButton) return;

    this.webApp.MainButton.text = text;
    this.webApp.MainButton.show();
    this.webApp.MainButton.onClick(callback);
  }

  public hideMainButton() {
    if (!this.webApp?.MainButton) return;
    this.webApp.MainButton.hide();
  }

  public hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (!this.webApp?.HapticFeedback) return;
    this.webApp.HapticFeedback.impactOccurred(type);
  }

  public showAlert(message: string) {
    if (!this.webApp?.showAlert) {
      alert(message);
      return;
    }
    this.webApp.showAlert(message);
  }

  public openLink(url: string) {
    if (!this.webApp?.openLink) {
      window.open(url, '_blank');
      return;
    }
    this.webApp.openLink(url);
  }

  public close() {
    if (!this.webApp?.close) return;
    this.webApp.close();
  }
}

export default TelegramWebApp.getInstance();
