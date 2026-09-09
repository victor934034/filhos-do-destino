import type { Armamento, Atributo, NivelEspecialidade } from "@/lib/regras";

export interface EspecialidadeSelecionada {
  nome: string;
  atributoRecomendado: string;
  nivel: NivelEspecialidade;
  customizada?: boolean;
  aprovadaPeloOraculo?: boolean;
}

export interface EstiloCombate {
  nome: string;
  descricao: string;
}

export interface PoderDef {
  nome: string;
  custoEstamina: number;
  duracao: string;
  tipoAcao: string;
  efeito: string;
  ilustracaoUrl?: string | null;
}

export interface ItemPersonagem {
  nome: string;
  tipo: "arma" | "consumivel" | "narrativo";
  dadoDeDano?: string;
  multiplicadorCritico?: number;
  descricao?: string;
  equipado?: boolean;
  ilustracaoUrl?: string | null;
  // Preenchido quando o item foi comprado no Mercado — permite vender de volta por uma fração.
  precoCompra?: number;
}

export interface FichaPersonagem {
  id?: string;
  nome: string;
  historia: string;
  ilustracaoUrl?: string | null;
  ilustracaoCompletaUrl?: string | null;
  parenteDivino: string;
  armamento: Armamento;

  forca: number;
  destreza: number;
  vigor: number;
  inteligencia: number;
  carisma: number;
  aparencia: number;

  vidaAtual: number;
  vidaMax: number;
  estaminaAtual: number;
  estaminaMax: number;
  aspis: number;

  nivel: number;
  deslocamento: number;

  especialidades: EspecialidadeSelecionada[];
  estilosCombate: EstiloCombate[];
  poderes: PoderDef[];
  itens: ItemPersonagem[];

  // Quando true, outros jogadores da campanha (fora o Oráculo) só veem nome e ilustração.
  bloqueadoParaJogadores?: boolean;
  // Consentimento do jogador: permite que o Oráculo da campanha ajuste Vida/Estamina desta ficha.
  permiteControleMestre?: boolean;

  // Dracmas de Lua Nova — regra da casa de economia.
  dracmas: number;
}

// ---------- Dracmas ----------

export type TipoTransacao = "recompensa" | "venda" | "compra" | "ajusteManual";

export interface Transacao {
  id: string;
  personagemId: string;
  campanhaId: string | null;
  tipo: TipoTransacao;
  valor: number;
  motivo: string;
  autorId: string;
  criadoEm: string;
}

// ---------- Amizades ----------

export interface UsuarioResumo {
  id: string;
  nome: string;
  email: string;
}

export interface Amizade {
  id: string;
  status: "pendente" | "aceita" | "recusada";
  criadoEm: string;
  eu: "solicitante" | "destinatario";
  outro: UsuarioResumo;
}

// ---------- Campanhas ----------

export interface RegrasDaCasa {
  pontosAtributo: number;
  permiteEspecialidadeCustomizadaSemAprovacao: boolean;
  formulaEssencias: string;
  // Limite de especialidades na criação — o livro não define um número oficial;
  // 4 Treinado + 2 Mestre é o padrão observado nas fichas prontas, mas cada
  // Oráculo pode ajustar para a própria mesa.
  limiteEspecialidadesTreinado: number;
  limiteEspecialidadesMestre: number;
  // Fração devolvida ao vender um item de volta ao Mercado desta campanha (0.5 = 50%).
  fracaoVendaMercado: number;
}

export function regrasDaCasaPadrao(): RegrasDaCasa {
  return {
    pontosAtributo: 14,
    permiteEspecialidadeCustomizadaSemAprovacao: false,
    formulaEssencias: "Vida = 10 + Vigor×2 · Estamina = 10 + Vigor + Destreza · Áspis = 8 + Destreza + metade do Vigor",
    limiteEspecialidadesTreinado: 4,
    limiteEspecialidadesMestre: 2,
    fracaoVendaMercado: 0.5,
  };
}

export interface JogadorCampanha {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  personagemId: string | null;
  personagemNome: string | null;
  personagemDracmas: number | null;
  status: "pendente" | "aprovado" | "recusado";
}

export interface MissaoCampanha {
  id: string;
  titulo: string;
  descricao: string;
  status: "aberta" | "concluida";
}

export interface Campanha {
  id: string;
  oraculoId: string;
  oraculoNome: string;
  nome: string;
  sinopse: string;
  capaUrl: string | null;
  visibilidade: "publica" | "privada";
  vagasMaximas: number;
  tom: string;
  regrasDaCasa: RegrasDaCasa;
  oficial: boolean;
  origemMcp: boolean;
  ocultarSemideusesParaJogadores: boolean;
  criadoEm: string;
  jogadores: JogadorCampanha[];
  missoes: MissaoCampanha[];
}

