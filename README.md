# Wallet App

Uma aplicação desktop de carteira financeira construída com Electron + React + TypeScript.

## 🚀 Tecnologias

- **Electron** - Framework para aplicações desktop
- **React** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes de UI
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento
- **Lucide React** - Ícones

## 📁 Estrutura do Projeto

```
wallet-app/
├── main/                 # Processo principal do Electron
│   ├── main.ts          # Ponto de entrada principal
│   └── tsconfig.json    # Config TypeScript para main
├── preload/             # Scripts de preload
│   ├── preload.ts       # Bridge segura main ↔ renderer
│   └── tsconfig.json    # Config TypeScript para preload
├── renderer/            # Aplicação React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── stores/      # Estados Zustand
│   │   ├── types/       # Definições de tipos
│   │   ├── lib/         # Utilitários
│   │   └── layouts/     # Layouts da aplicação
│   ├── index.html       # HTML principal
│   └── tsconfig.json    # Config TypeScript para renderer
├── dist/                # Arquivos compilados
│   ├── main/           # Main process compilado
│   └── preload/        # Preload script compilado
├── package.json         # Dependências e scripts
├── electron.vite.config.ts  # Configuração Electron Vite
├── tailwind.config.js   # Configuração Tailwind
└── tsconfig.json        # Config TypeScript raiz
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o ambiente de desenvolvimento (compila automaticamente)
- `npm run prebuild` - Compila os processos main e preload
- `npm run compile:main` - Compila apenas o processo main
- `npm run compile:preload` - Compila apenas o preload script
- `npm run build` - Constrói a aplicação para produção
- `npm run preview` - Preview da build de produção
- `npm run pack` - Empacota a aplicação
- `npm run dist` - Constrói e distribui a aplicação
- `npm run typecheck` - Verifica tipos TypeScript

## 🏃‍♂️ Como Executar

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Execute em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```
   > O script `dev` automaticamente compila os processos main e preload antes de iniciar

3. **Para construir para produção:**
   ```bash
   npm run build
   npm run dist
   ```

## ✅ Status Atual

- ✅ **Estrutura completa** - Projeto reestruturado conforme as regras
- ✅ **Configurações TypeScript** - Todas funcionando corretamente
- ✅ **Aplicação funcionando** - Electron + React rodando perfeitamente
- ✅ **Dashboard implementado** - Interface básica com cards funcionais
- ✅ **Zustand configurado** - Store para transações com persistência
- ✅ **Roteamento funcionando** - React Router configurado
- ✅ **UI moderna** - Tailwind + Shadcn/ui implementados

## 📋 Funcionalidades

- ✅ Dashboard com visão geral financeira
- ✅ Gerenciamento de transações (store configurado)
- ✅ Cálculo automático de saldos
- ✅ Persistência local com Zustand
- ✅ Interface moderna com Tailwind CSS
- ✅ Comunicação segura Electron (contextBridge)
- ✅ Navegação entre páginas
- ✅ Componentes UI reutilizáveis

## 🔧 Desenvolvimento

O projeto segue as melhores práticas:

- **Separação de processos**: Main, Preload e Renderer isolados
- **Comunicação segura**: contextBridge para expor APIs
- **Estado global**: Zustand com persistência
- **Tipagem forte**: TypeScript em todo o projeto
- **UI consistente**: Shadcn/ui + Tailwind CSS
- **Estrutura modular**: Separação por domínios
- **Compilação automática**: Scripts que compilam TypeScript automaticamente

## 🐛 Resolução de Problemas

Se encontrar o erro "No electron app entry file found":
```bash
npm run compile:main
npm run compile:preload
```

## 📝 Próximos Passos

- [ ] Adicionar formulários de transação
- [ ] Implementar categorias
- [ ] Adicionar metas de gastos
- [ ] Relatórios e gráficos
- [ ] Exportação de dados
- [ ] Temas dark/light
- [ ] Configurar hot reload para main/preload # wallet-desktop
