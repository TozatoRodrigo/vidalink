import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, SafeAreaView, Modal, Picker, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function App() {
  const [healthEvents, setHealthEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [qrData, setQrData] = useState('');
  
  // Estados para edição
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para navegação
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Estados para upload de documentos
  const [attachedDocuments, setAttachedDocuments] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    type: 'consulta',
    date: new Date().toISOString().split('T')[0],
    time: '',
    doctor: '',
    location: '',
    notes: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    followUp: '',
    priority: 'normal'
  });

  // Tipos de eventos disponíveis
  const eventTypes = [
    { value: 'consulta', label: 'Consulta Médica', icon: '👨‍⚕️' },
    { value: 'exame', label: 'Exame', icon: '🔬' },
    { value: 'medicamento', label: 'Medicamento', icon: '💊' },
    { value: 'vacina', label: 'Vacina', icon: '💉' },
    { value: 'cirurgia', label: 'Cirurgia', icon: '🏥' },
    { value: 'emergencia', label: 'Emergência', icon: '🚨' },
    { value: 'terapia', label: 'Terapia', icon: '🧘‍♀️' },
    { value: 'checkup', label: 'Check-up', icon: '✅' }
  ];

  // Níveis de prioridade
  const priorityLevels = [
    { value: 'baixa', label: 'Baixa', color: '#10B981' },
    { value: 'normal', label: 'Normal', color: '#6B7280' },
    { value: 'alta', label: 'Alta', color: '#F59E0B' },
    { value: 'urgente', label: 'Urgente', color: '#EF4444' }
  ];

  // Carregar eventos ao iniciar
  useEffect(() => {
    loadHealthEvents();
  }, []);

  // Carregar eventos do storage
  const loadHealthEvents = async () => {
    try {
      const events = await AsyncStorage.getItem('healthEvents');
      if (events) {
        setHealthEvents(JSON.parse(events));
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  // Salvar eventos no storage
  const saveHealthEvents = async (events) => {
    try {
      await AsyncStorage.setItem('healthEvents', JSON.stringify(events));
      setHealthEvents(events);
    } catch (error) {
      console.error('Erro ao salvar eventos:', error);
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      title: '',
      type: 'consulta',
      date: new Date().toISOString().split('T')[0],
      time: '',
      doctor: '',
      location: '',
      notes: '',
      symptoms: '',
      diagnosis: '',
      treatment: '',
      medications: '',
      followUp: '',
      priority: 'normal'
    });
    setEditingEvent(null);
    setIsEditing(false);
    setAttachedDocuments([]);
  };

  // Funções para upload de documentos
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets) {
        const newDocuments = result.assets.map((asset, index) => ({
          id: Date.now() + index,
          uri: asset.uri,
          name: asset.fileName || `imagem_${Date.now()}_${index}.jpg`,
          type: 'image',
          mimeType: asset.type || 'image/jpeg',
          size: asset.fileSize,
        }));
        setAttachedDocuments(prev => [...prev, ...newDocuments]);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Falha ao selecionar imagem');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para usar a câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newDocument = {
          id: Date.now(),
          uri: asset.uri,
          name: asset.fileName || `foto_${Date.now()}.jpg`,
          type: 'image',
          mimeType: asset.type || 'image/jpeg',
          size: asset.fileSize,
        };
        setAttachedDocuments(prev => [...prev, newDocument]);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Falha ao tirar foto');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newDocuments = result.assets.map(asset => ({
          id: Date.now() + Math.random(),
          uri: asset.uri,
          name: asset.name,
          type: 'document',
          mimeType: asset.mimeType || 'application/octet-stream',
          size: asset.size,
        }));
        setAttachedDocuments(prev => [...prev, ...newDocuments]);
      }
    } catch (error) {
      console.error('Erro ao selecionar documento:', error);
      Alert.alert('Erro', 'Falha ao selecionar documento');
    }
  };

  const removeDocument = (documentId) => {
    setAttachedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const showDocumentPicker = () => {
    Alert.alert(
      'Anexar Documento',
      'Escolha uma opção:',
      [
        { text: 'Câmera', onPress: takePhoto },
        { text: 'Galeria', onPress: pickImage },
        { text: 'Documentos', onPress: pickDocument },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const formatFileSize = (size) => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Iniciar edição de evento
  const startEditEvent = (event) => {
    setFormData({
      title: event.title || '',
      type: event.type || 'consulta',
      date: event.date || new Date().toISOString().split('T')[0],
      time: event.time || '',
      doctor: event.doctor || '',
      location: event.location || '',
      notes: event.notes || '',
      symptoms: event.symptoms || '',
      diagnosis: event.diagnosis || '',
      treatment: event.treatment || '',
      medications: event.medications || '',
      followUp: event.followUp || '',
      priority: event.priority || 'normal'
    });
    setEditingEvent(event);
    setIsEditing(true);
    setShowAddModal(true);
  };

  // Salvar edição de evento
  const saveEditEvent = () => {
    if (!validateForm()) return;

    const updatedEvent = {
      ...editingEvent,
      ...formData,
      updatedAt: new Date().toISOString()
    };

    const updatedEvents = healthEvents.map(event => 
      event.id === editingEvent.id ? updatedEvent : event
    );

    saveHealthEvents(updatedEvents);
    resetForm();
    setShowAddModal(false);
    Alert.alert('Sucesso', 'Evento atualizado com sucesso!');
  };

  // Excluir evento
  const deleteEvent = (eventId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            const updatedEvents = healthEvents.filter(event => event.id !== eventId);
            saveHealthEvents(updatedEvents);
            Alert.alert('Sucesso', 'Evento excluído com sucesso!');
          }
        }
      ]
    );
  };

  // Validar formulário
  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'O título é obrigatório');
      return false;
    }
    if (!formData.date) {
      Alert.alert('Erro', 'A data é obrigatória');
      return false;
    }
    return true;
  };

  // Adicionar novo evento
  const addNewEvent = () => {
    if (!validateForm()) return;

    const newEvent = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    const newEvents = [newEvent, ...healthEvents];
    saveHealthEvents(newEvents);
    resetForm();
    setShowAddModal(false);
    Alert.alert('Sucesso', 'Evento adicionado com sucesso!');
  };

  // Adicionar evento de exemplo
  const addSampleEvent = () => {
    const sampleEvents = [
      {
        id: Date.now() + 1,
        title: 'Consulta Cardiologista',
        type: 'consulta',
        date: new Date().toISOString().split('T')[0],
        time: '14:30',
        doctor: 'Dr. João Silva',
        location: 'Hospital Central',
        notes: 'Consulta de rotina para acompanhamento',
        symptoms: 'Dor no peito ocasional',
        diagnosis: 'Pressão arterial elevada',
        treatment: 'Medicação e exercícios',
        medications: 'Losartana 50mg',
        followUp: 'Retorno em 30 dias',
        priority: 'normal',
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 2,
        title: 'Exame de Sangue',
        type: 'exame',
        date: new Date().toISOString().split('T')[0],
        time: '08:00',
        doctor: 'Lab. Central',
        location: 'Laboratório São Paulo',
        notes: 'Hemograma completo e glicemia',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        medications: '',
        followUp: 'Resultado em 2 dias',
        priority: 'normal',
        createdAt: new Date().toISOString()
      }
    ];
    
    const newEvents = [...healthEvents, ...sampleEvents];
    saveHealthEvents(newEvents);
    Alert.alert('Sucesso', 'Eventos de exemplo adicionados!');
  };

  // Filtrar eventos por busca
  const filteredEvents = healthEvents.filter(event =>
    event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.symptoms?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Gerar QR Code
  const generateQRCode = () => {
    const data = JSON.stringify({
      patient: 'Usuário VidaLink',
      events: filteredEvents.length > 0 ? filteredEvents : healthEvents,
      generated_at: new Date().toISOString()
    });
    setQrData(data);
    setShowQRModal(true);
  };

  // Limpar todos os eventos
  const clearAllEvents = () => {
    Alert.alert(
      'Confirmar',
      'Deseja remover todos os eventos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => saveHealthEvents([])
        }
      ]
    );
  };

  // Obter ícone do tipo de evento
  const getEventIcon = (type) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType ? eventType.icon : '🩺';
  };

  // Obter cor da prioridade
  const getPriorityColor = (priority) => {
    const priorityLevel = priorityLevels.find(p => p.value === priority);
    return priorityLevel ? priorityLevel.color : '#6B7280';
  };

  // Funções de navegação
  const navigateToScreen = (screen, eventData = null) => {
    setCurrentScreen(screen);
    if (eventData) {
      setSelectedEvent(eventData);
    }
  };

  const navigateBack = () => {
    setCurrentScreen('dashboard');
    setSelectedEvent(null);
  };

  const viewEventDetails = (event) => {
    setSelectedEvent(event);
    setCurrentScreen('eventDetails');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Sistema de Navegação */}
      {currentScreen === 'dashboard' && renderDashboard()}
      {currentScreen === 'eventDetails' && renderEventDetails()}
      {currentScreen === 'profile' && renderProfile()}
      {currentScreen === 'settings' && renderSettings()}

      {/* Modais */}
      {renderAddEventModal()}
      {renderQRModal()}
    </SafeAreaView>
  );

  // Renderizar Dashboard (Tela Principal)
  function renderDashboard() {
    return (
      <>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>VidaLink</Text>
            <Text style={styles.headerSubtitle}>Sua carteira digital de saúde</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => navigateToScreen('profile')}
            >
              <Text style={styles.headerButtonText}>👤</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => navigateToScreen('settings')}
            >
              <Text style={styles.headerButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{healthEvents.length}</Text>
            <Text style={styles.statLabel}>Total de Eventos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{filteredEvents.length}</Text>
            <Text style={styles.statLabel}>Filtrados</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.buttonText}>➕ Adicionar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sampleButton} onPress={addSampleEvent}>
            <Text style={styles.buttonText}>📋 Exemplo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.qrButton} onPress={generateQRCode}>
            <Text style={styles.buttonText}>📱 QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* Events List */}
        <ScrollView style={styles.eventsList}>
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {healthEvents.length === 0 
                  ? 'Nenhum evento adicionado ainda.\nToque em "Adicionar" para começar!'
                  : 'Nenhum evento encontrado para a busca.'
                }
              </Text>
            </View>
          ) : (
            filteredEvents.map((event) => (
              <TouchableOpacity 
                key={event.id} 
                style={styles.eventCard}
                onPress={() => viewEventDetails(event)}
              >
                <View style={styles.eventHeader}>
                  <Text style={styles.eventIcon}>{getEventIcon(event.type)}</Text>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                      {event.date} {event.time && `às ${event.time}`}
                    </Text>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(event.priority) }]}>
                    <Text style={styles.priorityText}>
                      {priorityLevels.find(p => p.value === event.priority)?.label}
                    </Text>
                  </View>
                </View>
                
                {event.doctor && (
                  <Text style={styles.eventDoctor}>👨‍⚕️ {event.doctor}</Text>
                )}
                
                {event.location && (
                  <Text style={styles.eventLocation}>📍 {event.location}</Text>
                )}
                
                <Text style={styles.tapToView}>👆 Toque para ver detalhes</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Clear Button */}
        {healthEvents.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearAllEvents}>
            <Text style={styles.clearButtonText}>🗑️ Limpar Todos</Text>
          </TouchableOpacity>
        )}
      </>
    );
  }

  // Renderizar Modal de Adicionar Evento
  function renderAddEventModal() {
    return (
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              resetForm();
              setShowAddModal(false);
            }}>
              <Text style={styles.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Editar Evento' : 'Novo Evento'}
            </Text>
            <TouchableOpacity onPress={isEditing ? saveEditEvent : addNewEvent}>
              <Text style={styles.saveButton}>Salvar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            {/* Título */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Título *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.title}
                onChangeText={(text) => setFormData({...formData, title: text})}
                placeholder="Ex: Consulta com cardiologista"
              />
            </View>

            {/* Tipo de Evento */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo de Evento</Text>
              <View style={styles.typeSelector}>
                {eventTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      formData.type === type.value && styles.typeOptionSelected
                    ]}
                    onPress={() => setFormData({...formData, type: type.value})}
                  >
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text style={[
                      styles.typeLabel,
                      formData.type === type.value && styles.typeLabelSelected
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Data e Hora */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.formLabel}>Data *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.date}
                  onChangeText={(text) => setFormData({...formData, date: text})}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.formLabel}>Hora</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.time}
                  onChangeText={(text) => setFormData({...formData, time: text})}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            {/* Médico */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Médico/Profissional</Text>
              <TextInput
                style={styles.formInput}
                value={formData.doctor}
                onChangeText={(text) => setFormData({...formData, doctor: text})}
                placeholder="Ex: Dr. João Silva"
              />
            </View>

            {/* Local */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Local</Text>
              <TextInput
                style={styles.formInput}
                value={formData.location}
                onChangeText={(text) => setFormData({...formData, location: text})}
                placeholder="Ex: Hospital Central"
              />
            </View>

            {/* Prioridade */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Prioridade</Text>
              <View style={styles.prioritySelector}>
                {priorityLevels.map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    style={[
                      styles.priorityOption,
                      { borderColor: priority.color },
                      formData.priority === priority.value && { backgroundColor: priority.color }
                    ]}
                    onPress={() => setFormData({...formData, priority: priority.value})}
                  >
                    <Text style={[
                      styles.priorityLabel,
                      formData.priority === priority.value && styles.priorityLabelSelected
                    ]}>
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sintomas */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Sintomas</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={formData.symptoms}
                onChangeText={(text) => setFormData({...formData, symptoms: text})}
                placeholder="Descreva os sintomas..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Diagnóstico */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Diagnóstico</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={formData.diagnosis}
                onChangeText={(text) => setFormData({...formData, diagnosis: text})}
                placeholder="Diagnóstico médico..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Tratamento */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tratamento</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={formData.treatment}
                onChangeText={(text) => setFormData({...formData, treatment: text})}
                placeholder="Tratamento prescrito..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Medicamentos */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Medicamentos</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={formData.medications}
                onChangeText={(text) => setFormData({...formData, medications: text})}
                placeholder="Medicamentos prescritos..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Acompanhamento */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Acompanhamento</Text>
              <TextInput
                style={styles.formInput}
                value={formData.followUp}
                onChangeText={(text) => setFormData({...formData, followUp: text})}
                placeholder="Ex: Retorno em 30 dias"
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
                numberOfLines={4}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  // Renderizar QR Code Modal
  function renderQRModal() {
    return (
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QR Code - Compartilhamento</Text>
            
            {qrData && (
              <View style={styles.qrContainer}>
                <QRCode
                  value={qrData}
                  size={200}
                  backgroundColor="white"
                  color="black"
                />
              </View>
            )}
            
            <Text style={styles.qrInfo}>
              Escaneie este código para compartilhar seus dados médicos
            </Text>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Renderizar Detalhes do Evento
  function renderEventDetails() {
    if (!selectedEvent) return null;

    return (
      <>
        {/* Header com botão voltar */}
        <View style={styles.detailsHeader}>
          <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.detailsTitle}>Detalhes do Evento</Text>
          <View style={styles.detailsActions}>
            <TouchableOpacity 
              style={styles.editIconButton} 
              onPress={() => startEditEvent(selectedEvent)}
            >
              <Text style={styles.editIconText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteIconButton} 
              onPress={() => deleteEvent(selectedEvent.id)}
            >
              <Text style={styles.deleteIconText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.detailsContent}>
          {/* Cabeçalho do evento */}
          <View style={styles.eventDetailCard}>
            <View style={styles.eventDetailHeader}>
              <Text style={styles.eventDetailIcon}>{getEventIcon(selectedEvent.type)}</Text>
              <View style={styles.eventDetailInfo}>
                <Text style={styles.eventDetailTitle}>{selectedEvent.title}</Text>
                <Text style={styles.eventDetailDate}>
                  {selectedEvent.date} {selectedEvent.time && `às ${selectedEvent.time}`}
                </Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedEvent.priority) }]}>
                <Text style={styles.priorityText}>
                  {priorityLevels.find(p => p.value === selectedEvent.priority)?.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Informações básicas */}
          {selectedEvent.doctor && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>👨‍⚕️ Profissional</Text>
              <Text style={styles.detailSectionContent}>{selectedEvent.doctor}</Text>
            </View>
          )}

          {selectedEvent.location && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📍 Local</Text>
              <Text style={styles.detailSectionContent}>{selectedEvent.location}</Text>
            </View>
          )}

          {/* Informações médicas */}
          {selectedEvent.symptoms && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>🤒 Sintomas</Text>
              <Text style={styles.detailSectionContent}>{selectedEvent.symptoms}</Text>
            </View>
          )}

          {selectedEvent.diagnosis && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>🔍 Diagnóstico</Text>
              <Text style={styles.detailSectionContent}>{selectedEvent.diagnosis}</Text>
            </View>
          )}

          {selectedEvent.treatment && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>💊 Tratamento</Text>
              <Text style={styles.detailSectionContent}>{selectedEvent.treatment}</Text>
            </View>
          )}

          {selectedEvent.medications && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>💉 Medicamentos</Text>
              <Text style={styles.detailSectionContent}>{selectedEvent.medications}</Text>
            </View>
          )}

          {selectedEvent.followUp && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📅 Acompanhamento</Text>
              <Text style={styles.detailSectionContent}>{selectedEvent.followUp}</Text>
            </View>
          )}

          {selectedEvent.notes && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📝 Observações</Text>
              <Text style={styles.detailSectionContent}>{selectedEvent.notes}</Text>
            </View>
          )}

          {/* Informações de sistema */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>ℹ️ Informações do Sistema</Text>
            <Text style={styles.detailSectionContent}>
              Criado em: {new Date(selectedEvent.createdAt).toLocaleString('pt-BR')}
            </Text>
            {selectedEvent.updatedAt && (
              <Text style={styles.detailSectionContent}>
                Atualizado em: {new Date(selectedEvent.updatedAt).toLocaleString('pt-BR')}
              </Text>
            )}
          </View>
        </ScrollView>
      </>
    );
  }

  // Renderizar Perfil
  function renderProfile() {
    return (
      <>
        {/* Header com botão voltar */}
        <View style={styles.detailsHeader}>
          <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.detailsTitle}>Meu Perfil</Text>
          <View style={styles.detailsActions}></View>
        </View>

        <ScrollView style={styles.detailsContent}>
          {/* Avatar e informações básicas */}
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>👤</Text>
            </View>
            <Text style={styles.profileName}>Usuário VidaLink</Text>
            <Text style={styles.profileEmail}>usuario@vidalink.com</Text>
          </View>

          {/* Estatísticas */}
          <View style={styles.profileStatsCard}>
            <Text style={styles.profileStatsTitle}>📊 Minhas Estatísticas</Text>
            <View style={styles.profileStatsGrid}>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatNumber}>{healthEvents.length}</Text>
                <Text style={styles.profileStatLabel}>Total de Eventos</Text>
              </View>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatNumber}>
                  {healthEvents.filter(e => e.type === 'consulta').length}
                </Text>
                <Text style={styles.profileStatLabel}>Consultas</Text>
              </View>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatNumber}>
                  {healthEvents.filter(e => e.type === 'exame').length}
                </Text>
                <Text style={styles.profileStatLabel}>Exames</Text>
              </View>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatNumber}>
                  {healthEvents.filter(e => e.priority === 'urgente').length}
                </Text>
                <Text style={styles.profileStatLabel}>Urgentes</Text>
              </View>
            </View>
          </View>

          {/* Informações pessoais */}
          <View style={styles.profileInfoCard}>
            <Text style={styles.profileInfoTitle}>📋 Informações Pessoais</Text>
            <View style={styles.profileInfoItem}>
              <Text style={styles.profileInfoLabel}>Nome:</Text>
              <Text style={styles.profileInfoValue}>Usuário VidaLink</Text>
            </View>
            <View style={styles.profileInfoItem}>
              <Text style={styles.profileInfoLabel}>Data de Nascimento:</Text>
              <Text style={styles.profileInfoValue}>01/01/1990</Text>
            </View>
            <View style={styles.profileInfoItem}>
              <Text style={styles.profileInfoLabel}>Tipo Sanguíneo:</Text>
              <Text style={styles.profileInfoValue}>O+</Text>
            </View>
            <View style={styles.profileInfoItem}>
              <Text style={styles.profileInfoLabel}>Contato de Emergência:</Text>
              <Text style={styles.profileInfoValue}>(11) 99999-9999</Text>
            </View>
          </View>
        </ScrollView>
      </>
    );
  }

  // Renderizar Configurações
  function renderSettings() {
    return (
      <>
        {/* Header com botão voltar */}
        <View style={styles.detailsHeader}>
          <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.detailsTitle}>Configurações</Text>
          <View style={styles.detailsActions}></View>
        </View>

        <ScrollView style={styles.detailsContent}>
          {/* Configurações de dados */}
          <View style={styles.settingsCard}>
            <Text style={styles.settingsCardTitle}>📊 Dados e Backup</Text>
            
            <TouchableOpacity style={styles.settingsItem} onPress={generateQRCode}>
              <Text style={styles.settingsItemIcon}>📱</Text>
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Gerar QR Code</Text>
                <Text style={styles.settingsItemSubtitle}>Compartilhar dados médicos</Text>
              </View>
              <Text style={styles.settingsItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsItem}>
              <Text style={styles.settingsItemIcon}>☁️</Text>
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Backup na Nuvem</Text>
                <Text style={styles.settingsItemSubtitle}>Sincronizar dados</Text>
              </View>
              <Text style={styles.settingsItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsItem}>
              <Text style={styles.settingsItemIcon}>📤</Text>
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Exportar Dados</Text>
                <Text style={styles.settingsItemSubtitle}>Baixar em PDF</Text>
              </View>
              <Text style={styles.settingsItemArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Configurações de notificações */}
          <View style={styles.settingsCard}>
            <Text style={styles.settingsCardTitle}>🔔 Notificações</Text>
            
            <TouchableOpacity style={styles.settingsItem}>
              <Text style={styles.settingsItemIcon}>⏰</Text>
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Lembretes de Medicamentos</Text>
                <Text style={styles.settingsItemSubtitle}>Ativado</Text>
              </View>
              <Text style={styles.settingsItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsItem}>
              <Text style={styles.settingsItemIcon}>📅</Text>
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Lembretes de Consultas</Text>
                <Text style={styles.settingsItemSubtitle}>Ativado</Text>
              </View>
              <Text style={styles.settingsItemArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Configurações de segurança */}
          <View style={styles.settingsCard}>
            <Text style={styles.settingsCardTitle}>🔒 Segurança e Privacidade</Text>
            
            <TouchableOpacity style={styles.settingsItem}>
              <Text style={styles.settingsItemIcon}>🔐</Text>
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Bloqueio por PIN</Text>
                <Text style={styles.settingsItemSubtitle}>Desativado</Text>
              </View>
              <Text style={styles.settingsItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsItem}>
              <Text style={styles.settingsItemIcon}>👆</Text>
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Biometria</Text>
                <Text style={styles.settingsItemSubtitle}>Desativado</Text>
              </View>
              <Text style={styles.settingsItemArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Configurações do aplicativo */}
          <View style={styles.settingsCard}>
            <Text style={styles.settingsCardTitle}>⚙️ Aplicativo</Text>
            
            <TouchableOpacity style={styles.settingsItem}>
              <Text style={styles.settingsItemIcon}>ℹ️</Text>
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Sobre o VidaLink</Text>
                <Text style={styles.settingsItemSubtitle}>Versão 1.0.0</Text>
              </View>
              <Text style={styles.settingsItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsItem}>
              <Text style={styles.settingsItemIcon}>📋</Text>
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Termos de Uso</Text>
                <Text style={styles.settingsItemSubtitle}>Política de privacidade</Text>
              </View>
              <Text style={styles.settingsItemArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Ações perigosas */}
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingsItem} onPress={clearAllEvents}>
              <Text style={styles.settingsItemIcon}>🗑️</Text>
              <View style={styles.settingsItemContent}>
                <Text style={[styles.settingsItemTitle, { color: '#EF4444' }]}>Limpar Todos os Dados</Text>
                <Text style={styles.settingsItemSubtitle}>Esta ação não pode ser desfeita</Text>
              </View>
              <Text style={styles.settingsItemArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 15,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#43D39E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  sampleButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  qrButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  eventCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  eventDoctor: {
    fontSize: 16,
    color: '#4A90E2',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  eventDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  eventNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  clearButton: {
    margin: 20,
    backgroundColor: '#EF4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 20,
  },
  qrInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  formInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formGroupHalf: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: 'white',
    minWidth: '45%',
  },
  typeOptionSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#EBF4FF',
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  typeLabel: {
    fontSize: 16,
    color: '#666',
  },
  typeLabelSelected: {
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  prioritySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  priorityOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: 'white',
    minWidth: 70,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityLabelSelected: {
    color: 'white',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    padding: 10,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 10,
  },
  headerButtonText: {
    fontSize: 20,
    color: 'white',
  },
  eventDetailsContainer: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    flex: 1,
    padding: 20,
  },
  settingsContainer: {
    flex: 1,
    padding: 20,
  },
  tapToView: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: 'bold',
    marginTop: 5,
  },
  detailsHeader: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 20,
    color: 'white',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  detailsActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIconButton: {
    padding: 10,
  },
  editIconText: {
    fontSize: 20,
    color: 'white',
  },
  deleteIconButton: {
    padding: 10,
  },
  deleteIconText: {
    fontSize: 20,
    color: 'white',
  },
  detailsContent: {
    flex: 1,
  },
  eventDetailCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  eventDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  eventDetailInfo: {
    flex: 1,
  },
  eventDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDetailDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  detailSectionContent: {
    fontSize: 14,
    color: '#666',
  },
  profileCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  profileAvatar: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 100,
    marginBottom: 10,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  profileStatsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  profileStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  profileStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileStatItem: {
    alignItems: 'center',
  },
  profileStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  profileStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  profileInfoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  profileInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  profileInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileInfoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  profileInfoValue: {
    fontSize: 14,
    color: '#666',
  },
  settingsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  settingsCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingsItemIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingsItemArrow: {
    fontSize: 16,
    color: '#4A90E2',
  },
});
