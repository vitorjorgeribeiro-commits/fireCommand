import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FileText, Info, Shield } from 'lucide-react-native';
import { THEME } from '@/lib/constants';
import { Card, SectionTitle } from '@/components/ui';
import { HeaderBar } from '@/components/controls';

export default function ConfiguracoesScreen() {
  return (
    <View style={styles.container}>
      <HeaderBar title="Definições" subtitle="Informação e configuração" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoIconBox}>
              <FileText size={22} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Guia de Comando</Text>
              <Text style={styles.infoSubtitle}>Incêndios Florestais · Fase I</Text>
            </View>
          </View>
          <Text style={styles.infoBody}>
            Aplicação baseada no Guia de Comando para Incêndios Florestais do Sistema de Gestão de Operações (SGO).
            Permite registar o Ponto de Situação Inicial/Reconhecimento, gerir Pontos de Situação (POSITs),
            alocar Meios e acompanhar a evolução da ocorrência até à conclusão/rescaldo.
          </Text>
        </Card>

        <SectionTitle>Estrutura do Guia</SectionTitle>
        <Card style={styles.sectionCard}>
          <View style={styles.sectionRow}>
            <Info size={18} color={THEME.primary} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionRowTitle}>Ponto de Situação Inicial</Text>
              <Text style={styles.sectionRowBody}>Reconhecimento: localização, intensidade, meteorologia, acessos, pontos sensíveis</Text>
            </View>
          </View>
          <View style={styles.sectionRow}>
            <Info size={18} color={THEME.accent} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionRowTitle}>Pontos de Situação (POSITs)</Text>
              <Text style={styles.sectionRowBody}>Actualizações periódicas: o que faço, o que vejo, solicito, progressão</Text>
            </View>
          </View>
          <View style={styles.sectionRow}>
            <Info size={18} color={THEME.secondary} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionRowTitle}>Meios</Text>
              <Text style={styles.sectionRowBody}>Brigadas, grupos de combate, meio aéreo e outros recursos alocados</Text>
            </View>
          </View>
          <View style={styles.sectionRow}>
            <Info size={18} color={THEME.success} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionRowTitle}>Conclusão / Rescaldo</Text>
              <Text style={styles.sectionRowBody}>Finalização da ocorrência: extinção e consolidação</Text>
            </View>
          </View>
        </Card>

        <SectionTitle>Sobre</SectionTitle>
        <Card style={styles.aboutCard}>
          <View style={styles.sectionRow}>
            <Shield size={18} color={THEME.textSecondary} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionRowBody}>
                Os dados são armazenados de forma segura na nuvem. Esta ferramenta digitaliza o formulário
                de papel usado pelos Comandantes das Operações de Socorro (COS) em Portugal.
              </Text>
            </View>
          </View>
        </Card>

        <Text style={styles.versionText}>Versão 1.0.0 · Fase I</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  infoCard: { padding: 18 },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    color: THEME.text,
  },
  infoSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 2,
  },
  infoBody: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 22,
    color: THEME.textSecondary,
  },
  sectionCard: { padding: 16, gap: 14 },
  sectionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  sectionRowTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: THEME.text,
    marginBottom: 3,
  },
  sectionRowBody: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 19,
    color: THEME.textSecondary,
  },
  aboutCard: { padding: 16 },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
});
