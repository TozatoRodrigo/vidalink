# VidaLink Web 🌐

> App web para médicos - Visualização segura do histórico do paciente

## 🎯 Visão Geral

O VidaLink Web é a aplicação para profissionais de saúde, desenvolvida com **React + Vite + Tailwind**, que permite acesso seguro e temporário ao histórico médico compartilhado pelo paciente via QR Code.

## 🏗️ Arquitetura

```
apps/web/
├── src/
│   ├── components/         # Componentes React reutilizáveis
│   │   ├── ui/            # Componentes base
│   │   └── medical/       # Componentes específicos médicos
│   ├── pages/             # Páginas principais da aplicação
│   ├── hooks/             # React hooks customizados
│   ├── services/          # Integração com APIs
│   ├── utils/             # Funções utilitárias
│   └── types/             # Tipos TypeScript específicos
├── public/                # Assets estáticos
└── config files           # Vite, Tailwind, TypeScript
```

## 🎨 Design System Web

### Cores (Tailwind Classes)
```css
/* Cores principais */
.text-primary-500     /* #4A90E2 - Azul */
.bg-secondary-400     /* #43D39E - Verde menta */

/* Estados */
.text-success         /* Verde para sucessos */
.text-warning         /* Âmbar para avisos */
.text-error          /* Vermelho para erros */

/* Backgrounds */
.bg-gray-50          /* Background secundário */
.bg-white            /* Background de cards */
```

### Componentes Tailwind
```css
/* Cards */
.shadow-card         /* Sombra padrão */
.shadow-card-hover   /* Sombra no hover */
.rounded-2xl         /* Border radius grande */

/* Animações */
.animate-fade-in     /* Fade in suave */
.animate-slide-up    /* Slide up para modais */
.transition-colors   /* Transição de cores */
```

## 📄 Páginas Principais

### 1. HomePage (`/`)
**Landing page** para médicos com informações sobre o sistema

**Funcionalidades:**
- ✅ Hero section explicando o propósito
- ✅ Grid de features (segurança, timeline, IA)
- ✅ CTA principal para acesso
- ✅ Footer com informações LGPD

```typescript
export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🏥</div>
            <h1 className="text-xl font-bold text-gray-900">VidaLink</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero + Features + CTA */}
      </main>
    </div>
  );
};
```

### 2. AccessPage (`/access`)
**Página de autenticação** via QR Code ou token manual

**Funcionalidades:**
- ✅ Scanner de QR Code (placeholder)
- ✅ Input manual para código
- ✅ Validação em tempo real
- ✅ Loading states
- ✅ Avisos de segurança

```typescript
export const AccessPage = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleAccess = async () => {
    if (!token.trim()) {
      toast.error('Digite o código de acesso');
      return;
    }
    
    setLoading(true);
    try {
      // Validar token e navegar
      navigate(`/medical-access/${token.trim()}`);
    } catch (error) {
      toast.error('Código inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 shadow-card">
        {/* QR Scanner + Manual Input */}
      </div>
    </main>
  );
};
```

### 3. PatientTimelinePage (`/medical-access/:token`)
**Timeline principal** do histórico do paciente

**Funcionalidades planejadas:**
- 📋 Header com dados do paciente
- 📋 Filtros por tipo de evento
- 📋 Timeline cronológica
- 📋 Cards expandíveis para detalhes
- 📋 Visualização de anexos
- 📋 Resumos de IA
- 📋 Exportação para PDF
- 📋 Controle de sessão/expiração

```typescript
export const PatientTimelinePage = () => {
  const { token } = useParams();
  const { data: patientData, isLoading } = usePatientAccess(token);

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientHeader patient={patientData?.patient} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <TimelineFilters />
        <HealthEventTimeline events={patientData?.events} />
        <ExportActions />
      </main>
    </div>
  );
};
```

## 🧩 Componentes Planejados

### PatientHeader
```typescript
interface PatientHeaderProps {
  patient: Patient;
  sessionExpiry: Date;
}

export const PatientHeader: FC<PatientHeaderProps> = ({ patient, sessionExpiry }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{patient.name}</h1>
            <p className="text-gray-500">{patient.birthDate} • {patient.gender}</p>
          </div>
          
          <SessionTimer expiresAt={sessionExpiry} />
        </div>
      </div>
    </header>
  );
};
```

