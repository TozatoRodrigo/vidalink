# Guia de Contribuição - VidaLink

## 🤝 Como Contribuir

Agradecemos seu interesse em contribuir para o VidaLink! Este documento fornece diretrizes para contribuições comerciais e técnicas.

## 📋 Tipos de Contribuição

### 🐛 Relatórios de Bugs
- Use o template de issue para bugs
- Inclua informações detalhadas sobre o ambiente
- Forneça steps para reproduzir o problema
- Adicione screenshots ou logs quando relevante

### ✨ Solicitações de Funcionalidades
- Descreva claramente a funcionalidade desejada
- Explique o valor comercial da feature
- Considere o impacto na experiência do usuário
- Verifique se não existe uma issue similar

### 🔧 Melhorias Técnicas
- Otimizações de performance
- Refatorações de código
- Atualizações de dependências
- Melhorias de segurança

## 🚀 Processo de Desenvolvimento

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
git clone https://github.com/seu-usuario/vidalink.git
cd vidalink
```

### 2. Configuração do Ambiente

```bash
# Instalar dependências
npm install

# Configurar ambiente de desenvolvimento
cp apps/api/env.example apps/api/.env
# Configure suas variáveis de ambiente
```

### 3. Criação de Branch

```bash
# Criar branch para sua feature/fix
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 4. Desenvolvimento

- Siga os padrões de código estabelecidos
- Escreva testes para novas funcionalidades
- Mantenha commits pequenos e focados
- Use mensagens de commit descritivas

### 5. Testes

```bash
# Executar todos os testes
npm test

# Testes específicos por app
cd apps/api && npm test
cd apps/web && npm test
```

### 6. Pull Request

- Crie um PR descritivo
- Referencie issues relacionadas
- Aguarde a revisão do código
- Implemente feedback solicitado

## 📝 Padrões de Código

### JavaScript/TypeScript

```javascript
// ✅ Bom
const getUserEvents = async (userId: string): Promise<HealthEvent[]> => {
  try {
    const events = await healthEventService.getByUserId(userId);
    return events;
  } catch (error) {
    logger.error('Failed to get user events', { userId, error });
    throw error;
  }
};

// ❌ Ruim
function getEvents(id) {
  return healthEventService.getByUserId(id);
}
```

### React Components

```tsx
// ✅ Bom
interface Props {
  event: HealthEvent;
  onEdit: (event: HealthEvent) => void;
}

export const HealthEventCard: React.FC<Props> = ({ event, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit(event);
  }, [event, onEdit]);

  return (
    <Card>
      <CardHeader>{event.title}</CardHeader>
      <CardContent>{event.description}</CardContent>
      <CardActions>
        <Button onClick={handleEdit}>Editar</Button>
      </CardActions>
    </Card>
  );
};
```

### Mensagens de Commit

```bash
# Formato: tipo(escopo): descrição

feat(mobile): adicionar tela de configurações
fix(api): corrigir validação de email
docs(readme): atualizar instruções de instalação
refactor(web): melhorar performance do scanner
test(api): adicionar testes para auth service
```

## 🧪 Testes

### Estrutura de Testes

```
tests/
├── unit/           # Testes unitários
├── integration/    # Testes de integração
├── e2e/           # Testes end-to-end
└── fixtures/      # Dados de teste
```

### Exemplo de Teste

```javascript
describe('HealthEventService', () => {
  describe('createEvent', () => {
    it('should create a new health event', async () => {
      // Arrange
      const eventData = {
        title: 'Consulta Teste',
        type: 'consulta',
        date: '2024-01-15'
      };

      // Act
      const result = await healthEventService.createEvent(eventData);

      // Assert
      expect(result).toBeDefined();
      expect(result.title).toBe(eventData.title);
      expect(result.id).toBeDefined();
    });
  });
});
```

## 📱 Desenvolvimento Mobile

### Estrutura de Componentes

```
src/
├── components/
│   ├── ui/           # Componentes base
│   ├── forms/        # Formulários
│   └── screens/      # Telas específicas
├── hooks/            # Custom hooks
├── services/         # Serviços
├── types/           # Tipos TypeScript
└── utils/           # Utilitários
```

### Boas Práticas Mobile

- Use TypeScript para type safety
- Implemente loading states
- Trate erros adequadamente
- Otimize para performance
- Teste em dispositivos reais

## 🌐 Desenvolvimento Web

### Estrutura de Páginas

