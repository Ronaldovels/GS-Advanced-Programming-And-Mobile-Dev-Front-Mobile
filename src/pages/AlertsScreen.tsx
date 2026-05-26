import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Card from '../components/Card';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import { alertsService } from '../services/alertsService';
import type { Alert as MissionAlert, AlertSeverity, AlertStatus, AlertType } from '../types';

const ALERT_TYPES: AlertType[] = ['SYSTEM_FAILURE', 'RADIATION', 'PRESSURE_DROP'];
const SEVERITIES: AlertSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES: AlertStatus[] = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'];

const EMPTY_FORM = {
  title: '',
  message: '',
  alertType: ALERT_TYPES[0] as AlertType,
  severity: SEVERITIES[0] as AlertSeverity,
  status: STATUSES[0] as AlertStatus,
  sensorId: '',
  eventId: '',
};

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<MissionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [createVisible, setCreateVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<MissionAlert | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    try {
      const data = await alertsService.getAll();
      setAlerts(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os alertas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.title.trim() || !form.message.trim()) {
      Alert.alert('Atenção', 'Preencha título e mensagem.');
      return;
    }
    const payload: Omit<MissionAlert, 'id'> = {
      title: form.title,
      message: form.message,
      alertType: form.alertType,
      severity: form.severity,
      status: form.status,
      ...(form.sensorId ? { sensor: { id: Number(form.sensorId) } } : {}),
      ...(form.eventId ? { event: { id: Number(form.eventId) } } : {}),
    };
    try {
      await alertsService.create(payload);
      setCreateVisible(false);
      setForm(EMPTY_FORM);
      load();
    } catch {
      Alert.alert('Erro', 'Falha ao cadastrar alerta.');
    }
  }

  function openEdit(item: MissionAlert) {
    setEditForm({
      title: item.title,
      message: item.message,
      alertType: item.alertType,
      severity: item.severity,
      status: item.status,
      sensorId: item.sensor ? String(item.sensor.id) : '',
      eventId: item.event ? String(item.event.id) : '',
    });
    setEditItem(item);
  }

  async function handleUpdate() {
    if (!editForm.title.trim() || !editForm.message.trim()) {
      Alert.alert('Atenção', 'Preencha título e mensagem.');
      return;
    }
    const payload = {
      ...editItem,
      title: editForm.title,
      message: editForm.message,
      alertType: editForm.alertType,
      severity: editForm.severity,
      status: editForm.status,
      ...(editForm.sensorId ? { sensor: { id: Number(editForm.sensorId) } } : { sensor: undefined }),
      ...(editForm.eventId ? { event: { id: Number(editForm.eventId) } } : { event: undefined }),
    };
    try {
      await alertsService.update(editItem!.id, payload);
      setEditItem(null);
      load();
    } catch {
      Alert.alert('Erro', 'Falha ao atualizar alerta.');
    }
  }

  async function doDelete() {
    if (deleteId === null) return;
    try {
      await alertsService.remove(deleteId);
      setDeleteId(null);
      load();
    } catch (e) {
      setDeleteId(null);
      Alert.alert('Erro ao remover', String(e));
    }
  }

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum alerta registrado.</Text>}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.title}>{item.title}</Text>
              <StatusBadge value={item.severity} />
            </View>
            <View style={styles.row2}>
              <StatusBadge value={item.status} />
              <Text style={styles.type}>{item.alertType}</Text>
            </View>
            <Text style={styles.msg}>{item.message}</Text>
            <View style={styles.actions}>
              <Pressable onPress={() => openEdit(item)} style={styles.editBtn}>
                <Text style={styles.editText}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => setDeleteId(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Remover</Text>
              </Pressable>
            </View>
          </Card>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setCreateVisible(true)}>
        <Text style={styles.fabText}>+ Alerta</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={deleteId !== null}
        message="Deseja remover este alerta? Esta ação não pode ser desfeita."
        onConfirm={doDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Modal de criação */}
      <Modal visible={createVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Alerta</Text>

            <Text style={styles.label}>Título</Text>
            <TextInput style={styles.input} value={form.title}
              onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
              placeholder="Ex.: Falha Crítica no Reator" placeholderTextColor="#475569" />

            <Text style={styles.label}>Mensagem</Text>
            <TextInput style={[styles.input, styles.textarea]} value={form.message}
              onChangeText={(v) => setForm((p) => ({ ...p, message: v }))}
              placeholder="Descreva o alerta..." placeholderTextColor="#475569" multiline />

            <Text style={styles.label}>ID do Sensor (opcional)</Text>
            <TextInput style={styles.input} value={form.sensorId}
              onChangeText={(v) => setForm((p) => ({ ...p, sensorId: v }))}
              placeholder="Ex.: 1" placeholderTextColor="#475569" keyboardType="numeric" />

            <Text style={styles.label}>ID do Evento (opcional)</Text>
            <TextInput style={styles.input} value={form.eventId}
              onChangeText={(v) => setForm((p) => ({ ...p, eventId: v }))}
              placeholder="Ex.: 3" placeholderTextColor="#475569" keyboardType="numeric" />

            <Text style={styles.label}>Tipo de Alerta</Text>
            <View style={styles.optionRow}>
              {ALERT_TYPES.map((t) => (
                <TouchableOpacity key={t}
                  style={[styles.option, form.alertType === t && styles.optionActive]}
                  onPress={() => setForm((p) => ({ ...p, alertType: t }))}>
                  <Text style={[styles.optionText, form.alertType === t && styles.optionTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Severidade</Text>
            <View style={styles.optionRow}>
              {SEVERITIES.map((s) => (
                <TouchableOpacity key={s}
                  style={[styles.option, form.severity === s && styles.optionActive]}
                  onPress={() => setForm((p) => ({ ...p, severity: s }))}>
                  <Text style={[styles.optionText, form.severity === s && styles.optionTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Status</Text>
            <View style={styles.optionRow}>
              {STATUSES.map((s) => (
                <TouchableOpacity key={s}
                  style={[styles.option, form.status === s && styles.optionActive]}
                  onPress={() => setForm((p) => ({ ...p, status: s }))}>
                  <Text style={[styles.optionText, form.status === s && styles.optionTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
              <Text style={styles.submitText}>Cadastrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateVisible(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de edição */}
      <Modal visible={editItem !== null} animationType="slide" transparent>
        <View style={styles.overlay}>
          <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Alerta</Text>

            <Text style={styles.label}>Título</Text>
            <TextInput style={styles.input} value={editForm.title}
              onChangeText={(v) => setEditForm((p) => ({ ...p, title: v }))}
              placeholder="Ex.: Falha Crítica no Reator" placeholderTextColor="#475569" />

            <Text style={styles.label}>Mensagem</Text>
            <TextInput style={[styles.input, styles.textarea]} value={editForm.message}
              onChangeText={(v) => setEditForm((p) => ({ ...p, message: v }))}
              placeholder="Descreva o alerta..." placeholderTextColor="#475569" multiline />

            <Text style={styles.label}>ID do Sensor (opcional)</Text>
            <TextInput style={styles.input} value={editForm.sensorId}
              onChangeText={(v) => setEditForm((p) => ({ ...p, sensorId: v }))}
              placeholder="Ex.: 1" placeholderTextColor="#475569" keyboardType="numeric" />

            <Text style={styles.label}>ID do Evento (opcional)</Text>
            <TextInput style={styles.input} value={editForm.eventId}
              onChangeText={(v) => setEditForm((p) => ({ ...p, eventId: v }))}
              placeholder="Ex.: 3" placeholderTextColor="#475569" keyboardType="numeric" />

            <Text style={styles.label}>Tipo de Alerta</Text>
            <View style={styles.optionRow}>
              {ALERT_TYPES.map((t) => (
                <TouchableOpacity key={t}
                  style={[styles.option, editForm.alertType === t && styles.optionActive]}
                  onPress={() => setEditForm((p) => ({ ...p, alertType: t }))}>
                  <Text style={[styles.optionText, editForm.alertType === t && styles.optionTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Severidade</Text>
            <View style={styles.optionRow}>
              {SEVERITIES.map((s) => (
                <TouchableOpacity key={s}
                  style={[styles.option, editForm.severity === s && styles.optionActive]}
                  onPress={() => setEditForm((p) => ({ ...p, severity: s }))}>
                  <Text style={[styles.optionText, editForm.severity === s && styles.optionTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Status</Text>
            <View style={styles.optionRow}>
              {STATUSES.map((s) => (
                <TouchableOpacity key={s}
                  style={[styles.option, editForm.status === s && styles.optionActive]}
                  onPress={() => setEditForm((p) => ({ ...p, status: s }))}>
                  <Text style={[styles.optionText, editForm.status === s && styles.optionTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.submitBtn, styles.updateBtn]} onPress={handleUpdate}>
              <Text style={styles.submitText}>Salvar alterações</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditItem(null)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  list: { padding: 16, paddingBottom: 88 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  row2: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  title: { color: '#f1f5f9', fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  type: { color: '#64748b', fontSize: 12 },
  msg: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 12 },
  editBtn: { padding: 6 },
  editText: { color: '#fb923c', fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 6 },
  deleteText: { color: '#f87171', fontSize: 12, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: '#ef4444', borderRadius: 24,
    paddingHorizontal: 20, paddingVertical: 12, elevation: 4,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalContent: { padding: 24, paddingBottom: 40 },
  modalTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#0f172a', borderRadius: 8, padding: 12,
    color: '#f1f5f9', borderWidth: 1, borderColor: '#334155', fontSize: 14,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a',
  },
  optionActive: { borderColor: '#ef4444', backgroundColor: '#2d0f0f' },
  optionText: { color: '#64748b', fontSize: 13 },
  optionTextActive: { color: '#f87171', fontWeight: '600' },
  submitBtn: { marginTop: 24, backgroundColor: '#ef4444', borderRadius: 10, padding: 14, alignItems: 'center' },
  updateBtn: { backgroundColor: '#dc2626' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { marginTop: 10, alignItems: 'center', padding: 12 },
  cancelText: { color: '#64748b', fontSize: 14 },
});
