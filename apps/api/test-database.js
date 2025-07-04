/**
 * Script para testar se o banco de dados foi criado corretamente
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testDatabase() {
  console.log('🧪 Testando banco de dados VidaLink...\n');

  // Verifica se as variáveis de ambiente estão configuradas
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Erro: Variáveis de ambiente não configuradas');
    process.exit(1);
  }

  // Cria cliente Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🔍 Verificando tabelas criadas...');
    
    // Lista de tabelas esperadas
    const expectedTables = [
      'users',
      'health_events', 
      'document_uploads',
      'qr_shares',
      'access_logs',
      'health_event_types'
    ];

    // Testa cada tabela
    for (const table of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ Tabela '${table}': ${error.message}`);
        } else {
          console.log(`✅ Tabela '${table}': OK`);
        }
      } catch (err) {
        console.log(`❌ Tabela '${table}': ${err.message}`);
      }
    }

    console.log('\n🔍 Verificando dados iniciais...');
    
    // Verifica se os tipos de eventos foram inseridos
    const { data: eventTypes, error: eventTypesError } = await supabase
      .from('health_event_types')
      .select('id, name');

    if (eventTypesError) {
      console.log('❌ Tipos de eventos:', eventTypesError.message);
    } else {
      console.log(`✅ Tipos de eventos: ${eventTypes.length} registros encontrados`);
      eventTypes.forEach(type => {
        console.log(`   - ${type.id}: ${type.name}`);
      });
    }

    console.log('\n🎉 Teste do banco de dados concluído!');
    console.log('   O banco está pronto para uso.');

  } catch (error) {
    console.error('❌ Erro ao testar banco:', error.message);
    process.exit(1);
  }
}

testDatabase(); 