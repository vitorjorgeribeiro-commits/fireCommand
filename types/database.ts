export type EstadoOcorrencia = 'ativo' | 'dominado' | 'extinto' | 'rescaldo';
export type FaseOcorrencia = 'reconhecimento' | 'curso' | 'conclusao';
export type Intensidade = 'fraca' | 'moderada' | 'muita';
export type Declive = 'plano' | 'suave' | 'moderado' | 'acentuado';
export type TipoCombustivel = 'mato' | 'pinhal' | 'eucaliptal' | 'agricola' | 'povoamento_misto';
export type TipoAcesso = 'estrada_asfaltada' | 'estradoes' | 'todo_terreno' | 'bons' | 'dificeis' | 'sem_acessos';
export type TipoManobra = 'ataque_cabeca' | 'ataque_flancos' | 'defesa_ponto_sensivel' | 'rescaldo';
export type TipoMeio = 'brigada_combate' | 'grupo_combate' | 'meio_aereo' | 'outros';

export interface Ocorrencia {
  id: string;
  numero: string | null;
  designacao: string | null;
  estou_em: string | null;
  freguesia: string | null;
  municipio: string | null;
  coordenadas: string | null;
  estado: EstadoOcorrencia;
  fase: FaseOcorrencia;
  data_hora: string | null;
  hr_no_to: string | null;
  intensidade: Intensidade | null;
  tipo_combustivel: string | null;
  propagacao: string | null;
  vento_direcao: string | null;
  vento_velocidade: string | null;
  temperatura: string | null;
  humidade: string | null;
  declive: Declive | null;
  acessos: string | null;
  pontos_sensiveis: string | null;
  manobra: TipoManobra | null;
  implemento: string | null;
  faco: string | null;
  ponto_transito: string | null;
  em_local: string | null;
  com_recursos: string | null;
  solicito: string | null;
  continuidade_vert: string | null;
  continuidade_horiz: string | null;
  assumo_cos: string | null;
  passagem_cos_para: string | null;
  siresp_canal: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PontoSituacao {
  id: string;
  ocorrencia_id: string;
  numero_posit: number;
  hr_posit: string | null;
  faço: string | null;
  vejo: string | null;
  em: string | null;
  com: string | null;
  solicito: string | null;
  progredir_para: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface Meio {
  id: string;
  ocorrencia_id: string;
  meio: TipoMeio;
  entidade: string | null;
  quantidade: number;
  missao: string | null;
  hr_no_to: string | null;
  created_at: string;
}

export type OcorrenciaInsert = Partial<Omit<Ocorrencia, 'id' | 'created_at' | 'updated_at'>> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PontoSituacaoInsert = Partial<Omit<PontoSituacao, 'id' | 'created_at'>> & {
  id?: string;
  created_at?: string;
};

export type MeioInsert = Omit<Meio, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};
