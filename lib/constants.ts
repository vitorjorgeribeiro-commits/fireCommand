import type {
  EstadoOcorrencia,
  FaseOcorrencia,
  Intensidade,
  Declive,
  TipoCombustivel,
  TipoAcesso,
  TipoManobra,
  TipoMeio,
} from '@/types/database';

export const ESTADO_LABELS: Record<EstadoOcorrencia, string> = {
  ativo: 'Ativo',
  dominado: 'Dominado',
  extinto: 'Extinto',
  rescaldo: 'Rescaldo',
};

export const ESTADO_COLORS: Record<EstadoOcorrencia, string> = {
  ativo: '#DC2626',
  dominado: '#F59E0B',
  rescaldo: '#3B82F6',
  extinto: '#10B981',
};

export const FASE_LABELS: Record<FaseOcorrencia, string> = {
  reconhecimento: 'Reconhecimento',
  curso: 'Curso (Activo)',
  conclusao: 'Conclusão (Rescaldo)',
};

export const INTENSIDADE_LABELS: Record<Intensidade, string> = {
  fraca: 'Fraca Intensidade',
  moderada: 'Intensidade Moderada',
  muita: 'Muita Intensidade',
};

export const DECLIVE_LABELS: Record<Declive, string> = {
  plano: 'Terreno Plano',
  suave: 'Declive Suave',
  moderado: 'Declive Moderado',
  acentuado: 'Declive Acentuado',
};

export const COMBUSTIVEL_LABELS: Record<TipoCombustivel, string> = {
  mato: 'Mato',
  pinhal: 'Pinhal',
  eucaliptal: 'Eucaliptal',
  agricola: 'Combustível Agrícola',
  povoamento_misto: 'Povoamento Misto',
};

export const ACESSOS_LABELS: Record<TipoAcesso, string> = {
  estrada_asfaltada: 'Estrada Asfaltada',
  estradoes: 'Estradões',
  todo_terreno: 'Todo-o-Terreno',
  bons: 'Bons Acessos',
  dificeis: 'Acessos Difíceis',
  sem_acessos: 'Sem Acessos',
};

export const MANOBRA_LABELS: Record<TipoManobra, string> = {
  ataque_cabeca: 'Ataque cabeça',
  ataque_flancos: 'Ataque flanco(s)',
  defesa_ponto_sensivel: 'Defesa de Ponto Sensível',
  rescaldo: 'Rescaldo',
};

export const MEIO_LABELS: Record<TipoMeio, string> = {
  brigada_combate: 'Brigada(s) de Combate',
  grupo_combate: 'Grupo(s) de Combate',
  meio_aereo: 'Meio Aéreo',
  outros: 'Outros',
};

export const PONTO_CARDEAL = [
  'N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO',
];

export const PONTOS_SENSIVEIS_OPTIONS = [
  { value: 'habitacoes', label: 'Habitações' },
  { value: 'industria', label: 'Indústria' },
  { value: 'comercio', label: 'Comércio' },
  { value: 'outro', label: 'Outro' },
] as const;

export const IMPLEMENTO_OPTIONS = [
  { value: 'protocolo_laces', label: 'Protocolo de Segurança LACES' },
] as const;

export const SOLICITO_OPTIONS = [
  { value: 'equipas', label: 'Equipa(s)' },
  { value: 'brigadas', label: 'Brigada(s)' },
  { value: 'grupos', label: 'Grupo(s)' },
  { value: 'meios_aereos', label: 'Meio(s) Aéreo(s)' },
  { value: 'outros', label: 'Outros' },
] as const;

export const THEME = {
  primary: '#B91C1C',
  primaryDark: '#7F1D1D',
  primaryLight: '#EF4444',
  secondary: '#1E3A5F',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#DC2626',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderDark: '#CBD5E1',
};

export type ThemeColor = keyof typeof THEME;
