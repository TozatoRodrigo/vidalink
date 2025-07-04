-- ============================================================================
-- VidaLink Database Schema
-- PostgreSQL/Supabase Schema para carteira de saúde digital
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABELA: users
-- Armazena informações dos usuários (pacientes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  profile_picture_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA: health_events
-- Armazena eventos de saúde dos usuários
-- ============================================================================
CREATE TABLE IF NOT EXISTS health_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('exam', 'consultation', 'vaccination', 'medication', 'surgery', 'emergency', 'other')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  doctor_name VARCHAR(255),
  institution VARCHAR(255),
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA: document_uploads
-- Armazena documentos/anexos dos eventos de saúde
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  health_event_id UUID NOT NULL REFERENCES health_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'pdf', 'document', 'other')),
  ocr_text TEXT,
  ai_summary TEXT,
  processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA: qr_shares
-- Armazena tokens de compartilhamento QR Code
-- ============================================================================
CREATE TABLE IF NOT EXISTS qr_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(8) UNIQUE NOT NULL,
  event_ids UUID[] NOT NULL,
  access_type VARCHAR(20) NOT NULL DEFAULT 'read' CHECK (access_type IN ('read', 'export')),
  doctor_name VARCHAR(255),
  doctor_email VARCHAR(255),
  institution VARCHAR(255),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  access_count INTEGER DEFAULT 0,
  max_access INTEGER DEFAULT 10,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA: access_logs
-- Log de acessos aos dados compartilhados
-- ============================================================================
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_share_id UUID NOT NULL REFERENCES qr_shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accessed_by_ip VARCHAR(45),
  accessed_by_user_agent TEXT,
  access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('view', 'export')),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Índices para health_events
CREATE INDEX IF NOT EXISTS idx_health_events_user_id ON health_events(user_id);
CREATE INDEX IF NOT EXISTS idx_health_events_event_date ON health_events(event_date);
CREATE INDEX IF NOT EXISTS idx_health_events_type ON health_events(type);
CREATE INDEX IF NOT EXISTS idx_health_events_created_at ON health_events(created_at);

-- Índices para document_uploads
CREATE INDEX IF NOT EXISTS idx_document_uploads_health_event_id ON document_uploads(health_event_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_user_id ON document_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_processing_status ON document_uploads(processing_status);

-- Índices para qr_shares
CREATE INDEX IF NOT EXISTS idx_qr_shares_token ON qr_shares(token);
CREATE INDEX IF NOT EXISTS idx_qr_shares_user_id ON qr_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_shares_expires_at ON qr_shares(expires_at);
CREATE INDEX IF NOT EXISTS idx_qr_shares_is_active ON qr_shares(is_active);

-- Índices para access_logs
CREATE INDEX IF NOT EXISTS idx_access_logs_qr_share_id ON access_logs(qr_share_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed_at ON access_logs(accessed_at);

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_events_updated_at BEFORE UPDATE ON health_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_uploads_updated_at BEFORE UPDATE ON document_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qr_shares_updated_at BEFORE UPDATE ON qr_shares FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para users (usuários só veem seus próprios dados)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para health_events
CREATE POLICY "Users can view own health events" ON health_events FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own health events" ON health_events FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own health events" ON health_events FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own health events" ON health_events FOR DELETE USING (auth.uid()::text = user_id::text);

-- Políticas para document_uploads
CREATE POLICY "Users can view own documents" ON document_uploads FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own documents" ON document_uploads FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own documents" ON document_uploads FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own documents" ON document_uploads FOR DELETE USING (auth.uid()::text = user_id::text);

-- Políticas para qr_shares
CREATE POLICY "Users can view own qr shares" ON qr_shares FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own qr shares" ON qr_shares FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own qr shares" ON qr_shares FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own qr shares" ON qr_shares FOR DELETE USING (auth.uid()::text = user_id::text);

-- Políticas para access_logs
CREATE POLICY "Users can view own access logs" ON access_logs FOR SELECT USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para gerar token QR único
CREATE OR REPLACE FUNCTION generate_qr_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  -- Verifica se o token já existe
  IF EXISTS (SELECT 1 FROM qr_shares WHERE token = result) THEN
    RETURN generate_qr_token(); -- Recursão para gerar novo token
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE qr_shares 
  SET is_active = false 
  WHERE expires_at < NOW() AND is_active = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================================================

-- Inserir tipos de eventos de saúde como referência
-- (Isso pode ser usado para validação no frontend)
CREATE TABLE IF NOT EXISTS health_event_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7)
);

INSERT INTO health_event_types (id, name, description, icon, color) VALUES
('exam', 'Exame', 'Exames laboratoriais, imagem e outros', 'test-tube', '#3B82F6'),
('consultation', 'Consulta', 'Consultas médicas e avaliações', 'stethoscope', '#10B981'),
('vaccination', 'Vacinação', 'Vacinas e imunizações', 'syringe', '#F59E0B'),
('medication', 'Medicação', 'Prescrições e medicamentos', 'pill', '#EF4444'),
('surgery', 'Cirurgia', 'Procedimentos cirúrgicos', 'scissors', '#8B5CF6'),
('emergency', 'Emergência', 'Atendimentos de emergência', 'alert-triangle', '#DC2626'),
('other', 'Outros', 'Outros eventos de saúde', 'file-text', '#6B7280')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMENTÁRIOS FINAIS
-- ============================================================================

-- Schema criado com sucesso!
-- Execute este script no Supabase SQL Editor para criar todas as tabelas
-- Lembre-se de configurar as variáveis de ambiente no backend:
-- - SUPABASE_URL
-- - SUPABASE_SERVICE_ROLE_KEY
-- - SUPABASE_ANON_KEY 