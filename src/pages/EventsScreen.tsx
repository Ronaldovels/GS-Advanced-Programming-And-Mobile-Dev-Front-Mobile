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
import { eventsService } from '../services/eventsService';
import type { EventSeverity, EventType, MissionEvent } from '../types';

const EVENT_TYPES: EventType[] = ['LAUNCH', 'DOCKING', 'ANOMALY', 'MAINTENANCE'];
const SEVERITIES: EventSeverity[] = ['LOW', 'MEDIUM', 'HIGH'];

const EMPTY_FORM = {
  title: '',
  description: '',
  eventType: EVENT_TYPES[0] as EventType,
  severity: SEVERITIES[0] as EventSeverity,
  monitoredSystem: '',
  sensorId: '',
};

export default function EventsScreen() {
  const [events, setEvents] = useState<MissionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createVisible, setCreateVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<MissionEvent | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    try {
      const data = await eventsService.getAll();
      setEvents(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.title.trim() || !form.monitoredSystem.trim()) {
      Alert.alert('Atenção', 'Preencha título e sistema monitorado.');
      return;
    }
    const payload: Omit<MissionEvent, 'id'> = {
      title: form.title,
      description: form.description,
      eventType: form.eventType,
      severity: form.severity,
      monitoredSystem: form.monitoredSystem,
      ...(form.sensorId ? { sensor: { id: Number(form.sensorId) } } : {}),
    };
    try {
      await eventsService.create(payload);
      setCreateVisible(false);
      setForm(EMPTY_FORM);
      load();
    } catch {
      Alert.alert('Erro', 'Falha ao cadastrar evento.');
    }
  }

  function openEdit(item: MissionEvent) {
    setEditForm({
      title: item.title,
      description: item.description,
      eventType: item.eventType,
      severity: item.severity,
      monitoredSystem: item.monitoredSystem,
      sensorId: item.sensor ? String(item.sensor.id) : '',
    });
    setEditItem(item);
  }

  async function handleUpdate() {
    if (!editForm.title.trim() || !editForm.monitoredSystem.trim()) {
      Alert.alert('Atenção', 'Preencha título e sistema monitorado.');
      return;
    }
    const payload = {
      ...editItem,
      title: editForm.title,
      description: editForm.description,
      eventType: editForm.eventType,
      severity: editForm.severity,
      monitoredSystem: editForm.monitoredSystem,
      ...(editForm.sensorId ? { sensor: { id: Number(editForm.sensorId) } } : { sensor: undefined }),
    };
    try {
      await eventsService.update(editItem!.id, payload);
      setEditItem(null);
      load();
    } catch {
      Alert.alert('Erro', 'Falha ao atualizar evento.');
    }
  }

  async function doDelete() {
    if (deleteId === null) return;
    try {
      await eventsService.remove(deleteId);
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
        data={events}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum evento registrado.</Text>}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.title}>{item.title}</Text>
              <StatusBadge value={item.severity} />
            </View>
            <Text style={styles.sub}>{item.eventType} · {item.monitoredSystem}</Text>
            {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
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
        <Text style={styles.fabText}>+ Evento</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={deleteId !== null}
        message="Deseja remover este evento? Esta ação não pode ser desfeita."
        onConfirm={doDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Modal de criação */}
      <Modal visible={createVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Evento</Text>

            <Text style={styles.label}>Título</Text>
            <TextInput style={styles.input} value={form.title}
              onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
              placeholder="Ex.: Anomalia na Pressão" placeholderTextColor="#475569" />

            <Text style={styles.label}>Descrição</Text>
            <TextInput style={[styles.input, styles.textarea]} value={form.description}
              onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
              placeholder="Descreva o evento..." placeholderTextColor="#475569" multiline />

            <Text style={styles.label}>Sistema Monitorado</Text>
            <TextInput style={styles.input} value={form.monitoredSystem}
              onChangeText={(v) => setForm((p) => ({ ...p, monitoredSystem: v }))}
              placeholder="Ex.: Sistema de Suporte à Vida" placeholderTextColor="#475569" />

            <Text style={styles.label}>ID do Sensor (opcional)</Text>
            <TextInput style={styles.input} value={form.sensorId}
              onChangeText={(v) => setForm((p) => ({ ...p, sensorId: v }))}
              placeholder="Ex.: 1" placeholderTextColor="#475569" keyboardType="numeric" />

            <Text style={styles.label}>Tipo de Evento</Text>
            <View style={styles.optionRow}>
              {EVENT_TYPES.map((t) => (
                <TouchableOpacity key={t}
                  style={[styles.option, form.eventType === t && styles.optionActive]}
                  onPress={() => setForm((p) => ({ ...p, eventType: t }))}>
                  <Text style={[styles.optionText, form.eventType === t && styles.optionTextActive]}>{t}</Text>
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
            <Text style={styles.modalTitle}>Editar Evento</Text>

            <Text style={styles.label}>Título</Text>
            <TextInput style={styles.input} value={editForm.title}
              onChangeText={(v) => setEditForm((p) => ({ ...p, title: v }))}
              placeholder="Ex.: Anomalia na Pressão" placeholderTextColor="#475569" />

            <Text style={styles.label}>Descrição</Text>
            <TextInput style={[styles.input, styles.textarea]} value={editForm.description}
              onChangeText={(v) => setEditForm((p) => ({ ...p, description: v }))}
              placeholder="Descreva o evento..." placeholderTextColor="#475569" multiline />

            <Text style={styles.label}>Sistema Monitorado</Text>
            <TextInput style={styles.input} value={editForm.monitoredSystem}
              onChangeText={(v) => setEditForm((p) => ({ ...p, monitoredSystem: v }))}
              placeholder="Ex.: Sistema de Suporte à Vida" placeholderTextColor="#475569" />

            <Text style={styles.label}>ID do Sensor (opcional)</Text>
            <TextInput style={styles.input} value={editForm.sensorId}
              onChangeText={(v) => setEditForm((p) => ({ ...p, sensorId: v }))}
              placeholder="Ex.: 1" placeholderTextColor="#475569" keyboardType="numeric" />

            <Text style={styles.label}>Tipo de Evento</Text>
            <View style={styles.optionRow}>
              {EVENT_TYPES.map((t) => (
                <TouchableOpacity key={t}
                  style={[styles.option, editForm.eventType === t && styles.optionActive]}
                  onPress={() => setEditForm((p) => ({ ...p, eventType: t }))}>
                  <Text style={[styles.optionText, editForm.eventType === t && styles.optionTextActive]}>{t}</Text>
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
  title: { color: '#f1f5f9', fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  sub: { color: '#64748b', fontSize: 13 },
  desc: { color: '#94a3b8', fontSize: 13, marginTop: 6 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 12 },
  editBtn: { padding: 6 },
  editText: { color: '#a78bfa', fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 6 },
  deleteText: { color: '#f87171', fontSize: 12, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: '#8b5cf6', borderRadius: 24,
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
  optionActive: { borderColor: '#8b5cf6', backgroundColor: '#1e1040' },
  optionText: { color: '#64748b', fontSize: 13 },
  optionTextActive: { color: '#a78bfa', fontWeight: '600' },
  submitBtn: { marginTop: 24, backgroundColor: '#8b5cf6', borderRadius: 10, padding: 14, alignItems: 'center' },
  updateBtn: { backgroundColor: '#7c3aed' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { marginTop: 10, alignItems: 'center', padding: 12 },
  cancelText: { color: '#64748b', fontSize: 14 },
});
