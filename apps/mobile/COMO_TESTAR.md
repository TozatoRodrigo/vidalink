# 🚀 Como Testar o VidaLink

> Guia rápido para testar a carteira digital de saúde

## 📱 Opção 1: Testar no Celular (Recomendado)

### Pré-requisitos
- **Celular** Android ou iPhone
- **App Expo Go** instalado
  - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iPhone - App Store](https://apps.apple.com/app/expo-go/id982107779)

### Passos
1. **Abra o terminal** no diretório `apps/mobile`
2. **Execute o script**:
   ```bash
   ./start.sh
   ```
3. **Aguarde** o QR Code aparecer
4. **Abra o Expo Go** no celular
5. **Escaneie o QR Code**
6. **Aguarde** o app carregar

## 💻 Opção 2: Testar no Emulador

### Android Studio
1. **Instale** o Android Studio
2. **Configure** um emulador Android
3. **Execute**:
   ```bash
   ./start.sh
   ```
4. **Pressione** `a` no terminal

### Xcode (macOS)
1. **Instale** o Xcode
2. **Execute**:
   ```bash
   ./start.sh
   ```
3. **Pressione** `i` no terminal

## 🎯 Funcionalidades para Testar

### 1. Primeiro Acesso
- ✅ **Onboarding** - 3 slides explicativos
- ✅ **Cadastro** - Criar conta local
- ✅ **Dashboard** - Tela principal vazia

### 2. Adicionar Eventos
- ✅ **Botão "+"** - Adicionar novo evento
- ✅ **Tipos diferentes** - Exame, consulta, vacina, etc.
- ✅ **Formulário** - Preencher dados básicos
- ✅ **Salvar** - Evento aparece na timeline

### 3. Visualizar Eventos
- ✅ **Timeline** - Lista cronológica
- ✅ **Cards coloridos** - Por tipo de evento
- ✅ **Detalhes** - Tocar para ver mais
- ✅ **Estatísticas** - Contadores no topo

### 4. Busca e Filtros
- ✅ **Buscar** - Campo de pesquisa
- ✅ **Filtrar** - Por tipo de evento
- ✅ **Ordenar** - Por data

### 5. Compartilhamento
- ✅ **QR Code** - Gerar código temporário
- ✅ **Configurações** - Tempo de expiração
- ✅ **Link** - Alternativa ao QR

### 6. Perfil
- ✅ **Dados pessoais** - Editar informações
- ✅ **Configurações** - Preferências do app
- ✅ **Backup** - Exportar/importar dados

## 🔧 Comandos Úteis

```bash
# Iniciar desenvolvimento
./start.sh

# Apenas instalar dependências
npm install

# Iniciar manualmente
npm run dev

# Testar no Android
npm run android

# Testar no iOS
npm run ios

# Verificar código
npm run lint
```

## 🐛 Problemas Comuns

### Erro: "Node.js não encontrado"
**Solução**: Instale o Node.js
- Download: https://nodejs.org/

### Erro: "Expo CLI não encontrado"
**Solução**: Instale globalmente
```bash
npm install -g @expo/cli
```

### Erro: "Metro bundler failed"
**Solução**: Limpe o cache
```bash
npx expo start --clear
```

### QR Code não funciona
**Soluções**:
1. Verifique se celular e computador estão na mesma rede WiFi
2. Tente usar o link manual no Expo Go
3. Reinicie o servidor (`r` no terminal)

### App não carrega no celular
**Soluções**:
1. Verifique a conexão de internet
2. Atualize o app Expo Go
3. Tente recarregar (balance o celular)

## 📊 Dados de Teste

O app vem com alguns dados de exemplo para facilitar os testes:

### Eventos Pré-cadastrados
- 🔬 **Exame de Sangue** - Hemograma completo
- 👩‍⚕️ **Consulta Cardiologista** - Check-up anual
- 💉 **Vacina COVID-19** - 3ª dose
- 💊 **Prescrição** - Medicamento para pressão

### Usuário de Teste
- **Nome**: Maria Silva
- **Email**: maria@exemplo.com
- **Telefone**: (11) 99999-9999

## 🎯 Cenários de Teste

### Cenário 1: Paciente Novo
1. Abrir app pela primeira vez
2. Passar pelo onboarding
3. Criar conta
4. Adicionar primeiro evento
5. Explorar funcionalidades

### Cenário 2: Uso Diário
1. Abrir dashboard
2. Ver estatísticas
3. Adicionar novo evento
4. Buscar evento antigo
5. Gerar QR Code

### Cenário 3: Consulta Médica
1. Gerar QR Code
2. Configurar acesso
3. Compartilhar com médico
4. Receber feedback
5. Atualizar eventos

## 🔄 Feedback

Encontrou algum problema ou tem sugestões?

1. **Issues**: Abra um issue no GitHub
2. **Email**: contato@vidalink.app
3. **WhatsApp**: (11) 99999-9999

---

**Boa sorte testando o VidaLink!** 🏥📱✨ 