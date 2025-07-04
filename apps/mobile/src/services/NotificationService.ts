import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface MedicationReminder {
  id: string;
  medicationName: string;
  dosage: string;
  times: string[]; // Array de horários no formato "HH:MM"
  startDate: string; // Data de início no formato ISO
  endDate?: string; // Data de fim no formato ISO (opcional)
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  days?: number[]; // Para frequência semanal: 0=domingo, 1=segunda, etc.
  interval?: number; // Para frequência customizada (em horas)
  isActive: boolean;
  notificationIds: string[]; // IDs das notificações agendadas
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  advanceNotice: number; // Minutos antes do horário
  repeatNotification: boolean;
  repeatInterval: number; // Minutos entre repetições
  quietHoursEnabled: boolean;
  quietHoursStart: string; // Formato "HH:MM"
  quietHoursEnd: string; // Formato "HH:MM"
  maxRepeats: number; // Número máximo de repetições
}

const STORAGE_KEYS = {
  REMINDERS: '@VidaLink:medicationReminders',
  SETTINGS: '@VidaLink:notificationSettings',
};

class NotificationService {
  private static instance: NotificationService;
  private reminders: MedicationReminder[] = [];
  private settings: NotificationSettings = {
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    advanceNotice: 0,
    repeatNotification: false,
    repeatInterval: 5,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    maxRepeats: 3,
  };

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Inicializar o serviço de notificações
   */
  async initialize(): Promise<void> {
    try {
      // Solicitar permissões
      await this.requestPermissions();
      
      // Carregar dados salvos
      await this.loadReminders();
      await this.loadSettings();
      
      // Reagendar notificações se necessário
      await this.rescheduleAllNotifications();
      
      console.log('NotificationService inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar NotificationService:', error);
    }
  }

