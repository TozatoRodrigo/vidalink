import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, FileText } from 'lucide-react';

export const PatientTimelinePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/access');
  };

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
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Maria Silva Santos</h1>
              <p className="text-gray-500">15/03/1985 • Feminino • Token: {token}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl p-8 shadow-card text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Timeline do Paciente
          </h2>
          
          <p className="text-gray-600 mb-8">
            Esta funcionalidade será implementada em breve. Aqui o médico poderá visualizar:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Timeline Cronológica</h3>
              <p className="text-sm text-gray-600">
                Eventos de saúde organizados por data, com filtros por tipo
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">📁 Documentos</h3>
              <p className="text-sm text-gray-600">
                Visualização de exames, receitas e relatórios médicos
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">🤖 Resumos IA</h3>
              <p className="text-sm text-gray-600">
                Interpretações automáticas em linguagem simples
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">📤 Exportação</h3>
              <p className="text-sm text-gray-600">
                Download em PDF para prontuário médico
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-700">
              ✅ Acesso autorizado com token: <code className="font-mono">{token}</code>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}; 