import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, MapPin, Clock, Plus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { THEME, ESTADO_LABELS, FASE_LABELS } from '@/lib/constants';
import type { Ocorrencia } from '@/types/database';
import { Card, Badge, EmptyState } from '@/components/ui';
import { HeaderBar } from '@/components/controls';

export default function OcorrenciasScreen() {
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
      <HeaderBar title="Ocorrências" subtitle="Todas as ocorrências registadas" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />}
      >
        {loading ? (
          <Text style={styles.loadingText}>A carregar...</Text>
        ) : ocorrencias.length === 0 ? (
          <EmptyState
            icon={<Flame size={48} color={THEME.textMuted} strokeWidth={1.5} />}
            title="Nenhuma ocorrência registada"
            subtitle="Crie a primeira ocorrência para começar"
          />
        ) : (
          <View style={styles.listContainer}>
            {ocorrencias.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => router.push(`/ocorrencia/${item.id}`)} activeOpacity={0.7}>
                <Card style={styles.occCard}>
                  <View style={styles.occCardHeader}>
                    <View style={[styles.occIconBox, { backgroundColor: item.estado === 'ativo' ? THEME.primary : item.estado === 'extinto' ? THEME.success : THEME.accent }]}>
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
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/nova-ocorrencia')} activeOpacity={0.85}>
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 },
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
