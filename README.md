# PID Circular ERP — Transformando Resíduos em Decisões de Descarbonização

> **Hackathon MVP** — Plataforma Interativa de Descarbonização | Edição 2026

---

## 🚨 O Problema

### Contexto Crítico
O Brasil enfrenta um **cenário crítico na gestão de resíduos sólidos**, com impactos diretos no meio ambiente, na economia e na eficiência energética:

- **81 milhões de toneladas** de resíduos sólidos gerados em 2025
- Apenas **8,7% foram reciclados** — baixíssima capacidade de reaproveitamento
- **40% tiveram destinação inadequada** (lixões e aterros)
- **Consequências**: poluição do solo, emissão de gases de efeito estufa, perda de recursos econômicos

### A Falha Estrutural
Resíduos que **poderiam ser transformados em:**
- ⚡ Energia renovável
- 💚 Crédito de carbono
- 🌾 Insumos agrícolas

**...continuam sendo tratados como passivos ambientais, não como ativos econômicos.**

### Limitações da Indústria
A indústria enfrenta limitações críticas na **tomada de decisão sobre materiais**:

| Desafio | Impacto |
|---------|---------|
| 🔴 Falta de visibilidade de CO₂ em desenvolvimento | Decisões sem dados ambientais |
| 🔴 Análises tardias e complexas (LCA) | Alto custo de mudanças em produção |
| 🔴 Sem rastreabilidade | Impossibilidade de circularidade |
| 🔴 Desconexão com territórios | Desperdício de oportunidades logísticas |

**A pergunta central:** Como gerar engajamento produtivo ao mesmo tempo em que trazemos reduções de materiais descartados?

---

## 💡 A Solução: PID Circular ERP

### Conceito Central
Um **módulo ERP georreferenciado** dentro da PID que conecta:

```
Resíduos Disponíveis 
    ↓
+ Localização Geográfica 
    ↓
+ Potencial Energético/Industrial 
    ↓
+ Custo Logístico 
    ↓
+ CO₂ Evitado 
    ↓
= Decisão Estratégica de Descarbonização
```

### Filosofia
> "Hoje, o Brasil enterra valor.  
> O **PID Circular ERP** mostra onde esse valor está, quem pode usar, quanto custa transportar e quanto carbono pode ser evitado."

**Diferencial:** A maioria das soluções apenas **mostra dados**. O PID Circular ERP **transforma dados em decisão operacional**, conectando:
- 🗺️ **Território** (geolocalização de resíduos)
- 🏭 **Indústria** (plantas, consumo, emissões)
- ♻️ **Resíduos** (disponibilidade, propriedades, viabilidade)
- 📋 **Política Pública** (regulações, incentivos)

---

## 🎯 MVP — O Que Foi Implementado

### 1. **Dashboard Executivo** (`/dashboard`)
Panorama de oportunidades de descarbonização:

- 📊 **KPIs Principais**
  - Indústrias cadastradas (326)
  - Consumo total de energia (30,4M MWh)
  - Projetos de Aço Verde identificados (10)
  - Potencial de redução de CO₂ (~40% até 2035)

- 📈 **Gráficos por Setor**
  - Consumo (MWh) por setor industrial
  - Ranking: Alumínio → Aço → Química → Alimentícia

- 🎯 **Oportunidades Identificadas**
  - Alto impacto: 10 usinas de Aço no Sudeste com potencial H₂ Verde
  - Médio prazo: Hubs portuários como corredores de biometano
  - Prioridade: Alumínio = 36% do consumo (maior alavanca)

### 2. **Mapa Interativo com IA Copilot** (`/copilot`)
Plataforma conversacional geoespacial:

- 🗺️ **5 Camadas de Infraestrutura em Tempo Real** (SIGEL/ANEEL)
  - Energia Eólica (EOL)
  - Hidrelétrica (UHE)
  - Pequenas Centrais Hidrelétricas (PCH)
  - Biomassa/Térmica (UTE)
  - Solar (UFV)

- 🤖 **Assistente IA (Copilot)**
  - Responde queries sobre indústrias, energia, descarbonização
  - Ativa dinamicamente camadas do mapa baseado em contexto
  - Integração com backend .NET 9 (PID.Api)
  - Fallback para dados de demonstração (resiliente)

- 🟢 **Camada Aço Verde** (Reativa)
  - Ativada quando usuário consulta sobre setores de descarbonização
  - 10 instalações mapeadas (Sudeste/Sul)
  - Potencial de transição para H₂ Verde

### 3. **Rota de Perfis** (`/`)
Home page com 3 jornadas:

- **👨‍💼 Investidor/Gestor** → Dashboard Executivo
- **🔬 Pesquisador** → Mapa + Copilot
- **📊 Gestor PID** → Admin (placeholder para expansão)

---

## 🔧 Tech Stack

