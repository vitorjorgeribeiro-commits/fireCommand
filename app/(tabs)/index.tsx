import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, Plus, MapPin, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { THEME, ESTADO_LABELS, ESTADO_COLORS, FASE_LABELS } from '@/lib/constants';
import type { Ocorrencia } from '@/types/database';
import { Card, Badge, EmptyState } from '@/components/ui';
import { HeaderBar } from '@/components/controls';

export default function PainelScreen() {
  const router = useRouter();
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setOcorrencias(data as Ocorrencia[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const ativas = ocorrencias.filter((o) => o.estado === 'ativo' || o.estado === 'dominado');
  const rescaldo = ocorrencias.filter((o) => o.estado === 'rescaldo');
  const extintas = ocorrencias.filter((o) => o.estado === 'extinto');

  const getVariant = (estado: string) => {
    switch (estado) {
      case 'ativo': return 'danger' as const;
      case 'dominado': return 'warning' as const;
      case 'rescaldo': return 'info' as const;
      case 'extinto': return 'success' as const;
      default: return 'neutral' as const;
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="Guia de Comando" subtitle="Incêndios Florestais · Sistema de Gestão de Operações" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Flame size={22} color={THEME.primary} strokeWidth={2} />
            <Text style={styles.statNumber}>{ativas.length}</Text>
            <Text style={styles.statLabel}>Ativas</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={22} color={THEME.accent} strokeWidth={2} />
            <Text style={styles.statNumber}>{rescaldo.length}</Text>
            <Text style={styles.statLabel}>Rescaldo</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={22} color={THEME.success} strokeWidth={2} />
            <Text style={styles.statNumber}>{extintas.length}</Text>
            <Text style={styles.statLabel}>Extintas</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.newButton} onPress={() => router.push('/nova-ocorrencia')} activeOpacity={0.85}>
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.newButtonText}>Nova Ocorrência</Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>Ocorrências Ativas</Text>
        {loading ? (
          <Text style={styles.loadingText}>A carregar...</Text>
        ) : ativas.length === 0 ? (
          <EmptyState
            icon={<Flame size={48} color={THEME.textMuted} strokeWidth={1.5} />}
            title="Sem ocorrências ativas"
            subtitle="Crie uma nova ocorrência para iniciar o guia de comando"
          />
        ) : (
          <View style={styles.listContainer}>
            {ativas.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => router.push(`/ocorrencia/${item.id}`)} activeOpacity={0.7}>
                <Card style={styles.occCard}>
                  <View style={styles.occCardHeader}>
                    <View style={styles.occIconBox}>
                      <Flame size={18} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.occTitle}>{item.designacao || `Ocorrência ${item.numero || ''}`.trim() || 'Sem designação'}</Text>
                      <Text style={styles.occSubtitle}>{FASE_LABELS[item.fase]}</Text>
                    </View>
                    <Badge label={ESTADO_LABELS[item.estado]} variant={getVariant(item.estado)} size="small" />
                  </View>
                  <View style={styles.occMeta}>
                    {item.freguesia && item.municipio && (
                      <View style={styles.metaItem}>
                        <MapPin size={13} color={THEME.textMuted} strokeWidth={2} />
                        <Text style={styles.metaText}>{item.freguesia}, {item.municipio}</Text>
                      </View>
                    )}
                    {item.data_hora && (
                      <View style={styles.metaItem}>
                        <Clock size={13} color={THEME.textMuted} strokeWidth={2} />
                        <Text style={styles.metaText}>{new Date(item.data_hora).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {rescaldo.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Em Rescaldo</Text>
            <View style={styles.listContainer}>
              {rescaldo.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => router.push(`/ocorrencia/${item.id}`)} activeOpacity={0.7}>
                  <Card style={styles.occCard}>
                    <View style={styles.occCardHeader}>
                      <View style={[styles.occIconBox, { backgroundColor: THEME.accent }]}>
                        <AlertTriangle size={18} color="#FFFFFF" strokeWidth={2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.occTitle}>{item.designacao || 'Sem designação'}</Text>
                        <Text style={styles.occSubtitle}>{FASE_LABELS[item.fase]}</Text>
                      </View>
                      <Badge label={ESTADO_LABELS[item.estado]} variant="info" size="small" />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: THEME.text,
    marginTop: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.primary,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 16,
  },
  newButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    color: THEME.text,
    marginTop: 24,
    marginBottom: 12,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: THEME.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
  listContainer: { gap: 10 },
  occCard: { padding: 14 },
  occCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  occIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  occTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: THEME.text,
  },
  occSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  occMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    marginLeft: 48,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: THEME.textMuted,
  },
});