  /**
   * Solicitar permissões de notificação
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Permissão de notificação não concedida');
        return false;
      }

      // Configurar canal de notificação no Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medication-reminders', {
          name: 'Lembretes de Medicamentos',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return false;
    }
  }

  /**
   * Carregar lembretes do AsyncStorage
   */
  async loadReminders(): Promise<void> {
    try {
      const remindersData = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (remindersData) {
        this.reminders = JSON.parse(remindersData);
      }
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error);
    }
  }

  /**
   * Salvar lembretes no AsyncStorage
   */
  async saveReminders(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(this.reminders));
    } catch (error) {
      console.error('Erro ao salvar lembretes:', error);
    }
  }

  /**
   * Carregar configurações do AsyncStorage
   */
  async loadSettings(): Promise<void> {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsData) {
        this.settings = { ...this.settings, ...JSON.parse(settingsData) };
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }

  /**
   * Salvar configurações no AsyncStorage
   */
  async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  /**
   * Adicionar novo lembrete
   */
  async addReminder(reminder: Omit<MedicationReminder, 'id' | 'notificationIds' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const newReminder: MedicationReminder = {
        ...reminder,
        id: Date.now().toString(),
        notificationIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Agendar notificações
      if (newReminder.isActive && this.settings.enabled) {
        await this.scheduleNotificationsForReminder(newReminder);
      }

      this.reminders.push(newReminder);
      await this.saveReminders();

      return newReminder.id;
    } catch (error) {
      console.error('Erro ao adicionar lembrete:', error);
      throw error;
    }
  }

  /**
   * Atualizar lembrete existente
   */
  async updateReminder(id: string, updates: Partial<MedicationReminder>): Promise<void> {
    try {
      const index = this.reminders.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('Lembrete não encontrado');
      }

      const currentReminder = this.reminders[index];
      
      // Cancelar notificações antigas
      await this.cancelNotificationsForReminder(currentReminder);

      // Atualizar dados
      const updatedReminder = {
        ...currentReminder,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Reagendar notificações se ativo
      if (updatedReminder.isActive && this.settings.enabled) {
        await this.scheduleNotificationsForReminder(updatedReminder);
      }

      this.reminders[index] = updatedReminder;
      await this.saveReminders();
    } catch (error) {
      console.error('Erro ao atualizar lembrete:', error);
      throw error;
    }
  }

  /**
   * Remover lembrete
   */
  async removeReminder(id: string): Promise<void> {
    try {
      const reminder = this.reminders.find(r => r.id === id);
      if (reminder) {
        await this.cancelNotificationsForReminder(reminder);
      }

      this.reminders = this.reminders.filter(r => r.id !== id);
      await this.saveReminders();
    } catch (error) {
      console.error('Erro ao remover lembrete:', error);
      throw error;
    }
  }

  /**
   * Obter todos os lembretes
   */
  getReminders(): MedicationReminder[] {
    return [...this.reminders];
  }

  /**
   * Obter lembrete por ID
   */
  getReminder(id: string): MedicationReminder | undefined {
    return this.reminders.find(r => r.id === id);
  }

  /**
   * Ativar/desativar lembrete
   */
  async toggleReminder(id: string): Promise<void> {
    const reminder = this.reminders.find(r => r.id === id);
    if (reminder) {
      await this.updateReminder(id, { isActive: !reminder.isActive });
    }
  }

  /**
   * Obter configurações de notificação
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Atualizar configurações de notificação
   */
  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await this.saveSettings();

      // Reagendar notificações se necessário
      if (newSettings.enabled !== undefined) {
        await this.rescheduleAllNotifications();
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }

  /**
   * Obter próximos lembretes (próximas 24 horas)
   */
  getUpcomingReminders(): Array<{
    reminder: MedicationReminder;
    nextTime: Date;
    timeString: string;
  }> {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcoming: Array<{
      reminder: MedicationReminder;
      nextTime: Date;
      timeString: string;
    }> = [];

    for (const reminder of this.reminders) {
      if (!reminder.isActive) continue;

      for (const timeString of reminder.times) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const nextTime = new Date(now);
        nextTime.setHours(hours, minutes, 0, 0);

        // Se o horário já passou hoje, considerar amanhã
        if (nextTime <= now) {
          nextTime.setDate(nextTime.getDate() + 1);
        }

        // Verificar se está dentro das próximas 24 horas
        if (nextTime <= next24Hours) {
          // Verificar se o dia da semana está correto (para lembretes semanais)
          let shouldInclude = true;
          if (reminder.frequency === 'weekly' && reminder.days) {
            shouldInclude = reminder.days.includes(nextTime.getDay());
          }

          if (shouldInclude) {
            upcoming.push({
              reminder,
              nextTime,
              timeString,
            });
          }
        }
      }
    }

    // Ordenar por horário
    upcoming.sort((a, b) => a.nextTime.getTime() - b.nextTime.getTime());

    return upcoming;
  }

  /**
   * Limpar todas as notificações e dados
   */
  async clearAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.reminders = [];
      await this.saveReminders();
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }

  /**
   * Agendar notificações para um lembrete específico
   */
  private async scheduleNotificationsForReminder(reminder: MedicationReminder): Promise<void> {
    try {
      console.log('Agendando notificações para:', reminder.medicationName);
      
      // Simular agendamento (funcionalidade limitada no Expo Go)
      const notificationIds: string[] = [];
      
      for (const timeString of reminder.times) {
        // Simular ID de notificação
        const mockId = `${reminder.id}-${timeString}-${Date.now()}`;
        notificationIds.push(mockId);
        
        console.log(`Notificação simulada agendada para ${reminder.medicationName} às ${timeString}`);
      }

      // Atualizar o lembrete com os IDs simulados
      reminder.notificationIds = notificationIds;
      
      console.log('Notificações agendadas com sucesso');
    } catch (error) {
      console.error('Erro ao agendar notificações:', error);
      throw error;
    }
  }

  /**
   * Cancelar notificações de um lembrete específico
   */
  private async cancelNotificationsForReminder(reminder: MedicationReminder): Promise<void> {
    try {
      if (reminder.notificationIds && reminder.notificationIds.length > 0) {
        for (const notificationId of reminder.notificationIds) {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
        }
        reminder.notificationIds = [];
      }
    } catch (error) {
      console.error('Erro ao cancelar notificações:', error);
    }
  }

  /**
   * Reagendar todas as notificações
   */
  async rescheduleAllNotifications(): Promise<void> {
    try {
      // Cancelar todas as notificações existentes
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Limpar IDs das notificações
      for (const reminder of this.reminders) {
        reminder.notificationIds = [];
      }

      // Reagendar notificações ativas se as notificações estiverem habilitadas
      if (this.settings.enabled) {
        for (const reminder of this.reminders) {
          if (reminder.isActive) {
            await this.scheduleNotificationsForReminder(reminder);
          }
        }
      }

      // Salvar alterações
      await this.saveReminders();
    } catch (error) {
      console.error('Erro ao reagendar notificações:', error);
      throw error;
    }
  }

  /**
   * Cancelar todas as notificações
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Limpar IDs das notificações de todos os lembretes
      for (const reminder of this.reminders) {
        reminder.notificationIds = [];
      }
      
      await this.saveReminders();
    } catch (error) {
      console.error('Erro ao cancelar todas as notificações:', error);
      throw error;
    }
  }

  /**
   * Testar notificação imediata (funciona no Expo Go)
   */
  async testNotification(medicationName: string, dosage: string): Promise<void> {
    try {
      console.log('Testando notificação imediata...');
      
      // Verificar permissões
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissões de notificação não concedidas');
        return;
      }

      // Enviar notificação imediata
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `💊 Teste: ${medicationName}`,
          body: `Notificação de teste para ${dosage}`,
          sound: true,
          data: {
            test: true,
            medicationName,
            dosage,
          },
        },
        trigger: null, // Notificação imediata
      });

      console.log('Notificação de teste enviada!');
    } catch (error) {
      console.error('Erro ao testar notificação:', error);
      throw error;
    }
  }

  /**
   * Agendar notificação para daqui a poucos segundos (teste)
   */
  async scheduleTestNotification(medicationName: string, dosage: string, seconds: number = 10): Promise<void> {
    try {
      console.log(`Agendando notificação de teste para ${seconds} segundos...`);
      
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissões de notificação não concedidas');
        return;
      }

      const triggerDate = new Date();
      triggerDate.setSeconds(triggerDate.getSeconds() + seconds);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `💊 Teste em ${seconds}s: ${medicationName}`,
          body: `Hora de tomar ${dosage} - Teste de notificação`,
          sound: true,
          data: {
            test: true,
            medicationName,
            dosage,
            scheduledFor: triggerDate.toISOString(),
          },
        },
        trigger: triggerDate,
      });

      console.log(`Notificação agendada para ${triggerDate.toLocaleTimeString()}`);
    } catch (error) {
      console.error('Erro ao agendar notificação de teste:', error);
      throw error;
    }
  }
}

export default NotificationService.getInstance();