// ---------- Bestiário ----------

export interface HabilidadeAtiva {
  nome: string;
  alcance: "corpoACorpo" | "linhaReta" | "area";
  dadoDeDano: string;
}

export interface HabilidadePassiva {
  nome: string;
  efeito: string;
}

export interface FichaMonstro {
  id?: string;
  publico: boolean;
  oficial: boolean;
  nome: string;
  ilustracaoUrl?: string | null;
  vida: number;
  aspis: number;
  forca: number;
  destreza: number;
  vigor: number;
  inteligencia: number;
  carisma: number;
  aparencia: number;
  atributoAtaque: Atributo;
  habilidadesAtivas: HabilidadeAtiva[];
  habilidadesPassivas: HabilidadePassiva[];
}

export function monstroPadrao(): FichaMonstro {
  return {
    publico: false,
    oficial: false,
    nome: "",
    ilustracaoUrl: null,
    vida: 10,
    aspis: 10,
    forca: 2,
    destreza: 2,
    vigor: 2,
    inteligencia: 2,
    carisma: 2,
    aparencia: 2,
    atributoAtaque: "forca",
    habilidadesAtivas: [],
    habilidadesPassivas: [],
  };
}

// ---------- Compêndio de Itens ----------

export type TipoItemCompendio = "arma" | "consumivel" | "narrativo" | "legado";

export interface ItemCompendio {
  id?: string;
  publico: boolean;
  oficial: boolean;
  nome: string;
  ilustracaoUrl?: string | null;
  tipo: TipoItemCompendio;
  dadoDeDano?: string | null;
  multiplicadorCritico: number;
  efeito: string;
  textoLore: string;
  // Preço em Dracmas no Mercado — 0 significa que não é vendido lá.
  preco: number;
}

export function itemCompendioPadrao(): ItemCompendio {
  return {
    publico: false,
    oficial: false,
    nome: "",
    ilustracaoUrl: null,
    tipo: "arma",
    dadoDeDano: "1d6",
    multiplicadorCritico: 2,
    efeito: "",
    textoLore: "",
    preco: 0,
  };
}

// ---------- Compêndio de Poderes/Habilidades ----------

export type TipoAcaoPoder = "Ação" | "Reação" | "Livre";

export interface PoderCompendio {
  id?: string;
  publico: boolean;
  oficial: boolean;
  nome: string;
  ilustracaoUrl?: string | null;
  tipoAcao: TipoAcaoPoder;
  custoEstamina: number;
  duracao: string;
  efeito: string;
}

export function poderCompendioPadrao(): PoderCompendio {
  return {
    publico: false,
    oficial: false,
    nome: "",
    ilustracaoUrl: null,
    tipoAcao: "Ação",
    custoEstamina: 0,
    duracao: "Instantânea",
    efeito: "",
  };
}

// ---------- Mesa ao vivo ----------

export interface ParticipanteIniciativa {
  tipo: "personagem" | "monstro";
  id: string;
  nome: string;
  valor: number;
  vidaAtual?: number;
  vidaMax?: number;
}

export interface EventoSessao {
  id: string;
  tipo: "rolagem" | "chat" | "narracao" | "sistema";
  autorNome: string;
  conteudo: string;
  criadoEm: string;
}

export interface SessaoAoVivo {
  id: string;
  campanhaId: string;
  ordemIniciativa: ParticipanteIniciativa[];
  turnoAtual: number;
  ativa: boolean;
  eventos: EventoSessao[];
}

// ---------- Estúdio de stream ----------

export interface SlotCamera {
  jogadorId: string | null;
  nome: string;
  personagemId: string | null;
  mostrarIlustracao: boolean;
}

export interface CenaDeStream {
  layout: "grid-2x2" | "grid-3x2" | "destaque-1-3";
  camerasConfig: SlotCamera[];
  fundoId: string;
  fundoCustomUrl?: string | null;
  tituloCena: string;
  overlayAtivo: boolean;
}

export function fichaPadrao(): FichaPersonagem {
  return {
    nome: "",
    historia: "",
    ilustracaoUrl: null,
    parenteDivino: "Zeus",
    armamento: "Lutador",
    forca: 2,
    destreza: 2,
    vigor: 2,
    inteligencia: 2,
    carisma: 2,
    aparencia: 2,
    vidaAtual: 10,
    vidaMax: 10,
    estaminaAtual: 10,
    estaminaMax: 10,
    aspis: 10,
    nivel: 1,
    deslocamento: 9,
    especialidades: [],
    estilosCombate: [],
    poderes: [],
    itens: [],
    bloqueadoParaJogadores: false,
    permiteControleMestre: false,
    dracmas: 0,
  };
}
