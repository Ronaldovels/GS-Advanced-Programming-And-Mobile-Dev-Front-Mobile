# Space Mission App

Aplicativo mobile desenvolvido em **React Native + Expo + TypeScript** para monitoramento de missões espaciais. Consome a [Space Mission API](./API-DOC.MD) (Spring Boot) para gerenciar sensores, eventos operacionais e alertas críticos.

---

## Integrantes

| Nome | RM |
|------|----|
| Ronaldo Veloso Filho | — |

---

## Tecnologias

- [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/)
- React Native 0.85.3
- React 19
- TypeScript 6
- React Navigation 7 (Bottom Tabs)

---

## Estrutura do projeto

```
src/
├── App.tsx                  # Entry point
├── types/
│   └── index.ts             # Tipos TypeScript: Sensor, MissionEvent, Alert
├── services/
│   ├── api.ts               # Cliente fetch (BASE_URL: localhost:8080)
│   ├── sensorsService.ts    # CRUD /sensors
│   ├── eventsService.ts     # CRUD /events
│   └── alertsService.ts     # CRUD /alerts
├── components/
│   ├── Card.tsx             # Card com tema escuro
│   ├── StatusBadge.tsx      # Badge colorido por status/severidade
│   ├── Loading.tsx          # Indicador de carregamento
│   └── ConfirmModal.tsx     # Modal de confirmação de exclusão
├── navigation/
│   └── AppNavigator.tsx     # Navegação por abas (Bottom Tabs)
└── pages/
    ├── SensorsScreen.tsx    # Sensores: listar, cadastrar, editar, excluir
    ├── EventsScreen.tsx     # Eventos: listar, cadastrar, editar, excluir
    └── AlertsScreen.tsx     # Alertas: listar, cadastrar, editar, excluir
```

---

## Funcionalidades

### Sensores (`/sensors`)
- Listagem com nome, tipo, localização e badge de status (`ACTIVE` / `INACTIVE` / `FAULT`)
- Cadastro via modal com campos: nome, localização, tipo e status
- Edição inline com modal pré-preenchido
- Exclusão com modal de confirmação

### Eventos Operacionais (`/events`)
- Listagem com título, tipo de evento, sistema monitorado e badge de severidade
- Cadastro com título, descrição, sistema monitorado, ID do sensor e seleção de tipo/severidade
- Edição e exclusão

### Alertas Críticos (`/alerts`)
- Listagem com título, tipo de alerta, badge de status e badge de severidade
- Cadastro com título, mensagem, ID do sensor/evento, tipo, severidade e status
- Edição e exclusão

---

## Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- [Space Mission API](./API-DOC.MD) rodando em `http://localhost:8080`

---

## Como executar

**1. Instale as dependências**
```bash
npm install
```

**2. Inicie a API backend**

Na pasta do projeto Spring Boot:
```bash
./mvnw spring-boot:run
```
A API sobe em `http://localhost:8080`.

**3. Inicie o app**
```bash
npx expo start --clear
```

Escolha uma das opções:
- **`w`** — abre no navegador (web)
- **`a`** — abre no emulador Android
- **`i`** — abre no simulador iOS
- **Expo Go** — escaneie o QR code com o app Expo Go no celular

> **Atenção:** ao rodar no dispositivo físico via Expo Go, altere `BASE_URL` em `src/services/api.ts` para o IP da sua máquina na rede local (ex.: `http://192.168.1.10:8080`).

---

## Endpoints consumidos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/sensors` | Lista sensores |
| POST | `/sensors` | Cadastra sensor |
| PUT | `/sensors/{id}` | Atualiza sensor |
| DELETE | `/sensors/{id}` | Remove sensor |
| GET | `/events` | Lista eventos |
| POST | `/events` | Cadastra evento |
| PUT | `/events/{id}` | Atualiza evento |
| DELETE | `/events/{id}` | Remove evento |
| GET | `/alerts` | Lista alertas |
| POST | `/alerts` | Cadastra alerta |
| PUT | `/alerts/{id}` | Atualiza alerta |
| DELETE | `/alerts/{id}` | Remove alerta |
