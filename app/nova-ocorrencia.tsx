import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, MapPin, Eye, Hand, HelpCircle, UserCheck, LocateFixed, CloudSun, Radio, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { THEME, INTENSIDADE_LABELS, DECLIVE_LABELS, COMBUSTIVEL_LABELS, ACESSOS_LABELS, MANOBRA_LABELS, PONTO_CARDEAL, PONTOS_SENSIVEIS_OPTIONS, IMPLEMENTO_OPTIONS, SOLICITO_OPTIONS } from '@/lib/constants';
import type { Intensidade, Declive, TipoCombustivel, TipoAcesso, TipoManobra, OcorrenciaInsert } from '@/types/database';
import { Card, SectionTitle, Divider } from '@/components/ui';
import { InputField, SelectField, PrimaryButton, SecondaryButton } from '@/components/controls';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function NovaOcorrenciaScreen() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ESTOU
  const [estouEm, setEstouEm] = useState('');
  const [coord, setCoord] = useState('');
  const [freguesia, setFreguesia] = useState('');
  const [municipio, setMunicipio] = useState('');

  // VEJO
  const [intensidade, setIntensidade] = useState<Intensidade | null>(null);
  const [tiposCombustivel, setTiposCombustivel] = useState<string[]>([]);
  const [propagacao, setPropagacao] = useState<string | null>(null);
  const [continuidadeVert, setContinuidadeVert] = useState<string | null>(null);
  const [continuidadeHoriz, setContinuidadeHoriz] = useState<string | null>(null);
  const [ventoDirecao, setVentoDirecao] = useState('');
  const [ventoVelocidade, setVentoVelocidade] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [humidade, setHumidade] = useState('');
  const [declive, setDeclive] = useState<Declive | null>(null);
  const [acessos, setAcessos] = useState<string[]>([]);
  const [pontosSensiveis, setPontosSensiveis] = useState<string[]>([]);
  const [pontosSensiveisOutro, setPontosSensiveisOutro] = useState('');

  // FAÇO
  const [pontoTransito, setPontoTransito] = useState('');
  const [manobra, setManobra] = useState<TipoManobra | null>(null);
  const [implemento, setImplemento] = useState<string | null>(null);

  // SOLICITO
  const [solicitoOpts, setSolicitoOpts] = useState<string[]>([]);
  const [solicitoOutro, setSolicitoOutro] = useState('');

  // Assumo COS
  const [assumoCos, setAssumoCos] = useState('');
  const [passagemCosPara, setPassagemCosPara] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Ler POSIT modal
  const [showPositModal, setShowPositModal] = useState(false);

  // Geo & Weather
  const { getLocationWithAddress, loading: geoLoading, error: geoError } = useGeolocation();
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lon: number } | null>(null);

  const handleGetLocation = async () => {
    const result = await getLocationWithAddress();
    if (!result) return;
    const { location: loc, address } = result;
    setLastCoords(loc);
    const latStr = `${Math.abs(loc.lat).toFixed(4)} ${loc.lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(loc.lon).toFixed(4)} ${loc.lon >= 0 ? 'E' : 'W'}`;
    setCoord(`${latStr}, ${lonStr}`);
    if (address.road) setEstouEm(address.road);
    if (address.freguesia) setFreguesia(address.freguesia);
    if (address.municipio) setMunicipio(address.municipio);
  };

  const handleGetWeather = async () => {
    let coords = lastCoords;
    if (!coords) {
      const result = await getLocationWithAddress();
      if (!result) return;
      coords = result.location;
      setLastCoords(coords);
      const latStr = `${Math.abs(coords.lat).toFixed(4)} ${coords.lat >= 0 ? 'N' : 'S'}`;
      const lonStr = `${Math.abs(coords.lon).toFixed(4)} ${coords.lon >= 0 ? 'E' : 'W'}`;
      setCoord(`${latStr}, ${lonStr}`);
    }

    setWeatherLoading(true);
    setWeatherError(null);

    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        setWeatherError('Configuração em falta');
        setWeatherLoading(false);
        return;
      }
      const fnUrl = `${supabaseUrl}/functions/v1/meteorologia?lat=${coords.lat}&lon=${coords.lon}`;
      const response = await fetch(fnUrl, {
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        setWeatherError('Erro ao obter meteorologia');
        setWeatherLoading(false);
        return;
      }
      const data = await response.json();
      if (data.error) {
        setWeatherError(data.error);
        setWeatherLoading(false);
        return;
      }
      setTemperatura(data.temperatura || '');
      setHumidade(data.humidade || '');
      setVentoVelocidade(data.vento_velocidade || '');
      setVentoDirecao(data.vento_direcao || '');
      setWeatherLoading(false);
    } catch {
      setWeatherError('Erro de ligação');
      setWeatherLoading(false);
    }
  };

  const buildPositText = (): string => {
    const parts: string[] = [];
    const add = (text: string) => { if (text) parts.push(text); };

    // ESTOU
    const estouParts: string[] = [];
    if (estouEm) estouParts.push(`estou em ${estouEm}`);
    if (coord) estouParts.push(`coordenadas ${coord}`);
    if (freguesia) estouParts.push(`freguesia ${freguesia}`);
    if (municipio) estouParts.push(`município ${municipio}`);
    if (estouParts.length > 0) add(`ESTOU — ${estouParts.join(', ')}`);

    // VEJO
    const vejoParts: string[] = [];
    if (intensidade) vejoParts.push(`incêndio de ${INTENSIDADE_LABELS[intensidade].toLowerCase()}`);
    if (tiposCombustivel.length > 0) {
      const labels = tiposCombustivel.map((v) => COMBUSTIVEL_LABELS[v as TipoCombustivel]).join(', ');
      vejoParts.push(`combustível ${labels}`);
    }
    if (propagacao) vejoParts.push(`propagação em direção ${propagacao}`);
    if (continuidadeVert) vejoParts.push(`continuidade vertical ${continuidadeVert === 'sim' ? 'sim' : 'não'}`);
    if (continuidadeHoriz) vejoParts.push(`continuidade horizontal ${continuidadeHoriz === 'sim' ? 'sim' : 'não'}`);
    if (ventoDirecao || ventoVelocidade) vejoParts.push(`vento ${ventoDirecao || '?'}${ventoVelocidade ? ' ' + ventoVelocidade + ' km/h' : ''}`);
    if (temperatura) vejoParts.push(`temperatura ${temperatura} °C`);
    if (humidade) vejoParts.push(`humidade ${humidade} %HR`);
    if (declive) vejoParts.push(`declive ${DECLIVE_LABELS[declive].toLowerCase()}`);
    if (acessos.length > 0) {
      const labels = acessos.map((v) => ACESSOS_LABELS[v as TipoAcesso]).join(', ');
      vejoParts.push(`acessos ${labels}`);
    }
    if (pontosSensiveis.length > 0) {
      const ps = pontosSensiveis.map((v) => v === 'outro' && pontosSensiveisOutro ? `outro: ${pontosSensiveisOutro}` : v).join(', ');
      vejoParts.push(`pontos sensíveis ${ps}`);
    }
    if (vejoParts.length > 0) add(`VEJO — ${vejoParts.join(', ')}`);

    // FAÇO
    const facoParts: string[] = [];
    if (manobra) facoParts.push(`manobra de ${MANOBRA_LABELS[manobra].toLowerCase()}`);
    if (implemento) facoParts.push(`implemento ${IMPLEMENTO_OPTIONS.find((o) => o.value === implemento)?.label || implemento}`);
    if (pontoTransito) facoParts.push(`ponto de trânsito ${pontoTransito}`);
    if (facoParts.length > 0) add(`FAÇO — ${facoParts.join(', ')}`);

    // SOLICITO
    if (solicitoOpts.length > 0) {
      const sol = solicitoOpts.map((v) => v === 'outros' && solicitoOutro ? `outros: ${solicitoOutro}` : SOLICITO_OPTIONS.find((o) => o.value === v)?.label || v).join(', ');
      add(`SOLICITO — ${sol}`);
    }

    // ASSUMO COS
    const cosParts: string[] = [];
    if (assumoCos) cosParts.push(`assumo COS ${assumoCos}`);
    if (passagemCosPara) cosParts.push(`passagem de COS para ${passagemCosPara}`);
    if (observacoes) cosParts.push(`observações: ${observacoes}`);
    if (cosParts.length > 0) add(`ASSUMO COS — ${cosParts.join(', ')}`);

    return parts.join('\n\n');
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const insert: OcorrenciaInsert = {
      numero: null,
      designacao: freguesia ? `${freguesia}, ${municipio}` : 'Nova ocorrência',
      estou_em: estouEm || null,
      freguesia: freguesia || null,
      municipio: municipio || null,
      coordenadas: coord || null,
      estado: 'ativo',
      fase: 'reconhecimento',
      intensidade: intensidade,
      tipo_combustivel: tiposCombustivel.length > 0
        ? tiposCombustivel.join('; ')
        : null,
      propagacao: propagacao,
      vento_direcao: ventoDirecao || null,
      vento_velocidade: ventoVelocidade || null,
      temperatura: temperatura || null,
      humidade: humidade || null,
      declive: declive,
      acessos: acessos.length > 0
        ? acessos.join('; ')
        : null,
      pontos_sensiveis: pontosSensiveis.length > 0
        ? pontosSensiveis.map((v) => v === 'outro' && pontosSensiveisOutro ? `outro: ${pontosSensiveisOutro}` : v).join('; ')
        : null,
      manobra: manobra,
      implemento: implemento,
      faco: manobra ? MANOBRA_LABELS[manobra] : null,
      ponto_transito: pontoTransito || null,
      em_local: null,
      com_recursos: null,
      solicito: solicitoOpts.length > 0
        ? solicitoOpts.map((v) => v === 'outros' && solicitoOutro ? `outros: ${solicitoOutro}` : v).join('; ')
        : null,
      continuidade_vert: continuidadeVert,
      continuidade_horiz: continuidadeHoriz,
      assumo_cos: assumoCos || null,
      passagem_cos_para: passagemCosPara || null,
      observacoes: observacoes || null,
    };

    const { data, error: insertError } = await supabase
      .from('ocorrencias')
      .insert(insert)
      .select()
      .single();

    if (insertError) {
      setError('Erro ao guardar ocorrência: ' + insertError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    if (data) {
      router.replace(`/ocorrencia/${data.id}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Nova Ocorrência</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* ESTOU */}
          <SectionTitle style={styles.sectionTitleWithIcon}>
            <View style={styles.sectionTitleRow}>
              <MapPin size={18} color={THEME.primary} strokeWidth={2.5} />
              <Text style={styles.sectionTitleText}>ESTOU</Text>
            </View>
          </SectionTitle>
          <Card>
            <InputField label="Estou em" value={estouEm} onChangeText={setEstouEm} placeholder="Local onde me encontro" />
            <InputField label="Coord." value={coord} onChangeText={setCoord} placeholder="Ex: 40.1234 N, 8.5678 W" />
            <TouchableOpacity style={styles.actionButton} onPress={handleGetLocation} disabled={geoLoading} activeOpacity={0.85}>
              {geoLoading ? (
                <ActivityIndicator size={18} color="#FFFFFF" />
              ) : (
                <LocateFixed size={18} color="#FFFFFF" strokeWidth={2} />
              )}
              <Text style={styles.actionButtonText}>{geoLoading ? 'A obter...' : 'Recolher Localização'}</Text>
            </TouchableOpacity>
            {geoError && <Text style={styles.actionError}>{geoError}</Text>}
            <InputField label="Freguesia" value={freguesia} onChangeText={setFreguesia} placeholder="Freguesia" />
            <InputField label="Município" value={municipio} onChangeText={setMunicipio} placeholder="Município" />
          </Card>

          {/* VEJO */}
          <SectionTitle style={styles.sectionTitleWithIcon}>
            <View style={styles.sectionTitleRow}>
              <Eye size={18} color={THEME.secondary} strokeWidth={2.5} />
              <Text style={styles.sectionTitleText}>VEJO</Text>
            </View>
          </SectionTitle>
          <Card>
            <Text style={styles.subGroupLabel}>Incêndio</Text>
            <SelectField
              label="Intensidade"
              value={intensidade}
              onSelect={(v) => setIntensidade(v as Intensidade)}
              options={Object.entries(INTENSIDADE_LABELS).map(([value, label]) => ({ value, label }))}
            />
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Combustível (Categoria e Nome)</Text>
              <View style={styles.selectRow}>
                {Object.entries(COMBUSTIVEL_LABELS).map(([value, label]) => {
                  const selected = tiposCombustivel.includes(value);
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.selectChip, selected && styles.selectChipActive]}
                      onPress={() => {
                        if (selected) {
                          setTiposCombustivel(tiposCombustivel.filter((v) => v !== value));
                        } else {
                          setTiposCombustivel([...tiposCombustivel, value]);
                        }
                      }}>
                      <Text style={[styles.selectChipText, selected && styles.selectChipTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <Divider />
            <Text style={styles.subGroupLabel}>Propagação</Text>
            <SelectField
              label="Direção (Ponto Cardeal)"
              value={propagacao}
              onSelect={setPropagacao}
              options={PONTO_CARDEAL.map((p) => ({ value: p, label: p }))}
            />
            <SelectField
              label="Continuidade Vert."
              value={continuidadeVert}
              onSelect={setContinuidadeVert}
              options={[
                { value: 'sim', label: 'Sim' },
                { value: 'nao', label: 'Não' },
              ]}
            />
            <SelectField
              label="Continuidade Horiz."
              value={continuidadeHoriz}
              onSelect={setContinuidadeHoriz}
              options={[
                { value: 'sim', label: 'Sim' },
                { value: 'nao', label: 'Não' },
              ]}
            />
            <Divider />
            <Text style={styles.subGroupLabel}>Condições Meteorológicas</Text>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: THEME.secondary }]} onPress={handleGetWeather} disabled={weatherLoading || geoLoading} activeOpacity={0.85}>
              {weatherLoading ? (
                <ActivityIndicator size={18} color="#FFFFFF" />
              ) : (
                <CloudSun size={18} color="#FFFFFF" strokeWidth={2} />
              )}
              <Text style={styles.actionButtonText}>{weatherLoading ? 'A obter...' : 'Recolher Meteorologia'}</Text>
            </TouchableOpacity>
            {weatherError && <Text style={styles.actionError}>{weatherError}</Text>}
            <InputField label="Vento (Direção)" value={ventoDirecao} onChangeText={setVentoDirecao} placeholder="Ex: NW" />
            <InputField label="Vento (Velocidade km/h)" value={ventoVelocidade} onChangeText={setVentoVelocidade} placeholder="Ex: 25" keyboardType="numeric" />
            <InputField label="Temperatura (°C)" value={temperatura} onChangeText={setTemperatura} placeholder="Ex: 35" keyboardType="numeric" />
            <InputField label="Humidade (%HR)" value={humidade} onChangeText={setHumidade} placeholder="Ex: 30" keyboardType="numeric" />
            <Divider />
            <Text style={styles.subGroupLabel}>Terreno</Text>
            <SelectField
              label="Declive"
              value={declive}
              onSelect={(v) => setDeclive(v as Declive)}
              options={Object.entries(DECLIVE_LABELS).map(([value, label]) => ({ value, label }))}
            />
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Acessos</Text>
              <View style={styles.selectRow}>
                {Object.entries(ACESSOS_LABELS).map(([value, label]) => {
                  const selected = acessos.includes(value);
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.selectChip, selected && styles.selectChipActive]}
                      onPress={() => {
                        if (selected) {
                          setAcessos(acessos.filter((v) => v !== value));
                        } else {
                          setAcessos([...acessos, value]);
                        }
                      }}>
                      <Text style={[styles.selectChipText, selected && styles.selectChipTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <Divider />
            <Text style={styles.subGroupLabel}>Pontos Sensíveis</Text>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Habitações, Indústria, Comércio, Outros</Text>
              <View style={styles.selectRow}>
                {PONTOS_SENSIVEIS_OPTIONS.map((opt) => {
                  const selected = pontosSensiveis.includes(opt.value);
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.selectChip, selected && styles.selectChipActive]}
                      onPress={() => {
                        if (selected) {
                          setPontosSensiveis(pontosSensiveis.filter((v) => v !== opt.value));
                        } else {
                          setPontosSensiveis([...pontosSensiveis, opt.value]);
                        }
                      }}>
                      <Text style={[styles.selectChipText, selected && styles.selectChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            {pontosSensiveis.includes('outro') && (
              <InputField label="Especifique outro" value={pontosSensiveisOutro} onChangeText={setPontosSensiveisOutro} placeholder="Descrever ponto sensível" multiline />
            )}
          </Card>

          {/* FAÇO */}
          <SectionTitle style={styles.sectionTitleWithIcon}>
            <View style={styles.sectionTitleRow}>
              <Hand size={18} color={THEME.accent} strokeWidth={2.5} />
              <Text style={styles.sectionTitleText}>FAÇO</Text>
            </View>
          </SectionTitle>
          <Card>
            <SelectField
              label="Faço"
              value={manobra}
              onSelect={(v) => setManobra(v as TipoManobra)}
              options={Object.entries(MANOBRA_LABELS).map(([value, label]) => ({ value, label }))}
            />
            <SelectField
              label="Implemento"
              value={implemento}
              onSelect={setImplemento}
              options={IMPLEMENTO_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            />
            <InputField label="Ponto de Trânsito" value={pontoTransito} onChangeText={setPontoTransito} placeholder="Ponto de trânsito" />
          </Card>

          {/* SOLICITO */}
          <SectionTitle style={styles.sectionTitleWithIcon}>
            <View style={styles.sectionTitleRow}>
              <HelpCircle size={18} color={THEME.primary} strokeWidth={2.5} />
              <Text style={styles.sectionTitleText}>SOLICITO</Text>
            </View>
          </SectionTitle>
          <Card>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Recursos a solicitar</Text>
              <View style={styles.selectRow}>
                {SOLICITO_OPTIONS.map((opt) => {
                  const selected = solicitoOpts.includes(opt.value);
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.selectChip, selected && styles.selectChipActive]}
                      onPress={() => {
                        if (selected) {
                          setSolicitoOpts(solicitoOpts.filter((v) => v !== opt.value));
                        } else {
                          setSolicitoOpts([...solicitoOpts, opt.value]);
                        }
                      }}>
                      <Text style={[styles.selectChipText, selected && styles.selectChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            {solicitoOpts.includes('outros') && (
              <InputField label="Especifique outros" value={solicitoOutro} onChangeText={setSolicitoOutro} placeholder="Descrever recursos solicitados" multiline />
            )}
          </Card>

          {/* Assumo COS */}
          <SectionTitle style={styles.sectionTitleWithIcon}>
            <View style={styles.sectionTitleRow}>
              <UserCheck size={18} color={THEME.secondary} strokeWidth={2.5} />
              <Text style={styles.sectionTitleText}>Assumo COS</Text>
            </View>
          </SectionTitle>
          <Card>
            <InputField label="Assumo COS" value={assumoCos} onChangeText={setAssumoCos} placeholder="Nome / Posto" />
            <InputField label="Passagem de COS para" value={passagemCosPara} onChangeText={setPassagemCosPara} placeholder="Nome / Posto" />
            <InputField label="Observações" value={observacoes} onChangeText={setObservacoes} placeholder="Notas adicionais" multiline />
          </Card>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <View style={{ flex: 1 }}>
              <PrimaryButton label="Guardar Ocorrência" onPress={handleSave} disabled={saving} icon={<Save size={18} color="#FFFFFF" strokeWidth={2} />} />
            </View>
            <View style={{ flex: 1 }}>
              <SecondaryButton label="Ler POSIT" onPress={() => setShowPositModal(true)} icon={<Radio size={18} color={THEME.text} strokeWidth={2} />} />
            </View>
          </View>
          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showPositModal} animationType="slide" transparent={false} onRequestClose={() => setShowPositModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalTopBar}>
            <View style={{ width: 40 }} />
            <Text style={styles.topBarTitle}>Ler POSIT</Text>
            <TouchableOpacity onPress={() => setShowPositModal(false)} style={styles.backButton}>
              <X size={22} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Card>
              <Text style={styles.positText}>{buildPositText()}</Text>
            </Card>
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.primaryDark,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 12,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  topBarTitle: { fontFamily: 'Inter-Bold', fontSize: 18, color: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  sectionTitleWithIcon: { marginTop: 18, marginBottom: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitleText: { fontFamily: 'Inter-Bold', fontSize: 16, color: THEME.text },
  subGroupLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: THEME.textMuted,
    marginBottom: 8,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, marginTop: 16 },
  errorText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#991B1B' },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 14,
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  actionError: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: THEME.error,
    marginBottom: 10,
    marginTop: -8,
  },
  inputField: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 6,
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: THEME.borderDark,
    backgroundColor: '#F8FAFC',
  },
  selectChipActive: {
    borderColor: THEME.primary,
    backgroundColor: '#FEE2E2',
  },
  selectChipText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: THEME.textSecondary,
  },
  selectChipTextActive: {
    color: THEME.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalContainer: { flex: 1, backgroundColor: THEME.background },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.primaryDark,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 12,
  },
  positText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 24,
    color: THEME.text,
  },
});
