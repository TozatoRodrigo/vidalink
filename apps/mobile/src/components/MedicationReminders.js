import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Switch,
  StyleSheet,
  Picker,
} from 'react-native';
import NotificationService from '../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MedicationReminders = ({ visible, onClose }) => {
  const [reminders, setReminders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [settings, setSettings] = useState({
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
  });

  // Estados do formulário
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    times: ['08:00'],
    frequency: 'daily',
    days: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    isActive: true,
  });

  const frequencies = [
    { value: 'daily', label: 'Diariamente', icon: '📅' },
    { value: 'weekly', label: 'Semanalmente', icon: '📆' },
    { value: 'monthly', label: 'Mensalmente', icon: '🗓️' },
  ];

  const weekDays = [
    { value: 0, label: 'Dom', fullLabel: 'Domingo' },
    { value: 1, label: 'Seg', fullLabel: 'Segunda' },
    { value: 2, label: 'Ter', fullLabel: 'Terça' },
    { value: 3, label: 'Qua', fullLabel: 'Quarta' },
    { value: 4, label: 'Qui', fullLabel: 'Quinta' },
    { value: 5, label: 'Sex', fullLabel: 'Sexta' },
    { value: 6, label: 'Sáb', fullLabel: 'Sábado' },
  ];

  // Opções de configuração
  const advanceNoticeOptions = [
    { label: 'No horário', value: 0 },
    { label: '5 min antes', value: 5 },
    { label: '10 min antes', value: 10 },
    { label: '15 min antes', value: 15 },
    { label: '30 min antes', value: 30 },
    { label: '1h antes', value: 60 },
  ];

  const repeatIntervalOptions = [
    { label: '1 min', value: 1 },
    { label: '2 min', value: 2 },
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '15 min', value: 15 },
  ];

  useEffect(() => {
    if (visible) {
      loadReminders();
      loadSettings();
    }
  }, [visible]);

  const loadReminders = async () => {
    try {
      const loadedReminders = NotificationService.getReminders();
      setReminders(loadedReminders);
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const loadedSettings = NotificationService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      medicationName: '',
      dosage: '',
      times: ['08:00'],
      frequency: 'daily',
      days: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      isActive: true,
    });
    setEditingReminder(null);
  };

  const validateForm = () => {
    if (!formData.medicationName.trim()) {
      Alert.alert('Erro', 'O nome do medicamento é obrigatório');
      return false;
    }
    if (!formData.dosage.trim()) {
      Alert.alert('Erro', 'A dosagem é obrigatória');
      return false;
    }
    if (formData.times.length === 0) {
      Alert.alert('Erro', 'Pelo menos um horário deve ser definido');
      return false;
    }
    if (formData.frequency === 'weekly' && formData.days.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um dia da semana');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingReminder) {
        await NotificationService.updateReminder(editingReminder.id, formData);
        Alert.alert('Sucesso', 'Lembrete atualizado com sucesso!');
      } else {
        await NotificationService.addReminder(formData);
        Alert.alert('Sucesso', 'Lembrete criado com sucesso!');
      }
      
      resetForm();
      setShowAddModal(false);
      loadReminders();
    } catch (error) {
      console.error('Erro ao salvar lembrete:', error);
      Alert.alert('Erro', 'Falha ao salvar lembrete');
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      medicationName: reminder.medicationName,
      dosage: reminder.dosage,
      times: reminder.times,
      frequency: reminder.frequency,
      days: reminder.days || [],
      startDate: reminder.startDate.split('T')[0],
      endDate: reminder.endDate ? reminder.endDate.split('T')[0] : '',
      notes: reminder.notes || '',
      isActive: reminder.isActive,
    });
    setShowAddModal(true);
  };

  const handleDelete = (reminder) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o lembrete para ${reminder.medicationName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.removeReminder(reminder.id);
              Alert.alert('Sucesso', 'Lembrete excluído com sucesso!');
              loadReminders();
            } catch (error) {
              console.error('Erro ao excluir lembrete:', error);
              Alert.alert('Erro', 'Falha ao excluir lembrete');
            }
          },
        },
      ]
    );
  };

  const handleToggle = async (reminder) => {
    try {
      await NotificationService.toggleReminder(reminder.id);
      loadReminders();
    } catch (error) {
      console.error('Erro ao alternar lembrete:', error);
      Alert.alert('Erro', 'Falha ao alternar lembrete');
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await NotificationService.updateSettings(newSettings);
      setSettings({ ...settings, ...newSettings });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      Alert.alert('Erro', 'Falha ao atualizar configurações');
    }
  };

  const addTime = () => {
    setFormData({
      ...formData,
      times: [...formData.times, '12:00']
    });
  };

  const updateTime = (index, time) => {
    const newTimes = [...formData.times];
    newTimes[index] = time;
    setFormData({ ...formData, times: newTimes });
  };

  const removeTime = (index) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index);
      setFormData({ ...formData, times: newTimes });
    }
  };

  const toggleDay = (day) => {
    const newDays = formData.days.includes(day)
      ? formData.days.filter(d => d !== day)
      : [...formData.days, day];
    setFormData({ ...formData, days: newDays });
  };

  const formatFrequency = (reminder) => {
    switch (reminder.frequency) {
      case 'daily':
        return 'Diariamente';
      case 'weekly':
        if (reminder.days && reminder.days.length > 0) {
          const dayNames = reminder.days.map(d => weekDays[d].label).join(', ');
          return `Semanalmente (${dayNames})`;
        }
        return 'Semanalmente';
      case 'monthly':
        return 'Mensalmente';
      default:
        return reminder.frequency;
    }
  };

  const getUpcomingReminders = () => {
    return NotificationService.getUpcomingReminders();
  };

  const testNotificationNow = async () => {
    try {
      await NotificationService.testNotification('Medicamento Teste', '1 comprimido');
      Alert.alert(
        'Teste Enviado! 🔔', 
        'Se você não viu a notificação, é porque o Expo Go tem limitações. Para notificações reais, use um Development Build.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao testar notificação');
    }
  };

  const testNotificationDelayed = async () => {
    try {
      await NotificationService.scheduleTestNotification('Medicamento Teste', '1 comprimido', 10);
      Alert.alert(
        'Teste Agendado! ⏰', 
        'Uma notificação será enviada em 10 segundos. Mantenha o app em primeiro plano.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao agendar teste');
    }
  };

  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
            <Text style={styles.cancelButton}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Configurações Avançadas</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Antecedência das Notificações */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>⏰ Antecedência das Notificações</Text>
            <View style={styles.optionsContainer}>
              {advanceNoticeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    settings.advanceNotice === option.value && styles.optionButtonSelected
                  ]}
                  onPress={() => updateSettings({ advanceNotice: option.value })}
                >
                  <Text style={[
                    styles.optionLabel,
                    settings.advanceNotice === option.value && styles.optionLabelSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Repetição de Notificações */}
          <View style={styles.formGroup}>
            <View style={styles.settingRow}>
              <Text style={styles.formLabel}>🔁 Repetir Notificações</Text>
              <Switch
                value={settings.repeatNotification}
                onValueChange={(value) => updateSettings({ repeatNotification: value })}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
                thumbColor={settings.repeatNotification ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            {settings.repeatNotification && (
              <>
                <Text style={styles.formSubLabel}>Intervalo de repetição:</Text>
                <View style={styles.optionsContainer}>
                  {repeatIntervalOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        settings.repeatInterval === option.value && styles.optionButtonSelected
                      ]}
                      onPress={() => updateSettings({ repeatInterval: option.value })}
                    >
                      <Text style={[
                        styles.optionLabel,
                        settings.repeatInterval === option.value && styles.optionLabelSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.formSubLabel}>Máximo de repetições:</Text>
                <View style={styles.optionsContainer}>
                  {[1, 2, 3, 5, 10].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.optionButton,
                        settings.maxRepeats === num && styles.optionButtonSelected
                      ]}
                      onPress={() => updateSettings({ maxRepeats: num })}
                    >
                      <Text style={[
                        styles.optionLabel,
                        settings.maxRepeats === num && styles.optionLabelSelected
                      ]}>
                        {num}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Horário de Silêncio */}
          <View style={styles.formGroup}>
            <View style={styles.settingRow}>
              <Text style={styles.formLabel}>🌙 Horário Silencioso</Text>
              <Switch
                value={settings.quietHoursEnabled}
                onValueChange={(value) => updateSettings({ quietHoursEnabled: value })}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
                thumbColor={settings.quietHoursEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            {settings.quietHoursEnabled && (
              <View style={styles.timeRangeContainer}>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.timeLabel}>Início:</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={settings.quietHoursStart}
                    onChangeText={(text) => updateSettings({ quietHoursStart: text })}
                    placeholder="22:00"
                    maxLength={5}
                  />
                </View>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.timeLabel}>Fim:</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={settings.quietHoursEnd}
                    onChangeText={(text) => updateSettings({ quietHoursEnd: text })}
                    placeholder="07:00"
                    maxLength={5}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Estatísticas */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>📊 Estatísticas</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{reminders.length}</Text>
                <Text style={styles.statLabel}>Lembretes Ativos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {reminders.filter(r => r.isActive).length}
                </Text>
                <Text style={styles.statLabel}>Habilitados</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {getUpcomingReminders().length}
                </Text>
                <Text style={styles.statLabel}>Próximos</Text>
              </View>
            </View>
          </View>

          {/* Teste de Notificações */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>🧪 Teste de Notificações</Text>
            <View style={styles.testWarning}>
              <Text style={styles.testWarningText}>
                ⚠️ Expo Go tem limitações para notificações. Para funcionalidade completa, use um Development Build.
              </Text>
            </View>
            
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF9800' }]} onPress={testNotificationNow}>
              <Text style={styles.actionButtonText}>🔔 Testar Notificação Agora</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2196F3' }]} onPress={testNotificationDelayed}>
              <Text style={styles.actionButtonText}>⏰ Testar em 10 Segundos</Text>
            </TouchableOpacity>
          </View>

          {/* Ações de Gerenciamento */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>🔧 Gerenciamento</Text>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  'Reagendar Notificações',
                  'Isso irá reagendar todas as notificações com as novas configurações.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Reagendar',
                      onPress: async () => {
                        try {
                          await NotificationService.rescheduleAllNotifications();
                          Alert.alert('Sucesso', 'Notificações reagendadas!');
                        } catch (error) {
                          Alert.alert('Erro', 'Falha ao reagendar notificações');
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.actionButtonText}>🔄 Reagendar Todas as Notificações</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => {
                Alert.alert(
                  'Limpar Todos os Lembretes',
                  'Esta ação não pode ser desfeita. Todos os lembretes serão removidos.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Limpar',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await AsyncStorage.removeItem('medication_reminders');
                          await NotificationService.cancelAllNotifications();
                          setReminders([]);
                          Alert.alert('Sucesso', 'Todos os lembretes foram removidos!');
                        } catch (error) {
                          Alert.alert('Erro', 'Falha ao limpar lembretes');
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.actionButtonText}>🗑️ Limpar Todos os Lembretes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderReminderItem = (reminder) => (
    <View key={reminder.id} style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderName}>💊 {reminder.medicationName}</Text>
          <Text style={styles.reminderDosage}>{reminder.dosage}</Text>
          <Text style={styles.reminderFrequency}>{formatFrequency(reminder)}</Text>
          <Text style={styles.reminderTimes}>
            Horários: {reminder.times.join(', ')}
          </Text>
        </View>
        <Switch
          value={reminder.isActive}
          onValueChange={() => handleToggle(reminder)}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={reminder.isActive ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      <View style={styles.reminderActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(reminder)}
        >
          <Text style={styles.editButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(reminder)}
        >
          <Text style={styles.deleteButtonText}>🗑️ Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => {
            resetForm();
            setShowAddModal(false);
          }}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Nome do Medicamento */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nome do Medicamento *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.medicationName}
              onChangeText={(text) => setFormData({...formData, medicationName: text})}
              placeholder="Ex: Dipirona"
            />
          </View>

          {/* Dosagem */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Dosagem *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.dosage}
              onChangeText={(text) => setFormData({...formData, dosage: text})}
              placeholder="Ex: 500mg, 1 comprimido"
            />
          </View>

          {/* Horários */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Horários *</Text>
            {formData.times.map((time, index) => (
              <View key={index} style={styles.timeRow}>
                <TextInput
                  style={[styles.formInput, { flex: 1 }]}
                  value={time}
                  onChangeText={(text) => updateTime(index, text)}
                  placeholder="HH:MM"
                />
                {formData.times.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeTimeButton}
                    onPress={() => removeTime(index)}
                  >
                    <Text style={styles.removeTimeText}>❌</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addTimeButton} onPress={addTime}>
              <Text style={styles.addTimeText}>➕ Adicionar Horário</Text>
            </TouchableOpacity>
          </View>

          {/* Frequência */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Frequência</Text>
            <View style={styles.frequencyOptions}>
              {frequencies.map((freq) => (
                <TouchableOpacity
                  key={freq.value}
                  style={[
                    styles.frequencyOption,
                    formData.frequency === freq.value && styles.frequencyOptionSelected
                  ]}
                  onPress={() => setFormData({...formData, frequency: freq.value, days: []})}
                >
                  <Text style={styles.frequencyIcon}>{freq.icon}</Text>
                  <Text style={[
                    styles.frequencyLabel,
                    formData.frequency === freq.value && styles.frequencyLabelSelected
                  ]}>
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dias da Semana (apenas para frequência semanal) */}
          {formData.frequency === 'weekly' && (
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Dias da Semana *</Text>
              <View style={styles.weekDaysContainer}>
                {weekDays.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.weekDayOption,
                      formData.days.includes(day.value) && styles.weekDayOptionSelected
                    ]}
                    onPress={() => toggleDay(day.value)}
                  >
                    <Text style={[
                      styles.weekDayLabel,
                      formData.days.includes(day.value) && styles.weekDayLabelSelected
                    ]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Data de Início */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Data de Início</Text>
            <TextInput
              style={styles.formInput}
              value={formData.startDate}
              onChangeText={(text) => setFormData({...formData, startDate: text})}
              placeholder="YYYY-MM-DD"
            />
          </View>

          {/* Data de Fim */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Data de Fim (opcional)</Text>
            <TextInput
              style={styles.formInput}
              value={formData.endDate}
              onChangeText={(text) => setFormData({...formData, endDate: text})}
              placeholder="YYYY-MM-DD"
            />
          </View>

          {/* Observações */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Observações</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({...formData, notes: text})}
              placeholder="Observações adicionais..."
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.backButton}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lembretes de Medicamentos</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButton}>➕ Novo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Configurações de Notificação */}
          <View style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>🔔 Configurações</Text>
              <TouchableOpacity 
                style={styles.advancedButton}
                onPress={() => setShowSettingsModal(true)}
              >
                <Text style={styles.advancedButtonText}>⚙️ Avançado</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Notificações Ativadas</Text>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => updateSettings({ enabled: value })}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
                thumbColor={settings.enabled ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Som</Text>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => updateSettings({ soundEnabled: value })}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
                thumbColor={settings.soundEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Vibração</Text>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={(value) => updateSettings({ vibrationEnabled: value })}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
                thumbColor={settings.vibrationEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Antecedência</Text>
              <Text style={styles.settingValue}>
                {advanceNoticeOptions.find(opt => opt.value === settings.advanceNotice)?.label || 'No horário'}
              </Text>
            </View>

            {settings.repeatNotification && (
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Repetir notificação</Text>
                <Text style={styles.settingValue}>
                  A cada {settings.repeatInterval} min
                </Text>
              </View>
            )}

            {settings.quietHoursEnabled && (
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Horário silencioso</Text>
                <Text style={styles.settingValue}>
                  {settings.quietHoursStart} - {settings.quietHoursEnd}
                </Text>
              </View>
            )}
          </View>

          {/* Lista de Lembretes */}
          <View style={styles.remindersSection}>
            <Text style={styles.sectionTitle}>💊 Meus Lembretes</Text>
            
            {reminders.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Nenhum lembrete configurado ainda.{'\n'}
                  Toque em "Novo" para adicionar seu primeiro lembrete!
                </Text>
              </View>
            ) : (
              reminders.map(renderReminderItem)
            )}
          </View>

          {/* Próximos Lembretes */}
          {reminders.length > 0 && (
            <View style={styles.upcomingSection}>
              <Text style={styles.sectionTitle}>⏰ Próximos Lembretes</Text>
              {getUpcomingReminders().slice(0, 5).map((upcoming, index) => (
                <View key={index} style={styles.upcomingItem}>
                  <Text style={styles.upcomingTime}>
                    {upcoming.nextTime.toLocaleDateString('pt-BR')} às {upcoming.timeString}
                  </Text>
                  <Text style={styles.upcomingMedication}>
                    {upcoming.reminder.medicationName} - {upcoming.reminder.dosage}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {renderAddModal()}
        {renderSettingsModal()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2196F3',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  advancedButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  advancedButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  remindersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  reminderDosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  reminderFrequency: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  reminderTimes: {
    fontSize: 14,
    color: '#666',
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  upcomingSection: {
    marginBottom: 20,
  },
  upcomingItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  upcomingTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  upcomingMedication: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2196F3',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  removeTimeButton: {
    padding: 5,
  },
  removeTimeText: {
    fontSize: 16,
  },
  addTimeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addTimeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  frequencyOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  frequencyOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  frequencyIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  frequencyLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  frequencyLabelSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  weekDayOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  weekDayOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  weekDayLabel: {
    fontSize: 14,
    color: '#666',
  },
  weekDayLabelSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  // Estilos para configurações avançadas
  formSubLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  optionLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  timeInputGroup: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  timeInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
    minWidth: 80,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  dangerButtonText: {
    color: '#fff',
  },
  // Estilos para teste de notificações
  testWarning: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  testWarningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default MedicationReminders;
