/**
 * @fileoverview Configuração do cliente Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// Em desenvolvimento, permite usar valores placeholder
if (process.env.NODE_ENV === 'production' && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas para produção');
}

// Cliente Supabase com service role para operações do backend
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: (url, options = {}) => {
      console.log('🌐 Supabase fetch:', url);
      return fetch(url, options).catch(err => {
        console.error('❌ Fetch error:', err.message);
        throw err;
      });
    }
  }
});

// Cliente Supabase para operações de autenticação
export const supabaseAuth = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY || supabaseServiceKey
); 