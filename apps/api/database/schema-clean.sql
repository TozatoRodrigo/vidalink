-- VidaLink Database Schema - Versão Limpa para Supabase
-- PostgreSQL/Supabase Schema para carteira de saúde digital

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- TABELA: users
-- Armazena informações dos usuários (pacientes)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(10),
  blood_type VARCHAR(5),
  allergies TEXT[],
  medical_conditions TEXT[],
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  profile_picture_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- TABELA: health_event_types
-- Tipos de eventos de saúde predefinidos
CREATE TABLE IF NOT EXISTS health_event_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dados iniciais para tipos de eventos
INSERT INTO health_event_types (id, name, description, icon, color) VALUES
('exam', 'Exame', 'Exames médicos e laboratoriais', 'test-tube', '#3B82F6'),
('consultation', 'Consulta', 'Consultas médicas e especializadas', 'user-md', '#10B981'),
('vaccination', 'Vacinação', 'Vacinas e imunizações', 'syringe', '#8B5CF6'),
('medication', 'Medicamento', 'Prescrições e medicamentos', 'pills', '#F59E0B'),
('surgery', 'Cirurgia', 'Procedimentos cirúrgicos', 'cut', '#EF4444'),
('emergency', 'Emergência', 'Atendimentos de emergência', 'ambulance', '#DC2626'),
('other', 'Outro', 'Outros eventos de saúde', 'plus-circle', '#6B7280')
ON CONFLICT (id) DO NOTHING;

-- TABELA: health_events
-- Armazena eventos de saúde dos usuários
CREATE TABLE IF NOT EXISTS health_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type_id VARCHAR(50) NOT NULL REFERENCES health_event_types(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  location VARCHAR(255),
  doctor_name VARCHAR(255),
  doctor_crm VARCHAR(20),
  hospital_clinic VARCHAR(255),
  medications TEXT[],
  observations TEXT,
  severity VARCHAR(20) DEFAULT 'normal',
  is_emergency BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_health_events_updated_at ON health_events;

-- Criar trigger para health_events
CREATE TRIGGER update_health_events_updated_at
    BEFORE UPDATE ON health_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- TABELA: document_uploads
-- Armazena documentos/anexos dos eventos de saúde
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  health_event_id UUID NOT NULL REFERENCES health_events(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TABELA: qr_shares
-- Armazena tokens de compartilhamento QR Code
CREATE TABLE IF NOT EXISTS qr_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  share_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  access_level VARCHAR(20) DEFAULT 'read',
  allowed_events UUID[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_qr_shares_updated_at ON qr_shares;

-- Criar trigger para qr_shares
CREATE TRIGGER update_qr_shares_updated_at
    BEFORE UPDATE ON qr_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- TABELA: access_logs
-- Log de acessos aos dados compartilhados
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  qr_share_id UUID REFERENCES qr_shares(id) ON DELETE SET NULL,
  accessed_by_email VARCHAR(255),
  accessed_by_name VARCHAR(255),
  access_type VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES PARA PERFORMANCE

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_health_events_user_id ON health_events(user_id);
CREATE INDEX IF NOT EXISTS idx_health_events_date ON health_events(event_date);
CREATE INDEX IF NOT EXISTS idx_health_events_type ON health_events(event_type_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_health_event_id ON document_uploads(health_event_id);
CREATE INDEX IF NOT EXISTS idx_qr_shares_user_id ON qr_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_shares_token ON qr_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_qr_shares_expires_at ON qr_shares(expires_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_qr_share_id ON access_logs(qr_share_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed_at ON access_logs(accessed_at);

-- POLÍTICAS DE SEGURANÇA RLS (Row Level Security)

-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para users (usuários só veem seus próprios dados)
DROP POLICY IF EXISTS "users_policy" ON users;
CREATE POLICY "users_policy" ON users
    FOR ALL USING (auth.uid() = id);

-- Políticas para health_events
DROP POLICY IF EXISTS "health_events_policy" ON health_events;
CREATE POLICY "health_events_policy" ON health_events
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para document_uploads
DROP POLICY IF EXISTS "document_uploads_policy" ON document_uploads;
CREATE POLICY "document_uploads_policy" ON document_uploads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM health_events 
            WHERE health_events.id = document_uploads.health_event_id 
            AND health_events.user_id = auth.uid()
        )
    );

-- Políticas para qr_shares
DROP POLICY IF EXISTS "qr_shares_policy" ON qr_shares;
CREATE POLICY "qr_shares_policy" ON qr_shares
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para access_logs
DROP POLICY IF EXISTS "access_logs_policy" ON access_logs;
CREATE POLICY "access_logs_policy" ON access_logs
    FOR ALL USING (auth.uid() = user_id);

-- FUNÇÕES AUXILIARES

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
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar tokens QR expirados
CREATE OR REPLACE FUNCTION cleanup_expired_qr_shares()
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