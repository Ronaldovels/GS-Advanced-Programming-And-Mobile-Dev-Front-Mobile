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
import { sensorsService } from '../services/sensorsService';
import type { Sensor, SensorStatus, SensorType } from '../types';

const SENSOR_TYPES: SensorType[] = ['TEMPERATURA', 'PRESSAO', 'RADIACAO'];
const SENSOR_STATUSES: SensorStatus[] = ['ACTIVE', 'INACTIVE', 'FAULT'];

const EMPTY_FORM = {
  name: '',
  type: SENSOR_TYPES[0] as SensorType,
  location: '',
  status: SENSOR_STATUSES[0] as SensorStatus,
};

export default function SensorsScreen() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [createVisible, setCreateVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<Sensor | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    try {
      const data = await sensorsService.getAll();
      setSensors(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os sensores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.name.trim() || !form.location.trim()) {
      Alert.alert('Atenção', 'Preencha nome e localização.');
      return;
    }
    try {
      await sensorsService.create(form);
      setCreateVisible(false);
      setForm(EMPTY_FORM);
      load();
    } catch {
      Alert.alert('Erro', 'Falha ao cadastrar sensor.');
    }
  }

  function openEdit(item: Sensor) {
    setEditForm({ name: item.name, type: item.type, location: item.location, status: item.status });
    setEditItem(item);
  }

  async function handleUpdate() {
    if (!editForm.name.trim() || !editForm.location.trim()) {
      Alert.alert('Atenção', 'Preencha nome e localização.');
      return;
    }
    const payload = {
      ...editItem,
      name: editForm.name,
      type: editForm.type,
      location: editForm.location,
      status: editForm.status,
    };
    try {
      await sensorsService.update(editItem!.id, payload);
      setEditItem(null);
      load();
    } catch {
      Alert.alert('Erro', 'Falha ao atualizar sensor.');
    }
  }

  async function doDelete() {
    if (deleteId === null) return;
    try {
      await sensorsService.remove(deleteId);
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
        data={sensors}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum sensor cadastrado.</Text>}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.title}>{item.name}</Text>
              <StatusBadge value={item.status} />
            </View>
            <Text style={styles.sub}>{item.type} · {item.location}</Text>
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
        <Text style={styles.fabText}>+ Sensor</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={deleteId !== null}
        message="Deseja remover este sensor? Esta ação não pode ser desfeita."
        onConfirm={doDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Modal de criação */}
      <Modal visible={createVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Sensor</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={form.name}
              onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
              placeholder="Ex.: Sensor de Temperatura" placeholderTextColor="#475569" />

            <Text style={styles.label}>Localização</Text>
            <TextInput style={styles.input} value={form.location}
              onChangeText={(v) => setForm((p) => ({ ...p, location: v }))}
              placeholder="Ex.: Núcleo de Propulsão" placeholderTextColor="#475569" />

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.optionRow}>
              {SENSOR_TYPES.map((t) => (
                <TouchableOpacity key={t}
                  style={[styles.option, form.type === t && styles.optionActive]}
                  onPress={() => setForm((p) => ({ ...p, type: t }))}>
                  <Text style={[styles.optionText, form.type === t && styles.optionTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Status</Text>
            <View style={styles.optionRow}>
              {SENSOR_STATUSES.map((s) => (
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
            <Text style={styles.modalTitle}>Editar Sensor</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={editForm.name}
              onChangeText={(v) => setEditForm((p) => ({ ...p, name: v }))}
              placeholder="Ex.: Sensor de Temperatura" placeholderTextColor="#475569" />

            <Text style={styles.label}>Localização</Text>
            <TextInput style={styles.input} value={editForm.location}
              onChangeText={(v) => setEditForm((p) => ({ ...p, location: v }))}
              placeholder="Ex.: Núcleo de Propulsão" placeholderTextColor="#475569" />

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.optionRow}>
              {SENSOR_TYPES.map((t) => (
                <TouchableOpacity key={t}
                  style={[styles.option, editForm.type === t && styles.optionActive]}
                  onPress={() => setEditForm((p) => ({ ...p, type: t }))}>
                  <Text style={[styles.optionText, editForm.type === t && styles.optionTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Status</Text>
            <View style={styles.optionRow}>
              {SENSOR_STATUSES.map((s) => (
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
  title: { color: '#f1f5f9', fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  sub: { color: '#64748b', fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 12 },
  editBtn: { padding: 6 },
  editText: { color: '#38bdf8', fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 6 },
  deleteText: { color: '#f87171', fontSize: 12, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: '#0ea5e9', borderRadius: 24,
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
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a',
  },
  optionActive: { borderColor: '#0ea5e9', backgroundColor: '#0c2a3d' },
  optionText: { color: '#64748b', fontSize: 13 },
  optionTextActive: { color: '#38bdf8', fontWeight: '600' },
  submitBtn: { marginTop: 24, backgroundColor: '#0ea5e9', borderRadius: 10, padding: 14, alignItems: 'center' },
  updateBtn: { backgroundColor: '#0284c7' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { marginTop: 10, alignItems: 'center', padding: 12 },
  cancelText: { color: '#64748b', fontSize: 14 },
});