```
src/
├── pages/           # Páginas principais
├── components/      # Componentes reutilizáveis
├── hooks/          # Custom hooks
├── services/       # Serviços de API
├── types/          # Tipos TypeScript
└── utils/          # Utilitários
```

### Boas Práticas Web

- Responsive design
- Acessibilidade (WCAG)
- SEO otimizado
- Performance (Core Web Vitals)
- Progressive Web App features

## 🔧 Desenvolvimento API

### Estrutura de Endpoints

```
src/
├── routes/         # Definição de rotas
├── controllers/    # Lógica de controle
├── services/       # Lógica de negócio
├── models/         # Modelos de dados
├── middleware/     # Middlewares
└── utils/          # Utilitários
```

### Boas Práticas API

- Validação de entrada
- Tratamento de erros
- Logging adequado
- Documentação OpenAPI
- Testes de integração

## 🔒 Segurança

### Diretrizes de Segurança

- Nunca commite credenciais
- Use HTTPS em produção
- Valide todas as entradas
- Implemente rate limiting
- Mantenha dependências atualizadas

### Dados Sensíveis

```javascript
// ✅ Bom
const config = {
  apiKey: process.env.API_KEY,
  dbUrl: process.env.DATABASE_URL
};

// ❌ Ruim
const config = {
  apiKey: 'sk-1234567890abcdef',
  dbUrl: 'postgresql://user:pass@localhost/db'
};
```

## 📊 Performance

### Métricas Importantes

- **Mobile**: Tempo de carregamento < 3s
- **Web**: Core Web Vitals otimizados
- **API**: Resposta < 200ms para 95% das requests

### Otimizações

- Lazy loading de componentes
- Caching inteligente
- Compressão de assets
- Otimização de imagens
- Bundle splitting

## 🐛 Debug

### Ferramentas de Debug

- **Mobile**: Flipper, React Native Debugger
- **Web**: Chrome DevTools, React DevTools
- **API**: Postman, Thunder Client

### Logs

```javascript
// Use o logger configurado
import { logger } from '../utils/logger';

logger.info('User logged in', { userId: user.id });
logger.error('Failed to process payment', { error, userId });
```

## 📄 Documentação

### Documentação de Código

```javascript
/**
 * Cria um novo evento de saúde
 * @param {CreateEventData} eventData - Dados do evento
 * @param {string} userId - ID do usuário
 * @returns {Promise<HealthEvent>} Evento criado
 * @throws {ValidationError} Quando dados são inválidos
 */
async function createHealthEvent(eventData, userId) {
  // implementação
}
```

### README Updates

- Mantenha instruções atualizadas
- Documente novas funcionalidades
- Inclua exemplos de uso
- Atualize screenshots quando necessário

## 🎯 Revisão de Código

### Checklist do Revisor

- [ ] Código segue padrões estabelecidos
- [ ] Testes adequados incluídos
- [ ] Documentação atualizada
- [ ] Performance considerada
- [ ] Segurança verificada
- [ ] Compatibilidade testada

### Feedback Construtivo

- Seja específico e construtivo
- Sugira melhorias quando possível
- Reconheça boas práticas
- Foque no código, não na pessoa

## 🚀 Deploy

### Ambiente de Staging

- Todos os PRs são deployados automaticamente
- Testes E2E executados
- Validação manual quando necessário

### Ambiente de Produção

- Deploy manual após aprovação
- Monitoramento ativo
- Rollback automático em caso de problemas

## 💼 Contribuições Comerciais

### Parcerias

Para parcerias comerciais ou contribuições empresariais:

- **Email**: partnerships@vidalink.com
- **LinkedIn**: [VidaLink Official](https://linkedin.com/company/vidalink)

### Licenciamento

- Código open source sob licença comercial
- Contribuições seguem a mesma licença
- Direitos autorais mantidos pelos autores

## 📞 Suporte

### Canais de Comunicação

- **Issues**: Para bugs e features
- **Discussions**: Para perguntas gerais
- **Email**: dev@vidalink.com

### Resposta Esperada

- **Bugs críticos**: 24 horas
- **Features**: 1-2 semanas
- **Dúvidas**: 2-3 dias úteis

## 🎉 Reconhecimento

Todos os contribuidores são reconhecidos:

- Listados no README
- Mencionados nos release notes
- Certificado de contribuição disponível

---

**Obrigado por contribuir para o VidaLink!** 🙏

Juntos estamos transformando o cuidado com a saúde através da tecnologia. 