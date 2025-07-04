-- Script para limpar completamente o banco de dados VidaLink
-- CUIDADO: Este script remove TODOS os dados existentes!

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS health_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS document_uploads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS qr_shares DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS access_logs DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "health_events_policy" ON health_events;
DROP POLICY IF EXISTS "document_uploads_policy" ON document_uploads;
DROP POLICY IF EXISTS "qr_shares_policy" ON qr_shares;
DROP POLICY IF EXISTS "access_logs_policy" ON access_logs;

-- Remover triggers existentes
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_health_events_updated_at ON health_events;
DROP TRIGGER IF EXISTS update_qr_shares_updated_at ON qr_shares;

-- Remover tabelas na ordem correta (respeitando foreign keys)
DROP TABLE IF EXISTS access_logs CASCADE;
DROP TABLE IF EXISTS document_uploads CASCADE;
DROP TABLE IF EXISTS qr_shares CASCADE;
DROP TABLE IF EXISTS health_events CASCADE;
DROP TABLE IF EXISTS health_event_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Remover funções
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS generate_qr_token();

-- Remover extensões (opcional - mantenha se outras aplicações usam)
-- DROP EXTENSION IF EXISTS "uuid-ossp";
-- DROP EXTENSION IF EXISTS "pgcrypto";

-- Mensagem de confirmação
SELECT 'Banco de dados limpo com sucesso!' as status; 