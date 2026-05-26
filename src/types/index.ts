export type SensorStatus = 'ACTIVE' | 'INACTIVE' | 'FAULT';
export type SensorType = 'TEMPERATURA' | 'PRESSAO' | 'RADIACAO';

export interface Sensor {
  id: number;
  name: string;
  type: SensorType;
  location: string;
  status: SensorStatus;
  registeredAt?: string;
}

export type EventType = 'LAUNCH' | 'DOCKING' | 'ANOMALY' | 'MAINTENANCE';
export type EventSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface MissionEvent {
  id: number;
  title: string;
  description: string;
  eventType: EventType;
  severity: EventSeverity;
  monitoredSystem: string;
  sensor?: { id: number };
  occurredAt?: string;
}

export type AlertType = 'SYSTEM_FAILURE' | 'RADIATION' | 'PRESSURE_DROP';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: number;
  title: string;
  message: string;
  alertType: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  sensor?: { id: number };
  event?: { id: number };
  triggeredAt?: string;
}
