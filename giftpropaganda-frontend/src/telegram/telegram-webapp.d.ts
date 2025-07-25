// Типы для Telegram WebApp API
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void;
        expand(): void;
        close(): void;
        setHeaderColor(color: string): void;
        setBackgroundColor(color: string): void;
        showAlert(message: string): void;
        showConfirm(message: string, callback: (confirmed: boolean) => void): void;
        openLink(url: string): void;
        onEvent(eventType: string, callback: () => void): void;
        offEvent(eventType: string, callback: () => void): void;
        isExpanded: boolean;
        viewportHeight: number;
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
          destructive_text_color?: string;
        };
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        HapticFeedback?: {
          impactOccurred(style: 'light' | 'medium' | 'heavy'): void;
          selectionChanged(): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
        };
      };
    };
  }
}

export {};
