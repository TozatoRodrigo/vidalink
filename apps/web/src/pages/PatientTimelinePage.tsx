import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, FileText, Plus, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { DocumentUpload, DocumentList } from '../components/DocumentUpload';
import { documentService } from '../services/documentService';
import toast from 'react-hot-toast';

interface HealthEvent {
  id: string;
  type: 'exam' | 'consultation' | 'vaccination' | 'medication' | 'surgery' | 'emergency' | 'other';
  title: string;
  description: string;
  date: string;
  doctorName?: string;
  institution?: string;
  aiSummary?: string;
  documents: DocumentUpload[];
}

interface PatientData {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  events: HealthEvent[];
}

export const PatientTimelinePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [uploadingEventId, setUploadingEventId] = useState<string | null>(null);

  useEffect(() => {
    loadPatientData();
  }, [token]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Simular carregamento de dados do paciente
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mock para demonstração
      const mockData: PatientData = {
        id: 'patient1',
        name: 'Maria Silva Santos',
        birthDate: '15/03/1985',
        gender: 'Feminino',
        events: [
          {
            id: 'event1',
            type: 'exam',
            title: 'Hemograma Completo',
            description: 'Exame de sangue para avaliar componentes sanguíneos',
            date: '2024-01-15T09:00:00Z',
            doctorName: 'Dr. Pedro Oliveira',
            institution: 'Laboratório Central',
            aiSummary: 'Resultados dentro dos valores normais. Hemoglobina: 14.2 g/dL (normal). Leucócitos: 7.500/mm³ (normal). Plaquetas: 280.000/mm³ (normal).',
            documents: []
          },
          {
            id: 'event2',
            type: 'consultation',
            title: 'Consulta Cardiológica',
            description: 'Avaliação cardiovascular de rotina com ECG',
            date: '2024-01-10T14:30:00Z',
            doctorName: 'Dr. João Santos',
            institution: 'Hospital São Lucas',
            aiSummary: 'Exame físico normal. ECG: ritmo sinusal, frequência 72 bpm. Pressão arterial: 120/80 mmHg. Recomendado acompanhamento anual.',
            documents: []
          },
          {
            id: 'event3',
            type: 'vaccination',
            title: 'Vacina Influenza 2024',
            description: 'Vacinação anual contra gripe',
            date: '2024-01-05T11:00:00Z',
            institution: 'UBS Centro',
            aiSummary: 'Vacinação realizada sem intercorrências. Lote: ABC123. Próxima dose: 2025.',
            documents: []
          }
        ]
      };

      setPatientData(mockData);
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error);
      toast.error('Erro ao carregar dados do paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/access');
  };

  const handleUploadDocuments = async (files: File[]) => {
    if (!uploadingEventId) return;

    try {
      // Simular upload para demonstração
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockDocuments: DocumentUpload[] = files.map((file, index) => ({
        id: `doc_${Date.now()}_${index}`,
        health_event_id: uploadingEventId,
        user_id: 'user1',
        original_name: file.name,
        file_path: `/documents/${file.name}`,
        file_url: URL.createObjectURL(file),
        file_size: file.size,
        mime_type: file.type,
        file_type: file.type.startsWith('image/') ? 'image' : 
                   file.type === 'application/pdf' ? 'pdf' : 'document',
        processing_status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Atualizar dados do paciente
      if (patientData) {
        const updatedEvents = patientData.events.map(event => 
          event.id === uploadingEventId 
            ? { ...event, documents: [...event.documents, ...mockDocuments] }
            : event
        );
        setPatientData({ ...patientData, events: updatedEvents });
      }

      toast.success('Documentos enviados com sucesso!');
      setShowUploadModal(false);
      setUploadingEventId(null);
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar documentos');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      if (patientData) {
        const updatedEvents = patientData.events.map(event => ({
          ...event,
          documents: event.documents.filter(doc => doc.id !== documentId)
        }));
        setPatientData({ ...patientData, events: updatedEvents });
      }
      
      toast.success('Documento removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover documento:', error);
      toast.error('Erro ao remover documento');
    }
  };

  const openUploadModal = (eventId: string) => {
    setUploadingEventId(eventId);
    setShowUploadModal(true);
  };

  const getEventIcon = (type: string) => {
    const icons = {
      exam: '🔬',
      consultation: '👨‍⚕️',
      vaccination: '💉',
      medication: '💊',
      surgery: '🏥',
      emergency: '🚨',
      other: '📋',
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const getEventColor = (type: string) => {
    const colors = {
      exam: 'bg-blue-100 text-blue-800 border-blue-200',
      consultation: 'bg-green-100 text-green-800 border-green-200',
      vaccination: 'bg-purple-100 text-purple-800 border-purple-200',
      medication: 'bg-orange-100 text-orange-800 border-orange-200',
      surgery: 'bg-red-100 text-red-800 border-red-200',
      emergency: 'bg-red-100 text-red-800 border-red-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredEvents = patientData?.events.filter(event => 
    filterType === 'all' || event.type === filterType
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do paciente...</p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados do paciente</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Sessão expira em: 25min</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Patient Info */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{patientData.name}</h1>
                <p className="text-gray-500">{patientData.birthDate} • {patientData.gender} • Token: {token}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {filteredEvents.length} evento(s) de saúde
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="w-4 h-4" />
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os eventos</option>
              <option value="exam">Exames</option>
              <option value="consultation">Consultas</option>
              <option value="vaccination">Vacinações</option>
              <option value="medication">Medicamentos</option>
              <option value="surgery">Cirurgias</option>
              <option value="emergency">Emergências</option>
              <option value="other">Outros</option>
            </select>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{getEventIcon(event.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEventColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{event.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📅 {formatDate(event.date)}</span>
                        {event.doctorName && <span>👨‍⚕️ {event.doctorName}</span>}
                        {event.institution && <span>🏥 {event.institution}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => openUploadModal(event.id)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Anexar</span>
                  </button>
                </div>

                {/* AI Summary */}
                {event.aiSummary && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-green-800">🤖 Resumo IA</span>
                    </div>
                    <p className="text-sm text-green-700">{event.aiSummary}</p>
                  </div>
                )}

                {/* Documents */}
                {event.documents.length > 0 && (
                  <div className="mt-6">
                    <DocumentList
                      documents={event.documents}
                      onDeleteDocument={handleDeleteDocument}
                      editable={true}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum evento encontrado
            </h3>
            <p className="text-gray-500">
              {filterType === 'all' 
                ? 'Este paciente ainda não possui eventos de saúde registrados.'
                : `Nenhum evento do tipo "${filterType}" encontrado.`
              }
            </p>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && uploadingEventId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Anexar Documentos
                </h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadingEventId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <DocumentUpload
                onUpload={handleUploadDocuments}
                healthEventId={uploadingEventId}
                maxFiles={5}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 