### Frontend (Next.js 16)
- **Framework**: Next.js 16.2.6 com App Router
- **Renderização**: Client-side para mapa ArcGIS, SSR para conteúdo estático
- **Bundler**: Turbopack (nativo do Next.js 16)
- **UI Components**: Lucide React (ícones), Tailwind CSS v4
- **Mapa**: ArcGIS SDK v5 (@arcgis/core)
- **Chat**: Componente customizado com formatação Markdown

### Backend (.NET 9 / PID.Api)
- **Endpoints**: `/api/industries`, `/api/hydrogen`, `/api/infrastructure`
- **Dados**: Integração com SIGEL/ANEEL, EPE, IEA
- **Porta**: 5280

### DevOps & Deploy
- **Git**: GitHub (main branch)
- **CI/CD**: Netlify (Next.js)
- **Deploy Backend**: Manual (já configurado)
- **Environment**: Windows 10+ / Linux (WSL2)

---

## 📦 Estrutura do Projeto

```
pid-hackathon-projeto/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home com 3 perfis
│   │   ├── dashboard/            # Executivo
│   │   ├── copilot/              # IA + Mapa
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ChatInterface.tsx      # Assistente IA
│   │   ├── ArcGISMap.tsx          # Motor de mapa
│   │   ├── MapViewer.tsx          # Wrapper + Legenda
│   │   └── Logo.tsx
│   ├── types/
│   │   └── map.ts                 # MapState type
│   └── config/
│       └── dataSources.ts
├── public/
│   ├── arcgis-assets/             # ArcGIS SDK v5 assets
│   └── assets/
├── pid-backend/                   # .NET 9 backend (PID.Api)
├── package.json
├── netlify.toml
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 20+ (para frontend)
- .NET 9 SDK (para backend)
- Git

### Frontend (Next.js)
```bash
# Instalar dependências
npm install

# Dev server (localhost:3000)
npm run dev

# Build para produção
npm run build
npm run start
```

### Backend (.NET 9)
```bash
cd pid-backend

# Restore dependencies
dotnet restore

# Dev server (localhost:5280)
dotnet run

# Release build
dotnet publish -c Release -o ./bin/Release/publish
```

### Deploy
```bash
# Frontend → Netlify
npm run build
# Ou commit no GitHub (Netlify auto-deploys)

# Backend → Manual
# Já configurado para rodar em Azure App Service ou servidor local
```

---

## 🎯 Modelo de Negócio: B2B2G

### Stakeholders

**🏢 Empresas Industriais** (B)
- Usam para reduzir custo operacional e emissões
- Identificam oportunidades de coprocessamento
- Calculam ROI de transição energética

**🏛️ Governos** (G)
- Desenham políticas públicas de incentivo
- Monitoram potencial de descarbonização por região
- Apoiam transição justa com dados

**🤝 Terceiro Setor & Pesquisadores**
- Monitoram impacto ambiental em escala
- Geram relatórios de circularidade
- Alimentam políticas de economia circular

**🎁 PID (Plataforma)**
- Ganha adoção prática e recorrente
- Dados enriquecem análises futuras
- Posiciona-se como hub de transição energética

---

## 🌱 Alinhamento com Sustentabilidade

### ODS Alinhadas
- **ODS 9** (Inovação e Infraestrutura)
- **ODS 12** (Consumo e Produção Responsáveis)
- **ODS 13** (Ação Climática)

### Benefícios Comprovados
- ⚡ Redução de CO₂ em até 40% (caso Aço Verde)
- 💰 Economia em combustível fóssil (coprocessamento)
- ♻️ Aumento de taxa de reciclagem (valorização de resíduos)
- 🌍 Descarbonização acelerada da indústria brasileira

---

## 🔮 Roadmap Futuro

### Phase 2 (Próximas semanas)
- [ ] Integração de APIs de georreferenciamento (MapBiomas)
- [ ] Sistema de gestão de etapas de reciclabilidade
- [ ] Faixa georreferencial para troca de materiais
- [ ] Viabilidade financeira com simulador avançado
- [ ] Autenticação e perfis de usuário

### Phase 3 (2H 2026)
- [ ] Certificação de carbono integrada
- [ ] Marketplace de resíduos
- [ ] IA recomendadora por setor (cimenteira, siderurgia, etc.)
- [ ] Mobile app
- [ ] Integração com plataformas de e-procurement

---

## 📞 Suporte & Documentação

- **Backend API Docs**: (em desenvolvimento)
- **GitHub**: [Repositório principal](#)
- **Issues & Feedback**: GitHub Issues
- **Contato**: [adicionar email de contato]

---

## 📜 Licença

Open Source - Alinhado com política da PID original

---

**Desenvolvido com ❤️ para o Hackathon PID 2026 — Transformando dados em decisões para a transição energética do Brasil.**

