import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { History, CheckCircle, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { THEME, ESTADO_LABELS, FASE_LABELS } from '@/lib/constants';
import type { Ocorrencia } from '@/types/database';
import { Card, Badge, EmptyState } from '@/components/ui';
import { HeaderBar } from '@/components/controls';

export default function HistoricoScreen() {
  const router = useRouter();
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .in('estado', ['extinto', 'rescaldo'])
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

  return (
    <View style={styles.container}>
      <HeaderBar title="Histórico" subtitle="Ocorrências concluídas e em rescaldo" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />}
      >
        {loading ? (
          <Text style={styles.loadingText}>A carregar...</Text>
        ) : ocorrencias.length === 0 ? (
          <EmptyState
            icon={<History size={48} color={THEME.textMuted} strokeWidth={1.5} />}
            title="Sem histórico"
            subtitle="As ocorrências concluídas aparecerão aqui"
          />
        ) : (
          <View style={styles.listContainer}>
            {ocorrencias.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => router.push(`/ocorrencia/${item.id}`)} activeOpacity={0.7}>
                <Card style={styles.occCard}>
                  <View style={styles.occCardHeader}>
                    <View style={[styles.occIconBox, { backgroundColor: item.estado === 'extinto' ? THEME.success : THEME.accent }]}>
                      <CheckCircle size={18} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.occTitle}>{item.designacao || 'Sem designação'}</Text>
                      <Text style={styles.occSubtitle}>{FASE_LABELS[item.fase]}</Text>
                    </View>
                    <Badge label={ESTADO_LABELS[item.estado]} variant={item.estado === 'extinto' ? 'success' : 'info'} size="small" />
                  </View>
                  <View style={styles.occMeta}>
                    {item.freguesia && item.municipio && (
                      <View style={styles.metaItem}>
                        <MapPin size={13} color={THEME.textMuted} strokeWidth={2} />
                        <Text style={styles.metaText}>{item.freguesia}, {item.municipio}</Text>
                      </View>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
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
});
