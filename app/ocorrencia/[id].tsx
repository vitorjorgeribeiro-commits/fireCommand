import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, RefreshControl, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft, Flame, MapPin, Eye, Hand, HelpCircle, UserCheck,
  Clock, Plus, Activity, Truck, Trash2, Save,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import {
  THEME, ESTADO_LABELS, ESTADO_COLORS, FASE_LABELS, INTENSIDADE_LABELS,
  DECLIVE_LABELS, COMBUSTIVEL_LABELS, ACESSOS_LABELS, MEIO_LABELS,
} from '@/lib/constants';
import type {
  Ocorrencia, PontoSituacao, Meio, EstadoOcorrencia, FaseOcorrencia,
  TipoMeio, TipoCombustivel, TipoAcesso, PontoSituacaoInsert, MeioInsert,
} from '@/types/database';
import { Card, Badge, SectionTitle, Field, Divider } from '@/components/ui';
import { InputField, SelectField, PrimaryButton } from '@/components/controls';

export default function OcorrenciaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [ocorrencia, setOcorrencia] = useState<Ocorrencia | null>(null);
  const [posits, setPosits] = useState<PontoSituacao[]>([]);
  const [meios, setMeios] = useState<Meio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPositModal, setShowPositModal] = useState(false);
  const [showMeioModal, setShowMeioModal] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    const [{ data: occData, error: occError }, { data: posData }, { data: meiData }] = await Promise.all([
      supabase.from('ocorrencias').select('*').eq('id', id).maybeSingle(),
      supabase.from('pontos_situacao').select('*').eq('ocorrencia_id', id).order('numero_posit', { ascending: true }),
      supabase.from('meios').select('*').eq('ocorrencia_id', id).order('created_at', { ascending: true }),
    ]);
    if (!occError && occData) setOcorrencia(occData as Ocorrencia);
    if (posData) setPosits(posData as PontoSituacao[]);
    if (meiData) setMeios(meiData as Meio[]);
    setLoading(false);
    setRefreshing(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const updateEstado = async (newEstado: EstadoOcorrencia) => {
    if (!ocorrencia) return;
    const faseMap: Record<EstadoOcorrencia, FaseOcorrencia> = {
      ativo: 'curso', dominado: 'curso', rescaldo: 'conclusao', extinto: 'conclusao',
    };
    const { error } = await supabase
      .from('ocorrencias')
      .update({ estado: newEstado, fase: faseMap[newEstado], updated_at: new Date().toISOString() })
      .eq('id', ocorrencia.id);
    if (!error) fetchData();
  };

  const deleteOcorrencia = () => {
    if (!ocorrencia) return;
    Alert.alert('Confirmar eliminação', 'Tem a certeza que pretende eliminar esta ocorrência?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          await supabase.from('ocorrencias').delete().eq('id', ocorrencia.id);
          router.replace('/(tabs)/ocorrencias');
        },
      },
    ]);
  };

  const getVariant = (estado: string) => {
    switch (estado) {
      case 'ativo': return 'danger' as const;
      case 'dominado': return 'warning' as const;
      case 'rescaldo': return 'info' as const;
      case 'extinto': return 'success' as const;
      default: return 'neutral' as const;
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>A carregar ocorrência...</Text></View>;
  }
  if (!ocorrencia) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Ocorrência não encontrada</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>Ocorrência</Text>
        <TouchableOpacity onPress={deleteOcorrencia} style={styles.backButton}>
          <Trash2 size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />}>

        {/* Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerCardTop}>
            <View style={styles.headerIconBox}><Flame size={22} color="#FFFFFF" strokeWidth={2} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>{ocorrencia.designacao || 'Sem designação'}</Text>
              {ocorrencia.numero && <Text style={styles.headerSubtitle}>Ocorr. Nº {ocorrencia.numero}</Text>}
            </View>
            <Badge label={ESTADO_LABELS[ocorrencia.estado]} variant={getVariant(ocorrencia.estado)} />
          </View>
          <View style={styles.headerMeta}>
            <View style={styles.metaItem}>
              <Clock size={13} color={THEME.textMuted} strokeWidth={2} />
              <Text style={styles.metaText}>{ocorrencia.data_hora ? new Date(ocorrencia.data_hora).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}</Text>
            </View>
            <Text style={styles.metaPhase}>{FASE_LABELS[ocorrencia.fase]}</Text>
          </View>
        </Card>

        {/* Estado */}
        <SectionTitle>Estado da Ocorrência</SectionTitle>
        <View style={styles.estadoRow}>
          {(['ativo', 'dominado', 'rescaldo', 'extinto'] as EstadoOcorrencia[]).map((est) => {
            const active = ocorrencia.estado === est;
            return (
              <TouchableOpacity key={est}
                style={[styles.estadoChip, active && { backgroundColor: ESTADO_COLORS[est], borderColor: ESTADO_COLORS[est] }]}
                onPress={() => updateEstado(est)}>
                <Text style={[styles.estadoChipText, active && styles.estadoChipTextActive]}>{ESTADO_LABELS[est]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ESTOU */}
        <SectionTitle style={styles.sectionWithIcon}>
          <View style={styles.sectionTitleRow}>
            <MapPin size={18} color={THEME.primary} strokeWidth={2.5} />
            <Text style={styles.sectionTitleText}>ESTOU</Text>
          </View>
        </SectionTitle>
        <Card>
          <Field label="Estou em" value={ocorrencia.estou_em} />
          <Field label="Coord." value={ocorrencia.coordenadas} />
          <Field label="Freguesia" value={ocorrencia.freguesia} />
          <Field label="Município" value={ocorrencia.municipio} />
        </Card>

        {/* VEJO */}
        <SectionTitle style={styles.sectionWithIcon}>
          <View style={styles.sectionTitleRow}>
            <Eye size={18} color={THEME.secondary} strokeWidth={2.5} />
            <Text style={styles.sectionTitleText}>VEJO</Text>
          </View>
        </SectionTitle>
        <Card>
          <Text style={styles.subGroupLabel}>Incêndio</Text>
          <Field label="Intensidade" value={ocorrencia.intensidade ? INTENSIDADE_LABELS[ocorrencia.intensidade] : null} />
          <Field label="Combustível" value={ocorrencia.tipo_combustivel ? ocorrencia.tipo_combustivel.split('; ').map((v) => COMBUSTIVEL_LABELS[v as TipoCombustivel] || v).join(', ') : null} />
          <Divider />
          <Text style={styles.subGroupLabel}>Propagação</Text>
          <Field label="Direção" value={ocorrencia.propagacao} />
          <Field label="Continuidade Vert." value={ocorrencia.continuidade_vert === 'sim' ? 'Sim' : ocorrencia.continuidade_vert === 'nao' ? 'Não' : null} />
          <Field label="Continuidade Horiz." value={ocorrencia.continuidade_horiz === 'sim' ? 'Sim' : ocorrencia.continuidade_horiz === 'nao' ? 'Não' : null} />
          <Divider />
          <Text style={styles.subGroupLabel}>Condições Meteorológicas</Text>
          <Field label="Vento (Direção)" value={ocorrencia.vento_direcao} />
          <Field label="Vento (Velocidade)" value={ocorrencia.vento_velocidade ? `${ocorrencia.vento_velocidade} km/h` : null} />
          <Field label="Temperatura" value={ocorrencia.temperatura ? `${ocorrencia.temperatura} °C` : null} />
          <Field label="Humidade" value={ocorrencia.humidade ? `${ocorrencia.humidade} %HR` : null} />
          <Divider />
          <Text style={styles.subGroupLabel}>Terreno</Text>
          <Field label="Declive" value={ocorrencia.declive ? DECLIVE_LABELS[ocorrencia.declive] : null} />
          <Field label="Acessos" value={ocorrencia.acessos ? ocorrencia.acessos.split('; ').map((v) => ACESSOS_LABELS[v as TipoAcesso] || v).join(', ') : null} />
          <Divider />
          <Text style={styles.subGroupLabel}>Pontos Sensíveis</Text>
          {ocorrencia.pontos_sensiveis ? (
            <View style={styles.pontosSensiveisList}>
              {ocorrencia.pontos_sensiveis.split('; ').map((ps, idx) => (
                <View key={idx} style={styles.pontoSensivelChip}>
                  <Text style={styles.pontoSensivelText}>
                    {ps.startsWith('outro: ') ? ps.substring(6) : ps.charAt(0).toUpperCase() + ps.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptySubtext}>Nenhum ponto sensível registado.</Text>
          )}
        </Card>

        {/* FAÇO */}
        <SectionTitle style={styles.sectionWithIcon}>
          <View style={styles.sectionTitleRow}>
            <Hand size={18} color={THEME.accent} strokeWidth={2.5} />
            <Text style={styles.sectionTitleText}>FAÇO</Text>
          </View>
        </SectionTitle>
        <Card>
          <Field label="Faço" value={ocorrencia.faco} />
          {ocorrencia.implemento && (
            <Field label="Implemento" value={ocorrencia.implemento === 'protocolo_laces' ? 'Protocolo de Segurança LACE' : ocorrencia.implemento} />
          )}
          <Field label="Ponto de Trânsito" value={ocorrencia.ponto_transito} />
        </Card>

        {/* SOLICITO */}
        <SectionTitle style={styles.sectionWithIcon}>
          <View style={styles.sectionTitleRow}>
            <HelpCircle size={18} color={THEME.primary} strokeWidth={2.5} />
            <Text style={styles.sectionTitleText}>SOLICITO</Text>
          </View>
        </SectionTitle>
        <Card>
          <Field label="Solicito" value={ocorrencia.solicito} />
        </Card>

        {/* Assumo COS */}
        <SectionTitle style={styles.sectionWithIcon}>
          <View style={styles.sectionTitleRow}>
            <UserCheck size={18} color={THEME.secondary} strokeWidth={2.5} />
            <Text style={styles.sectionTitleText}>Assumo COS</Text>
          </View>
        </SectionTitle>
        <Card>
          <Field label="Assumo COS" value={ocorrencia.assumo_cos} />
          <Field label="Passagem de COS para" value={ocorrencia.passagem_cos_para} />
          {ocorrencia.observacoes && (
            <>
              <Divider />
              <Field label="Observações" value={ocorrencia.observacoes} />
            </>
          )}
        </Card>

        {/* POSITs */}
        <View style={styles.sectionHeaderRow}>
          <SectionTitle style={{ marginBottom: 0 }}>
            <View style={styles.sectionTitleRow}>
              <Activity size={18} color={THEME.accent} strokeWidth={2.5} />
              <Text style={styles.sectionTitleText}>PONTOS DE SITUAÇÃO (POSITs)</Text>
            </View>
          </SectionTitle>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowPositModal(true)}>
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        {posits.length === 0 ? (
          <Text style={styles.emptySubtext}>Nenhum POSIT registado. Adicione o 1º POSIT.</Text>
        ) : (
          <View style={styles.listContainer}>
            {posits.map((p, idx) => (
              <Card key={p.id} style={styles.positCard}>
                <View style={styles.positHeader}>
                  <View style={[styles.positNumberBox, { backgroundColor: idx === 0 ? THEME.primary : THEME.secondary }]}>
                    <Text style={styles.positNumberText}>{p.numero_posit}º</Text>
                  </View>
                  <Text style={styles.positTitle}>POSIT</Text>
                  {p.hr_posit && (
                    <View style={styles.positTime}>
                      <Clock size={12} color={THEME.textMuted} strokeWidth={2} />
                      <Text style={styles.positTimeText}>{p.hr_posit}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.deleteIcon} onPress={async () => { await supabase.from('pontos_situacao').delete().eq('id', p.id); fetchData(); }}>
                    <Trash2 size={15} color={THEME.textMuted} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <Divider />
                <Field label="Faço" value={p.faço} />
                <Field label="Vejo" value={p.vejo} />
                <Field label="Em" value={p.em} />
                <Field label="Com" value={p.com} />
                <Field label="Solicito" value={p.solicito} />
                <Field label="Progredir para" value={p.progredir_para} />
                {p.observacoes && <Field label="Observações" value={p.observacoes} />}
              </Card>
            ))}
          </View>
        )}

        {/* MEIOS */}
        <View style={styles.sectionHeaderRow}>
          <SectionTitle style={{ marginBottom: 0 }}>
            <View style={styles.sectionTitleRow}>
              <Truck size={18} color={THEME.primary} strokeWidth={2.5} />
              <Text style={styles.sectionTitleText}>MEIOS</Text>
            </View>
          </SectionTitle>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowMeioModal(true)}>
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        {meios.length === 0 ? (
          <Text style={styles.emptySubtext}>Nenhum meio alocado.</Text>
        ) : (
          <View style={styles.listContainer}>
            {meios.map((m) => (
              <Card key={m.id} style={styles.meioCard}>
                <View style={styles.meioHeader}>
                  <View style={styles.meioIconBox}><Truck size={16} color="#FFFFFF" strokeWidth={2} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.meioType}>{MEIO_LABELS[m.meio]}</Text>
                    {m.entidade && <Text style={styles.meioEntity}>{m.entidade}</Text>}
                  </View>
                  <View style={styles.meioQtyBox}><Text style={styles.meioQty}>{m.quantidade}</Text></View>
                  <TouchableOpacity style={styles.deleteIcon} onPress={async () => { await supabase.from('meios').delete().eq('id', m.id); fetchData(); }}>
                    <Trash2 size={15} color={THEME.textMuted} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                {m.missao && <Field label="Missão" value={m.missao} />}
                {m.hr_no_to && <Field label="Hr. no TO" value={m.hr_no_to} />}
              </Card>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      <PositModal visible={showPositModal} onClose={() => setShowPositModal(false)} ocorrenciaId={ocorrencia.id} nextPositNumber={posits.length + 1} onSaved={() => { setShowPositModal(false); fetchData(); }} />
      <MeioModal visible={showMeioModal} onClose={() => setShowMeioModal(false)} ocorrenciaId={ocorrencia.id} onSaved={() => { setShowMeioModal(false); fetchData(); }} />
    </View>
  );
}

function PositModal({ visible, onClose, ocorrenciaId, nextPositNumber, onSaved }: {
  visible: boolean; onClose: () => void; ocorrenciaId: string; nextPositNumber: number; onSaved: () => void;
}) {
  const [hrPosit, setHrPosit] = useState('');
  const [faco, setFaco] = useState('');
  const [vejo, setVejo] = useState('');
  const [em, setEm] = useState('');
  const [com, setCom] = useState('');
  const [solicito, setSolicito] = useState('');
  const [progredirPara, setProgredirPara] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setHrPosit(''); setFaco(''); setVejo(''); setEm(''); setCom(''); setSolicito(''); setProgredirPara(''); setObservacoes(''); setError(null);
  };

  const handleSave = async () => {
    setSaving(true); setError(null);
    const insert: PontoSituacaoInsert = {
      ocorrencia_id: ocorrenciaId, numero_posit: nextPositNumber,
      hr_posit: hrPosit || null, faço: faco || null, vejo: vejo || null,
      em: em || null, com: com || null, solicito: solicito || null,
      progredir_para: progredirPara || null, observacoes: observacoes || null,
    };
    const { error: insertError } = await supabase.from('pontos_situacao').insert(insert);
    if (insertError) { setError('Erro ao guardar POSIT: ' + insertError.message); setSaving(false); return; }
    setSaving(false); reset(); onSaved();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalTopBar}>
          <TouchableOpacity onPress={() => { reset(); onClose(); }} style={styles.backButton}>
            <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{nextPositNumber}º POSIT</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Card>
            <InputField label="Hr. POSIT" value={hrPosit} onChangeText={setHrPosit} placeholder="HH:MM" keyboardType="numeric" />
            <InputField label="Faço" value={faco} onChangeText={setFaco} placeholder="O que estou a fazer" multiline />
            <InputField label="Vejo" value={vejo} onChangeText={setVejo} placeholder="O que vejo" multiline />
            <InputField label="Em" value={em} onChangeText={setEm} placeholder="Localização" />
            <InputField label="Com" value={com} onChangeText={setCom} placeholder="Com quem" />
            <InputField label="Solicito" value={solicito} onChangeText={setSolicito} placeholder="Recursos solicitados (quantificar)" multiline />
            <InputField label="Progredir para" value={progredirPara} onChangeText={setProgredirPara} placeholder="Destino" />
            <InputField label="Observações" value={observacoes} onChangeText={setObservacoes} placeholder="Notas" multiline />
          </Card>
          {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
          <PrimaryButton label="Guardar POSIT" onPress={handleSave} disabled={saving} icon={<Save size={18} color="#FFFFFF" strokeWidth={2} />} />
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function MeioModal({ visible, onClose, ocorrenciaId, onSaved }: {
  visible: boolean; onClose: () => void; ocorrenciaId: string; onSaved: () => void;
}) {
  const [meio, setMeio] = useState<TipoMeio | null>(null);
  const [entidade, setEntidade] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [missao, setMissao] = useState('');
  const [hrNoTo, setHrNoTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setMeio(null); setEntidade(''); setQuantidade('1'); setMissao(''); setHrNoTo(''); setError(null); };

  const handleSave = async () => {
    if (!meio) { setError('Seleccione o tipo de meio'); return; }
    setSaving(true); setError(null);
    const insert: MeioInsert = {
      ocorrencia_id: ocorrenciaId, meio: meio, entidade: entidade || null,
      quantidade: parseInt(quantidade) || 1, missao: missao || null, hr_no_to: hrNoTo || null,
    };
    const { error: insertError } = await supabase.from('meios').insert(insert);
    if (insertError) { setError('Erro ao guardar meio: ' + insertError.message); setSaving(false); return; }
    setSaving(false); reset(); onSaved();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalTopBar}>
          <TouchableOpacity onPress={() => { reset(); onClose(); }} style={styles.backButton}>
            <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Adicionar Meio</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Card>
            <SelectField label="Tipo de Meio" value={meio} onSelect={(v) => setMeio(v as TipoMeio)}
              options={Object.entries(MEIO_LABELS).map(([value, label]) => ({ value, label }))} />
            <InputField label="Entidade" value={entidade} onChangeText={setEntidade} placeholder="Organização / Corpo" />
            <InputField label="Quantidade" value={quantidade} onChangeText={setQuantidade} placeholder="1" keyboardType="numeric" />
            <InputField label="Missão" value={missao} onChangeText={setMissao} placeholder="Missão atribuída" multiline />
            <InputField label="Hr. no TO" value={hrNoTo} onChangeText={setHrNoTo} placeholder="HH:MM" keyboardType="numeric" />
          </Card>
          {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
          <PrimaryButton label="Guardar Meio" onPress={handleSave} disabled={saving} icon={<Save size={18} color="#FFFFFF" strokeWidth={2} />} />
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.background },
  loadingText: { fontFamily: 'Inter-Regular', fontSize: 14, color: THEME.textMuted },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.primaryDark, paddingTop: 50, paddingBottom: 14, paddingHorizontal: 12 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  topBarTitle: { fontFamily: 'Inter-Bold', fontSize: 18, color: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  headerCard: { padding: 16 },
  headerCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconBox: { width: 46, height: 46, borderRadius: 12, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 18, color: THEME.text, flex: 1 },
  headerSubtitle: { fontFamily: 'Inter-Regular', fontSize: 13, color: THEME.textMuted, marginTop: 2 },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12, marginLeft: 58 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: 'Inter-Regular', fontSize: 12, color: THEME.textMuted },
  metaPhase: { fontFamily: 'Inter-Medium', fontSize: 12, color: THEME.secondary },
  estadoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  estadoChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: THEME.borderDark, backgroundColor: '#F8FAFC' },
  estadoChipText: { fontFamily: 'Inter-Medium', fontSize: 13, color: THEME.textSecondary },
  estadoChipTextActive: { color: '#FFFFFF' },
  sectionWithIcon: { marginTop: 18, marginBottom: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitleText: { fontFamily: 'Inter-Bold', fontSize: 16, color: THEME.text },
  subGroupLabel: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: THEME.textMuted, marginBottom: 8, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 8 },
  addBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center' },
  listContainer: { gap: 10 },
  positCard: { padding: 14 },
  positHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  positNumberBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  positNumberText: { fontFamily: 'Inter-Bold', fontSize: 13, color: '#FFFFFF' },
  positTitle: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: THEME.text, flex: 1 },
  positTime: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  positTimeText: { fontFamily: 'Inter-Regular', fontSize: 12, color: THEME.textMuted },
  deleteIcon: { padding: 6 },
  meioCard: { padding: 14 },
  meioHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  meioIconBox: { width: 34, height: 34, borderRadius: 8, backgroundColor: THEME.secondary, justifyContent: 'center', alignItems: 'center' },
  meioType: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: THEME.text },
  meioEntity: { fontFamily: 'Inter-Regular', fontSize: 12, color: THEME.textMuted, marginTop: 2 },
  meioQtyBox: { minWidth: 32, height: 28, borderRadius: 8, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  meioQty: { fontFamily: 'Inter-Bold', fontSize: 15, color: THEME.text },
  emptySubtext: { fontFamily: 'Inter-Regular', fontSize: 13, color: THEME.textMuted, marginBottom: 8 },
  pontosSensiveisList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pontoSensivelChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: THEME.borderDark,
    backgroundColor: '#F8FAFC',
  },
  pontoSensivelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: THEME.textSecondary,
  },
  modalContainer: { flex: 1, backgroundColor: THEME.background },
  modalTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.primaryDark, paddingTop: 50, paddingBottom: 14, paddingHorizontal: 12 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, marginTop: 16 },
  errorText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#991B1B' },
});
