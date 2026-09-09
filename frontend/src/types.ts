export type Torra = 'clara' | 'media' | 'escura';

export interface Usuario {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  created_at: string;
}

export interface PerfilUsuario extends Usuario {
  total_opinioes: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface RegistroRequest {
  email: string;
  username: string;
  display_name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Cafe {
  id: string;
  nome: string;
  produtor: string;
  grao_especial_atual: string | null;
  torra_atual: Torra | null;
  nota_media: number | null;
  total_opinioes: number;
  total_notas: number;
}

export interface OpiniaoCreateRequest {
  cafe_nome: string;
  cafe_produtor: string;
  grao_especial: string;
  torra: Torra;
  texto: string;
}

export interface Opiniao {
  id: string;
  autor: Usuario;
  cafe: Cafe;
  grao_especial: string;
  torra: Torra;
  texto: string;
  nota_media: number | null;
  total_notas: number;
  total_comentarios: number;
  created_at: string;
}

export interface OpiniaoListaResponse {
  items: Opiniao[];
  page: number;
  page_size: number;
  total: number;
}

export interface Comentario {
  id: string;
  autor: Usuario;
  texto: string;
  created_at: string;
}

export interface ComentarioCreateRequest {
  texto: string;
}

export interface Nota {
  opiniao_id: string;
  valor: number;
  updated_at: string;
}

export interface NotaUpsertRequest {
  valor: number;
}

export interface OpiniaoDetalhe extends Opiniao {
  comentarios: Comentario[];
  nota_do_usuario_atual: number | null;
}

export interface CafeConsolidado extends Cafe {
  opinioes: Opiniao[];
}

export interface RankingGeralEntry {
  cafe: Cafe;
  nota_media: number | null;
  total_notas: number;
  score_final: number;
}

export interface RankingGeralResponse {
  items: RankingGeralEntry[];
  page: number;
  page_size: number;
  total: number;
}

export interface RankingPessoalItemResponse {
  posicao: number;
  cafe: Cafe;
}

export interface RankingPessoalResponse {
  usuario: Usuario;
  items: RankingPessoalItemResponse[];
}

export interface RankingPessoalUpdateRequest {
  cafe_ids_em_ordem: string[];
}

export interface ApiError {
  detail: string;
}
