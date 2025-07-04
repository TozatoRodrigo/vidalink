import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const AccessPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsLoading(true);
    
    // Simular validação
    setTimeout(() => {
      // Redirecionar para timeline ou mostrar dados
      console.log('Token validado:', token);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏥 VidaLink - Acesso Médico
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Acesse a timeline médica do paciente de forma segura e temporária
          </p>
        </motion.div>

        {/* Main Options */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* QR Scanner Option */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow"
          >
            <div className="text-6xl mb-6">📱</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Scanner de QR Code
            </h2>
            <p className="text-gray-600 mb-6">
              Use a câmera para escanear o QR Code mostrado pelo paciente. 
              Método mais rápido e conveniente.
            </p>
            <a
              href="/scanner"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              📷 Abrir Scanner
            </a>
          </motion.div>

          {/* Manual Token Option */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⌨️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Token Manual
              </h2>
              <p className="text-gray-600">
                Insira o código de 8 dígitos fornecido pelo paciente
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Acesso
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC12345"
                  maxLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || token.length !== 8}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Validando...' : '🔍 Acessar Timeline'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            🔒 Acesso Seguro e Controlado
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl mb-3">⏰</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Acesso Temporário
              </h4>
              <p className="text-sm text-gray-600">
                Tokens expiram automaticamente (1h, 24h ou 7 dias)
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl mb-3">👁️</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Permissões Granulares
              </h4>
              <p className="text-sm text-gray-600">
                Apenas visualizar ou visualizar + exportar dados
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Auditoria Completa
              </h4>
              <p className="text-sm text-gray-600">
                Paciente recebe log de todos os acessos realizados
              </p>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto mt-12"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Como Funciona
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">1.</span>
                <p>Paciente gera QR Code no app VidaLink selecionando eventos médicos</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">2.</span>
                <p>Médico escaneia QR Code ou insere token manual de 8 dígitos</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">3.</span>
                <p>Sistema valida token e exibe timeline médica autorizada</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">4.</span>
                <p>Médico visualiza dados e pode exportar se autorizado</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">5.</span>
                <p>Paciente recebe notificação do acesso realizado</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-12 text-gray-500"
        >
          <p className="text-sm">
            🔐 Todos os acessos são registrados e auditados para máxima segurança
          </p>
        </motion.div>
      </div>
    </div>
  );
}; 