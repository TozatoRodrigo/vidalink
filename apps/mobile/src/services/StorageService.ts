import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@VidaLink:token',
  USER: '@VidaLink:user',
  HEALTH_EVENTS: '@VidaLink:healthEvents',
  SETTINGS: '@VidaLink:settings',
} as const;

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  date_of_birth: string;
  cpf: string;
  profile_picture_url?: string;
}

export interface Settings {
  notifications: boolean;
  biometric: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'pt' | 'en';
}

class StorageService {
  /**
   * Salva o token de autenticação
   */
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.TOKEN, token);
    } catch (error) {
      console.error('Erro ao salvar token:', error);
      throw error;
    }
  }

  /**
   * Recupera o token de autenticação
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.TOKEN);
    } catch (error) {
      console.error('Erro ao recuperar token:', error);
      return null;
    }
  }

  /**
   * Remove o token de autenticação
   */
  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.TOKEN);
    } catch (error) {
      console.error('Erro ao remover token:', error);
      throw error;
    }
  }

  /**
   * Salva os dados do usuário
   */
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      throw error;
    }
  }

  /**
   * Recupera os dados do usuário
   */
  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao recuperar usuário:', error);
      return null;
    }
  }

  /**
   * Remove os dados do usuário
   */
  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.USER);
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      throw error;
    }
  }

  /**
   * Salva eventos de saúde em cache
   */
  async saveHealthEvents(events: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.HEALTH_EVENTS, JSON.stringify(events));
    } catch (error) {
      console.error('Erro ao salvar eventos de saúde:', error);
      throw error;
    }
  }

  /**
   * Recupera eventos de saúde do cache
   */
  async getHealthEvents(): Promise<any[] | null> {
    try {
      const eventsData = await AsyncStorage.getItem(KEYS.HEALTH_EVENTS);
      return eventsData ? JSON.parse(eventsData) : null;
    } catch (error) {
      console.error('Erro ao recuperar eventos de saúde:', error);
      return null;
    }
  }

  /**
   * Remove eventos de saúde do cache
   */
  async removeHealthEvents(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.HEALTH_EVENTS);
    } catch (error) {
      console.error('Erro ao remover eventos de saúde:', error);
      throw error;
    }
  }

  /**
   * Salva configurações do app
   */
  async saveSettings(settings: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  }

  /**
   * Recupera configurações do app
   */
  async getSettings(): Promise<Settings | null> {
    try {
      const settingsData = await AsyncStorage.getItem(KEYS.SETTINGS);
      return settingsData ? JSON.parse(settingsData) : null;
    } catch (error) {
      console.error('Erro ao recuperar configurações:', error);
      return null;
    }
  }

  /**
   * Remove configurações do app
   */
  async removeSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.SETTINGS);
    } catch (error) {
      console.error('Erro ao remover configurações:', error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário está logado
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const user = await this.getUser();
      return !!(token && user);
    } catch (error) {
      console.error('Erro ao verificar login:', error);
      return false;
    }
  }

  /**
   * Limpa todos os dados do storage (logout)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.TOKEN,
        KEYS.USER,
        KEYS.HEALTH_EVENTS,
        // Mantém as configurações mesmo após logout
      ]);
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      throw error;
    }
  }

  /**
   * Salva dados genéricos no storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
      throw error;
    }
  }

  /**
   * Recupera dados genéricos do storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Erro ao recuperar ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove dados genéricos do storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover ${key}:`, error);
      throw error;
    }
  }

  /**
   * Obtém todas as chaves do storage
   */
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Erro ao obter chaves:', error);
      return [];
    }
  }

  /**
   * Obtém o tamanho usado no storage
   */
  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Erro ao calcular tamanho do storage:', error);
      return 0;
    }
  }
}

export { StorageService };
export default new StorageService(); 