### HealthEventTimelineCard
```typescript
interface TimelineCardProps {
  event: HealthEvent;
  expanded?: boolean;
  onToggle?: () => void;
}

export const HealthEventTimelineCard: FC<TimelineCardProps> = ({ 
  event, 
  expanded, 
  onToggle 
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start space-x-4">
        <EventTypeIcon type={event.type} />
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">{event.title}</h3>
            <time className="text-sm text-gray-500">
              {formatDate(event.date)}
            </time>
          </div>
          
          {expanded ? (
            <ExpandedEventDetails event={event} />
          ) : (
            <EventSummary event={event} />
          )}
          
          <button 
            onClick={onToggle}
            className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {expanded ? 'Ver menos' : 'Ver detalhes'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

### TimelineFilters
```typescript
export const TimelineFilters: FC = () => {
  const [selectedTypes, setSelectedTypes] = useState<HealthEventType[]>([]);
  const [dateRange, setDateRange] = useState<[Date?, Date?]>([]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-card mb-8">
      <h2 className="text-lg font-semibold mb-4">Filtrar eventos</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Filtro por tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de evento
          </label>
          <EventTypeFilter 
            selected={selectedTypes}
            onChange={setSelectedTypes}
          />
        </div>
        
        {/* Filtro por data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <DateRangePicker 
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </div>
    </div>
  );
};
```

## 🔐 Segurança e Sessão

### Controle de Acesso
```typescript
const usePatientAccess = (token: string) => {
  return useQuery({
    queryKey: ['patientAccess', token],
    queryFn: () => validateTokenAndFetchData(token),
    staleTime: 0, // Sempre revalidar
    refetchInterval: 5 * 60 * 1000, // Revalidar a cada 5min
    onError: (error) => {
      if (error.status === 401) {
        toast.error('Sessão expirada');
        navigate('/access');
      }
    },
  });
};
```

### Timer de Sessão
```typescript
const SessionTimer: FC<{ expiresAt: Date }> = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = expiresAt.getTime() - Date.now();
      if (diff <= 0) {
        toast.error('Sessão expirada');
        navigate('/access');
      } else {
        setTimeLeft(formatDuration(diff));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [expiresAt]);
  
  return (
    <div className="text-sm text-gray-500">
      ⏱️ Sessão expira em: <span className="font-medium">{timeLeft}</span>
    </div>
  );
};
```

## 📱 Responsividade

### Breakpoints Tailwind
```css
/* Mobile first */
.grid                      /* 1 coluna */
.md:grid-cols-2           /* 2 colunas em tablet */
.lg:grid-cols-3           /* 3 colunas em desktop */
.xl:max-w-7xl            /* Container máximo */

/* Espaçamentos responsivos */
.px-4 .sm:px-6 .lg:px-8  /* Padding horizontal */
.py-8 .md:py-12          /* Padding vertical */
```

### Componentes Adaptativos
```typescript
const ResponsiveGrid: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  );
};
```

## 🚀 Comandos de Desenvolvimento

```bash
# Desenvolvimento
npm run dev          # Vite dev server (port 3000)
npm run build        # Build para produção
npm run preview      # Preview do build

# Qualidade de código
npm test             # Vitest
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

## 📡 Integração com API

### React Query Setup
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});
```

### API Service
```typescript
export const medicalAccessApi = {
  validateToken: (token: string) => 
    api.post('/medical-access/validate', { token }),
    
  getPatientTimeline: (token: string) =>
    api.get(`/medical-access/${token}/timeline`),
    
  exportTimeline: (token: string, format: 'pdf' | 'json') =>
    api.get(`/medical-access/${token}/export?format=${format}`),
};
```

## 🎬 Animações com Framer Motion

### Page Transitions
```typescript
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

export const AnimatedPage: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
```

### Card Hover Effects
```typescript
const cardVariants = {
  hover: { 
    scale: 1.02,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  }
};

<motion.div 
  variants={cardVariants}
  whileHover="hover"
  className="bg-white rounded-xl p-6"
>
  {/* Card content */}
</motion.div>
```

## 📋 Próximos Passos

### 🚧 Em Desenvolvimento
- [ ] Implementar PatientTimelinePage completa
- [ ] Componentes de timeline e filtros
- [ ] Integração real com QR scanner
- [ ] Exportação para PDF
- [ ] Animações avançadas

### 📋 Backlog
- [ ] Modo offline com cache
- [ ] Impressão otimizada
- [ ] Acessibilidade completa (WCAG)
- [ ] Testes E2E com Playwright
- [ ] PWA com service workers

---

**Próxima tarefa sugerida**: Implementar timeline completa do paciente com filtros 📊 