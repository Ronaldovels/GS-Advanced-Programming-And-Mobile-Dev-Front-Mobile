# Space Mission API

API REST desenvolvida com Spring Boot para monitoramento de missões espaciais. Permite o cadastro e consulta de sensores, eventos operacionais e alertas críticos gerados durante a operação de uma missão.

## Tecnologias

- Java 17
- Spring Boot 3.5.14
- Spring Data JPA
- Banco de dados H2 (modo file)
- Lombok

## Como executar

```bash
./mvnw spring-boot:run
```

A aplicação sobe em `http://localhost:8080`.

O console do H2 está disponível em `http://localhost:8080/h2-console` com as configurações:

| Campo | Valor |
|-------|-------|
| JDBC URL | `jdbc:h2:file:./data/spacemission` |
| Username | `sa` |
| Password | _(vazio)_ |

---

## Endpoints

### Sensores — `/sensors`

Sensores e módulos computacionais instalados na missão.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/sensors` | Lista todos os sensores |
| GET | `/sensors/{id}` | Busca sensor por ID |
| POST | `/sensors` | Cadastra novo sensor |
| PUT | `/sensors/{id}` | Atualiza sensor |
| DELETE | `/sensors/{id}` | Remove sensor |

**Query params:** `?status=` `?type=`

**Exemplo de cadastro:**
```json
{
  "name": "Sensor de Temperatura do Reator",
  "type": "TEMPERATURA",
  "location": "Núcleo de Propulsão - Setor 3",
  "status": "ACTIVE"
}
```

---

### Eventos — `/events`

Eventos operacionais registrados durante a missão.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/events` | Lista todos os eventos |
| GET | `/events/{id}` | Busca evento por ID |
| POST | `/events` | Cadastra novo evento |
| PUT | `/events/{id}` | Atualiza evento |
| DELETE | `/events/{id}` | Remove evento |

**Query params:** `?severity=` `?eventType=` `?monitoredSystem=` `?sensorId=`

**Exemplo de cadastro:**
```json
{
  "title": "Anomalia na Pressão da Cabine",
  "description": "Queda abrupta de pressão detectada no módulo habitacional.",
  "eventType": "ANOMALY",
  "severity": "HIGH",
  "monitoredSystem": "Sistema de Suporte à Vida",
  "sensor": { "id": 1 }
}
```

---

### Alertas — `/alerts`

Alertas críticos gerados automaticamente durante a operação.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/alerts` | Lista todos os alertas |
| GET | `/alerts/{id}` | Busca alerta por ID |
| POST | `/alerts` | Cadastra novo alerta |
| PUT | `/alerts/{id}` | Atualiza alerta |
| DELETE | `/alerts/{id}` | Remove alerta |

**Query params:** `?severity=` `?status=` `?alertType=` `?sensorId=` `?eventId=`

**Exemplo de cadastro:**
```json
{
  "title": "Falha Crítica no Sistema de Propulsão",
  "message": "Temperatura do reator excedeu o limite máximo operacional.",
  "alertType": "SYSTEM_FAILURE",
  "severity": "CRITICAL",
  "status": "OPEN",
  "sensor": { "id": 1 },
  "event": { "id": 3 }
}
```

---

## Modelo de dados

```
Sensor
  └── Event (N eventos por sensor)
        └── Alert (N alertas por evento)
  └── Alert (N alertas por sensor)
```

### Valores esperados

| Campo | Valores sugeridos |
|-------|-------------------|
| Sensor `status` | `ACTIVE` `INACTIVE` `FAULT` |
| Sensor `type` | `TEMPERATURA` `PRESSAO` `RADIACAO` |
| Event `eventType` | `LAUNCH` `DOCKING` `ANOMALY` `MAINTENANCE` |
| Event `severity` | `LOW` `MEDIUM` `HIGH` |
| Alert `alertType` | `SYSTEM_FAILURE` `RADIATION` `PRESSURE_DROP` |
| Alert `severity` | `LOW` `MEDIUM` `HIGH` `CRITICAL` |
| Alert `status` | `OPEN` `ACKNOWLEDGED` `RESOLVED` |
