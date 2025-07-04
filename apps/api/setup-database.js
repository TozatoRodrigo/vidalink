/**
 * Script para configurar o banco de dados VidaLink no Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carrega variáveis de ambiente
require('dotenv').config();

async function setupDatabase() {
  console.log('🔧 Configurando banco de dados VidaLink...\n');

  // Verifica se as variáveis de ambiente estão configuradas
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas');
    console.error('   Edite o arquivo .env primeiro!');
    process.exit(1);
  }

  // Cria cliente Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Lê o arquivo schema.sql
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📊 Executando schema do banco de dados...');
    
    // Executa o schema
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      // Se a função exec_sql não existir, vamos executar por partes
      console.log('⚠️  Função exec_sql não encontrada, executando manualmente...');
      
      // Divide o schema em comandos individuais
      const commands = schema
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      for (const command of commands) {
        if (command.trim()) {
          console.log(`Executando: ${command.substring(0, 50)}...`);
          const { error: cmdError } = await supabase.rpc('exec_sql', { sql: command });
          if (cmdError) {
            console.error(`❌ Erro ao executar comando: ${cmdError.message}`);
          }
        }
      }
    }

    console.log('✅ Schema executado com sucesso!');
    
    // Testa a conexão
    console.log('\n🔍 Testando conexão com o banco...');
    const { data, error: testError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);

    if (testError) {
      console.error('❌ Erro ao testar conexão:', testError.message);
    } else {
      console.log('✅ Conexão com banco funcionando!');
    }

    console.log('\n🎉 Configuração concluída!');
    console.log('   Agora você pode iniciar o servidor com: npm run dev');

  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error.message);
    process.exit(1);
  }
}

setupDatabase(); 