import React from 'react';
import { motion } from 'framer-motion';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🏥</div>
              <h1 className="text-xl font-bold text-gray-900">VidaLink</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="/access" className="text-gray-600 hover:text-gray-900">
                Acessar Timeline
              </a>
              <a href="/scanner" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Scanner QR
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Carteira de Saúde Digital
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Acesse timelines médicas de pacientes de forma segura e temporária. 
              Sistema de compartilhamento via QR Code para profissionais de saúde.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/scanner"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg"
            >
              📱 Scanner QR Code
            </a>
            <a
              href="/access"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-blue-50 transition-colors text-lg"
            >
              ⌨️ Token Manual
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Como Funciona
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                1. Paciente Gera QR
              </h3>
              <p className="text-gray-600">
                No app móvel, o paciente seleciona eventos médicos e gera um QR Code 
                com tempo de expiração definido.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2. Médico Escaneia
              </h3>
              <p className="text-gray-600">
                O profissional usa este portal web para escanear o QR Code 
                ou inserir o token manualmente.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3. Acesso Seguro
              </h3>
              <p className="text-gray-600">
                Timeline médica é exibida com permissões controladas: 
                apenas visualizar ou visualizar + exportar.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Vantagens para Médicos
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6">
                <div className="text-3xl mb-3">⚡</div>
                <h4 className="font-semibold text-gray-900 mb-2">Acesso Rápido</h4>
                <p className="text-sm text-gray-600">
                  QR Code ou token de 8 dígitos para acesso instantâneo
                </p>
              </div>

              <div className="text-center p-6">
                <div className="text-3xl mb-3">🔒</div>
                <h4 className="font-semibold text-gray-900 mb-2">Seguro</h4>
                <p className="text-sm text-gray-600">
                  Tokens temporários com expiração automática
                </p>
              </div>

              <div className="text-center p-6">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-semibold text-gray-900 mb-2">Completo</h4>
                <p className="text-sm text-gray-600">
                  Timeline completa com exames, consultas e documentos
                </p>
              </div>

              <div className="text-center p-6">
                <div className="text-3xl mb-3">📤</div>
                <h4 className="font-semibold text-gray-900 mb-2">Exportável</h4>
                <p className="text-sm text-gray-600">
                  PDF, CSV e integração com sistemas hospitalares
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Pronto para Começar?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Acesse timelines médicas de forma segura e eficiente. 
              Basta ter o QR Code ou token do paciente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/scanner"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg"
              >
                📱 Abrir Scanner
              </a>
              <a
                href="/access"
                className="bg-blue-700 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-800 transition-colors text-lg"
              >
                ⌨️ Inserir Token
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="text-2xl">🏥</div>
            <h3 className="text-xl font-bold">VidaLink</h3>
          </div>
          <p className="text-gray-400">
            Carteira de saúde digital segura e acessível para todos
          </p>
        </div>
      </footer>
    </div>
  );
}; 