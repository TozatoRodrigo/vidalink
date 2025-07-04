# 🎨 VidaLink Frontend Guide

## 📱 **Apps Criados**

### **Mobile (React Native + Expo)**
- **Paciente**: Carteira digital de saúde
- **Localização**: `apps/mobile/`
- **Tech Stack**: React Native, Expo Router, NativeWind

### **Web (React + Vite)**
- **Médico**: Visualização do histórico via QR
- **Localização**: `apps/web/`
- **Tech Stack**: React, Vite, Tailwind CSS

## 🎨 **Design System Implementado**

### **Cores Principais**
```typescript
primary: '#4A90E2'    // Azul claro
secondary: '#43D39E'  // Verde menta
```

### **Cores por Tipo de Evento**
```typescript
exam: '#4A90E2'        // Exames - Azul
consultation: '#10B981' // Consultas - Verde
vaccination: '#8B5CF6'  // Vacinas - Roxo
medication: '#F59E0B'   // Medicamentos - Âmbar
surgery: '#EF4444'      // Cirurgias - Vermelho
```

### **Tipografia**
- **Fonte**: Inter (humanista, acessível)
- **Escalas**: 12px → 36px
- **Pesos**: normal, medium, semibold, bold

## 🧩 **Componentes Mobile Criados**

### **1. HealthEventCard** ⭐
**Componente mais importante** - Cartão de evento de saúde

```typescript
<HealthEventCard
  event={healthEvent}
  onPress={() => navigateToDetails(event)}
  showDetails={false}
/>
```

**Features implementadas:**
- ✅ Ícone colorido por tipo
- ✅ Data formatada  
- ✅ Título e descrição
- ✅ Médico/instituição
- ✅ Badges de anexo e IA
- ✅ Tap para ver detalhes

### **2. Button** 
Botão reutilizável com variantes

```typescript
<Button
  title="Salvar"
  onPress={handleSave}
  variant="primary"    // primary | secondary | outline | ghost
  size="medium"        // small | medium | large
  loading={isLoading}
  fullWidth
/>
```

### **3. Input**
Campo de entrada com validação

```typescript
<Input
  label="E-mail"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  variant="outline"    // default | filled | outline
  leftIcon={<EmailIcon />}
/>
```

### **4. Card**
Container base para conteúdo

```typescript
<Card
  padding="medium"     // none | small | medium | large
  shadow="small"       // none | small | medium | large
  borderRadius="medium"
>
  {children}
</Card>
```

### **5. Loading States**
```typescript
<HealthEventCardSkeleton />  // Skeleton específico
<LoadingSpinner size="large" />  // Spinner geral
```

## 📱 **Telas Mobile Implementadas**

### **1. Index (Splash)**
- ✅ Logo e loading inicial
- ✅ Redirect automático para onboarding

### **2. Onboarding**
- ✅ 3 slides explicativos
- ✅ Indicadores de progresso
- ✅ Botão "Começar"

### **3. Login**
- ✅ Formulário com validação
- ✅ Estados de loading
- ✅ Link para cadastro

### **4. Dashboard (Exemplo)**
- ✅ Header com saudação
- ✅ Cards de estatísticas
- ✅ Timeline com HealthEventCards
- ✅ FAB para novo evento
- ✅ Loading com skeletons

```typescript
// Exemplo de uso completo
export const DashboardScreen = () => {
  const { data: events, isLoading } = useHealthEvents();

  return (
    <SafeAreaView style={{ backgroundColor: Colors.background.secondary }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={TextStyles.h2}>Olá, Maria! 👋</Text>
        <Button title="QR Code" variant="outline" size="small" />
      </View>

      {/* Timeline */}
      <ScrollView>
        {isLoading ? (
          <HealthEventCardSkeleton />
        ) : (
          events.map(event => (
            <HealthEventCard 
              key={event.id}
              event={event}
              onPress={() => navigateToDetails(event)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
```

## 🌐 **App Web Implementado**

### **1. HomePage**
- ✅ Landing page para médicos
- ✅ Hero section explicativa
- ✅ Grid de features (segurança, timeline, IA)
- ✅ CTA para acesso

### **2. AccessPage**
- ✅ Input para código QR
- ✅ Botão scanner (placeholder)
- ✅ Validação e loading
- ✅ Avisos de segurança

### **3. PatientTimelinePage (Planejada)**
- 📋 Timeline do paciente
- 📋 Filtros por tipo
- 📋 Exportação PDF

## 🎯 **Como Solicitar Novas Funcionalidades**

Use o formato definido no `EXAMPLE_TASK.md`:

```markdown
🧩 Componente: NovoComponente

📄 Descrição: Breve descrição da funcionalidade

📥 Input: Dados de entrada esperados

📤 Output: Resultado/comportamento esperado

📌 Observações: Regras de negócio específicas
```

## 🚀 **Comandos para Desenvolvimento**

### **Mobile**
```bash
cd apps/mobile
npm run dev          # Expo start
npm run android      # Android emulator
npm run ios          # iOS simulator
```

### **Web**
```bash
cd apps/web
npm run dev          # Vite dev server
npm run build        # Build produção
```

## ✅ **Status Atual**

### **Concluído**
- [x] Design system completo
- [x] Componentes base mobile
- [x] HealthEventCard (componente principal)
- [x] Telas de onboarding e login
- [x] Dashboard com timeline
- [x] App web básico
- [x] Loading states e skeletons

### **Próximos Passos Sugeridos**
1. **📸 Upload de documentos** - Câmera + galeria
2. **🔍 OCR** - Extrair texto de exames
3. **📱 QR Code** - Gerar e ler códigos
4. **🤖 IA Integration** - Interpretar exames
5. **📊 Timeline web** - App médico completo

## 💡 **Exemplos de Solicitações**

### **Upload de Documentos**
```markdown
🧩 Componente: DocumentUpload

📄 Descrição: Permitir upload de exames via câmera ou galeria

📥 Input: Tipo de documento, metadados opcionais

📤 Output: Arquivo processado com OCR automático

📌 Observações: Suportar PDF e imagens, compressão automática
```

### **Timeline Web Médico**
```markdown
🧩 Tela: PatientTimelinePage

📄 Descrição: Timeline completa do paciente para médicos

📥 Input: Token de acesso válido

📤 Output: Lista filtrable de eventos, exportação PDF

📌 Observações: Sessão temporária, controle de expiração
```

---

**🎯 Framework está pronto para implementar qualquer funcionalidade seguindo os padrões estabelecidos!** 