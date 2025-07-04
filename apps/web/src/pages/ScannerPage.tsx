import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import { motion, AnimatePresence } from 'framer-motion';

interface ScannerPageProps {}

interface PatientData {
  id: string;
  name: string;
  birthDate: string;
  events: HealthEvent[];
  accessType: 'read' | 'export';
  expiresAt: string;
  sharedBy: string;
}

interface HealthEvent {
  id: string;
  type: 'exam' | 'consultation' | 'vaccination' | 'medication' | 'surgery' | 'emergency' | 'other';
  title: string;
  description?: string;
  date: string;
  doctorName?: string;
  institution?: string;
  attachmentUrl?: string;
  aiSummary?: string;
}

export const ScannerPage: React.FC<ScannerPageProps> = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setError(null);

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detectado:', result.data);
          setScanResult(result.data);
          handleScanSuccess(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
      );

      qrScannerRef.current = qrScanner;
      await qrScanner.start();
    } catch (err) {
      console.error('Erro ao iniciar scanner:', err);
      setError('Erro ao acessar câmera. Verifique as permissões.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanSuccess = async (data: string) => {
    stopScanning();
    
    // Extrair token da URL ou usar diretamente
    let token = data;
    if (data.includes('/access/')) {
      token = data.split('/access/')[1];
    }
    
    await validateToken(token);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    
    await validateToken(manualToken.trim().toUpperCase());
  };

  const validateToken = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simular validação do token
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Dados mock para demonstração
      const mockPatientData: PatientData = {
        id: 'patient1',
        name: 'Maria Silva Santos',
        birthDate: '1985-03-15',
        accessType: 'read',
        expiresAt: '2024-07-02T15:30:00Z',
        sharedBy: 'Paciente',
        events: [
          {
            id: '1',
            type: 'exam',
            title: 'Hemograma Completo',
            description: 'Exame de sangue para avaliar componentes sanguíneos',
            date: '2024-01-15T09:00:00Z',
            doctorName: 'Dr. Pedro Oliveira',
            institution: 'Laboratório Central',
            attachmentUrl: 'https://example.com/exam1.pdf',
            aiSummary: 'Resultados dentro dos valores normais. Hemoglobina: 14.2 g/dL (normal). Leucócitos: 7.500/mm³ (normal). Plaquetas: 280.000/mm³ (normal).',
          },
          {
            id: '2',
            type: 'consultation',
            title: 'Consulta Cardiológica',
            description: 'Avaliação cardiovascular de rotina com ECG',
            date: '2024-01-10T14:30:00Z',
            doctorName: 'Dr. João Santos',
            institution: 'Hospital São Lucas',
            aiSummary: 'Exame físico normal. ECG: ritmo sinusal, frequência 72 bpm. Pressão arterial: 120/80 mmHg. Recomendado acompanhamento anual.',
          },
          {
            id: '3',
            type: 'vaccination',
            title: 'Vacina Influenza 2024',
            description: 'Vacinação anual contra gripe',
            date: '2024-01-05T11:00:00Z',
            institution: 'UBS Centro',
            aiSummary: 'Vacinação realizada sem intercorrências. Lote: ABC123. Próxima dose: 2025.',
          },
        ],
      };

      // Simular erro para tokens inválidos
      if (token.length !== 8) {
        throw new Error('Token inválido');
      }

      setPatientData(mockPatientData);
      setScanResult(token);
    } catch (err) {
      setError('Token inválido ou expirado. Verifique o código e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setPatientData(null);
    setScanResult(null);
    setError(null);
    setManualToken('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      exam: 'bg-blue-100 text-blue-800',
      consultation: 'bg-green-100 text-green-800',
      vaccination: 'bg-purple-100 text-purple-800',
      medication: 'bg-orange-100 text-orange-800',
      surgery: 'bg-red-100 text-red-800',
      emergency: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (patientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  📋 Timeline do Paciente
                </h1>
                <p className="text-gray-600 mt-1">
                  Acesso via token: {scanResult}
                </p>
              </div>
              <button
                onClick={resetScanner}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Novo Scanner
              </button>
            </div>
          </motion.div>

          {/* Patient Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  👤 {patientData.name}
                </h2>
                <p className="text-gray-600">
                  Data de Nascimento: {formatDate(patientData.birthDate)}
                </p>
                <p className="text-gray-600">
                  Idade: {new Date().getFullYear() - new Date(patientData.birthDate).getFullYear()} anos
                </p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  patientData.accessType === 'read' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {patientData.accessType === 'read' ? '👁️ Visualizar' : '📤 Exportar'}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Expira: {formatDateTime(patientData.expiresAt)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Events Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📅 Eventos Médicos ({patientData.events.length})
            </h3>

            {patientData.events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{getEventIcon(event.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {event.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {event.description}
                      </p>

                      <div className="space-y-1 text-sm text-gray-500">
                        <p>📅 Data: {formatDateTime(event.date)}</p>
                        {event.doctorName && (
                          <p>👨‍⚕️ Médico: {event.doctorName}</p>
                        )}
                        {event.institution && (
                          <p>🏥 Instituição: {event.institution}</p>
                        )}
                      </div>

                      {event.aiSummary && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            🤖 Resumo IA:
                          </p>
                          <p className="text-sm text-blue-800">
                            {event.aiSummary}
                          </p>
                        </div>
                      )}

                      {event.attachmentUrl && (
                        <div className="mt-4">
                          <a
                            href={event.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <span>📎</span>
                            <span>Ver Documento</span>
                            <span>↗</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Export Options */}
          {patientData.accessType === 'export' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6 mt-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📤 Opções de Exportação
              </h3>
              <div className="flex space-x-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  📄 Exportar PDF
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  📊 Exportar CSV
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  📧 Enviar por Email
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔍 Scanner Médico VidaLink
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escaneie o QR Code do paciente ou insira o token manualmente para acessar 
            a timeline médica de forma segura e temporária.
          </p>
        </motion.div>

        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-2 inline-flex">
            <button
              onClick={() => setScanMode('camera')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                scanMode === 'camera'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📷 Scanner QR Code
            </button>
            <button
              onClick={() => setScanMode('manual')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                scanMode === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⌨️ Token Manual
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {scanMode === 'camera' ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  📱 Scanner de QR Code
                </h2>
                
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                    style={{ display: isScanning ? 'block' : 'none' }}
                  />
                  
                  {!isScanning && (
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📷</div>
                        <p className="text-gray-600">
                          Clique em "Iniciar Scanner" para começar
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  {!isScanning ? (
                    <button
                      onClick={startScanning}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Carregando...' : '📷 Iniciar Scanner'}
                    </button>
                  ) : (
                    <button
                      onClick={stopScanning}
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      ⏹️ Parar Scanner
                    </button>
                  )}
                </div>

                <div className="mt-4 text-sm text-gray-500 text-center">
                  💡 Posicione o QR Code do paciente na frente da câmera
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  ⌨️ Token Manual
                </h2>
                
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código do Paciente
                    </label>
                    <input
                      type="text"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                      placeholder="Ex: ABC12345"
                      maxLength={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || manualToken.length !== 8}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Validando...' : '🔍 Acessar Timeline'}
                  </button>
                </form>

                <div className="mt-4 text-sm text-gray-500 text-center">
                  💡 Insira o código de 8 dígitos fornecido pelo paciente
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto mt-6"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-400 text-xl mr-3">⚠️</div>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Erro de Acesso
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto mt-12"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Como Usar o Scanner
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">1.</span>
                <p>O paciente gera um QR Code no app móvel VidaLink</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">2.</span>
                <p>Escolha entre scanner de câmera ou inserção manual do token</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">3.</span>
                <p>Acesse a timeline médica do paciente de forma segura</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">4.</span>
                <p>Visualize ou exporte os dados conforme autorizado</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 