// Fonte única de verdade das regras mecânicas de Filhos do Destino.
// Qualquer cálculo de dado/DT/dano na plataforma deve importar daqui.

export type Atributo =
  | "forca"
  | "destreza"
  | "vigor"
  | "inteligencia"
  | "carisma"
  | "aparencia";

export const ATRIBUTOS: { chave: Atributo; nome: string; descricao: string; icone: string }[] = [
  {
    chave: "forca",
    nome: "Força",
    descricao: "Poder físico, empurrar, erguer, quebrar, resistir.",
    icone: "punho",
  },
  {
    chave: "destreza",
    nome: "Destreza",
    descricao: "Agilidade, precisão, equilíbrio, esquiva.",
    icone: "pena",
  },
  {
    chave: "vigor",
    nome: "Vigor",
    descricao: "Resistência, saúde, aguentar cansaço, dor e frio.",
    icone: "escudo",
  },
  {
    chave: "inteligencia",
    nome: "Inteligência",
    descricao: "Raciocínio, memória, magias complexas, enigmas.",
    icone: "coruja",
  },
  {
    chave: "carisma",
    nome: "Carisma",
    descricao: "Magnetismo pessoal, convencer, enganar, inspirar.",
    icone: "lira",
  },
  {
    chave: "aparencia",
    nome: "Aparência",
    descricao: "Uso do corpo, respiração, foco visual, charme.",
    icone: "espelho",
  },
];

// Valor do atributo (1-5) -> categoria de dado
export const DADO_POR_VALOR: Record<number, number> = {
  1: 4,
  2: 6,
  3: 8,
  4: 10,
  5: 12,
};

const PROGRESSAO_DADO = [4, 6, 8, 10, 12] as const;

export function dadoDoAtributo(valor: number): number {
  return DADO_POR_VALOR[Math.min(5, Math.max(1, valor))];
}

// Aplica passos de aumento de categoria de dado (ex.: Especialidade Treinado = +1, Mestre = +1 também,
// mas Mestre soma o benefício de rolar novamente, não de subir 2 categorias sozinho).
export function subirCategoria(dado: number, passos: number): number {
  const idx = PROGRESSAO_DADO.indexOf(dado as (typeof PROGRESSAO_DADO)[number]);
  if (idx === -1) return dado;
  const novoIdx = Math.min(PROGRESSAO_DADO.length - 1, idx + passos);
  return PROGRESSAO_DADO[novoIdx];
}

export type NivelEspecialidade = "nenhum" | "treinado" | "mestre";

export interface EspecialidadeDef {
  nome: string;
  atributoRecomendado: string;
  customizada?: boolean;
}

export const ESPECIALIDADES_BASICAS: EspecialidadeDef[] = [
  { nome: "Atletismo", atributoRecomendado: "Força" },
  { nome: "Atualidades", atributoRecomendado: "Inteligência / Aparência" },
  { nome: "Diplomacia", atributoRecomendado: "Aparência / Carisma" },
  { nome: "Enganação", atributoRecomendado: "Carisma / Aparência" },
  { nome: "Furtividade", atributoRecomendado: "Aparência / Destreza" },
  { nome: "História", atributoRecomendado: "Inteligência" },
  { nome: "Improvisação", atributoRecomendado: "Destreza / Inteligência" },
  { nome: "Intimidação", atributoRecomendado: "Inteligência / Aparência" },
  { nome: "Investigação", atributoRecomendado: "Inteligência / Destreza" },
  { nome: "Medicina", atributoRecomendado: "Inteligência" },
  { nome: "Natureza", atributoRecomendado: "Inteligência" },
  { nome: "Percepção", atributoRecomendado: "Destreza / Inteligência" },
  { nome: "Pilotagem", atributoRecomendado: "Destreza" },
  { nome: "Presença", atributoRecomendado: "Carisma / Aparência" },
  { nome: "Resistência", atributoRecomendado: "Vigor" },
  { nome: "Sedução", atributoRecomendado: "Carisma / Aparência" },
  { nome: "Sobrevivência", atributoRecomendado: "Força / Inteligência" },
];

// Dificuldades padrão de teste
export const DIFICULDADES = [
  { nome: "Intuitiva", dt: 5 },
  { nome: "Fácil", dt: 10 },
  { nome: "Média", dt: 15 },
  { nome: "Difícil", dt: 20 },
] as const;

export type Armamento = "Lutador" | "Espadachim" | "Atirador";

export const ARMAMENTOS: { nome: Armamento; atributo: Atributo; estilo: string }[] = [
  { nome: "Lutador", atributo: "forca", estilo: "Corpo a corpo bruto — poder e resistência em cada golpe." },
  { nome: "Espadachim", atributo: "destreza", estilo: "Ágil e preciso — velocidade e técnica com lâminas." },
  { nome: "Atirador", atributo: "aparencia", estilo: "À distância e versátil — foco, respiração e precisão." },
];

export function atributoDoArmamento(armamento: Armamento): Atributo {
  return ARMAMENTOS.find((a) => a.nome === armamento)!.atributo;
}

// Regra do Mito: atributo 5 + especialidade aplicável => 2d20, usa o maior.
export function testeDoMito(valorAtributo: number, especialidadeAplicavel: boolean): boolean {
  return valorAtributo >= 5 && especialidadeAplicavel;
}

export interface CasaDivina {
  nome: string;
  foco: Atributo;
  dominio: string;
  tema: string;
  sugestoes: string[];
  /** Grupo de exibição — Oráculo pode escolher liberar só "grande"/"olimpiano" numa campanha, e "menor" depois. */
  grupo: "grande" | "olimpiano" | "menor";
  /** Arte de busto/meio corpo do deus — usada no modal de detalhe do seletor. */
  ilustracaoCompletaUrl: string;
}

// Nota sobre Hera: ela não entra aqui de propósito — na mitologia não tem filhos semideuses
// (é fiel a Zeus; Ares e Hefesto nascem deuses completos, não mortais). Continua existindo
// no lore/NPCs do jogo, só não é uma opção jogável de Parente Divino. Ártemis também não tem
// filhos na mitologia, mas foi mantida jogável como licença criativa (não é o "correto"
// mitológico, é uma escolha de design pra não cortar uma opção já consolidada no jogo).
export const CASAS_DIVINAS: CasaDivina[] = [
  // ---------- Os Três Grandes ----------
  {
    nome: "Zeus",
    foco: "forca",
    dominio: "Céus, raios e autoridade",
    tema: "Filhos de Zeus nascem para liderar — presença que impõe respeito antes mesmo de falar.",
    sugestoes: ["Força", "Intimidação", "Liderar um grupo em crise"],
    grupo: "grande",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-zeus.png",
  },
  {
    nome: "Poseidon",
    foco: "vigor",
    dominio: "Mares, tempestades e terremotos",
    tema: "Temperamento imprevisível como o oceano — calma que vira tempestade sem aviso.",
    sugestoes: ["Vigor", "Natureza", "Ambientes aquáticos e instáveis"],
    grupo: "grande",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-poseidon.png",
  },
  {
    nome: "Hades",
    foco: "inteligencia",
    dominio: "Mundo inferior, riqueza oculta e morte",
    tema: "Introspectivos e observadores — enxergam o que os outros preferem ignorar.",
    sugestoes: ["Inteligência", "Investigação", "Lidar com o oculto e o funesto"],
    grupo: "grande",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-hades.png",
  },

  // ---------- Outros Olimpianos ----------
  {
    nome: "Deméter",
    foco: "vigor",
    dominio: "Agricultura, colheita e crescimento",
    tema: "Resistentes e pacientes como a própria terra — cuidam dos seus com uma teimosia inabalável.",
    sugestoes: ["Vigor", "Sobrevivência", "Resistir a provações longas"],
    grupo: "olimpiano",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-demeter.png",
  },
  {
    nome: "Ares",
    foco: "forca",
    dominio: "Guerra, combate direto e fúria",
    tema: "Vivem para o combate — a adrenalina da luta é onde se sentem mais vivos.",
    sugestoes: ["Força", "Atletismo", "Combate direto e agressivo"],
    grupo: "olimpiano",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-ares.png",
  },
  {
    nome: "Atena",
    foco: "inteligencia",
    dominio: "Sabedoria, estratégia e invenção tática",
    tema: "Pensam antes de agir — mestres em quebrar enigmas e planejar batalhas antes delas começarem.",
    sugestoes: ["Inteligência", "Investigação", "Tática em combate"],
    grupo: "olimpiano",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-atena.png",
  },
  {
    nome: "Apolo",
    foco: "carisma",
    dominio: "Sol, artes, música, medicina e profecia",
    tema: "Combinam talento artístico com um dom natural para curar e prever — carisma que ilumina qualquer sala.",
    sugestoes: ["Carisma", "Medicina", "Presença em performances"],
    grupo: "olimpiano",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-apolo.png",
  },
  {
    nome: "Ártemis",
    foco: "destreza",
    dominio: "Caça, natureza selvagem e independência",
    tema: "Independentes e precisos — preferem observar de longe antes de agir com precisão cirúrgica.",
    sugestoes: ["Destreza", "Percepção", "Combate à distância"],
    grupo: "olimpiano",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-artemis.png",
  },
  {
    nome: "Afrodite",
    foco: "carisma",
    dominio: "Amor, beleza, desejo e persuasão",
    tema: "Magnetismo que desarma — filhos de Afrodite raramente enfrentam uma porta fechada.",
    sugestoes: ["Carisma", "Sedução", "Diplomacia em situações tensas"],
    grupo: "olimpiano",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-afrodite.png",
  },
  {
    nome: "Hefesto",
    foco: "inteligencia",
    dominio: "Forja, engenharia e criação de artefatos",
    tema: "Mãos habilidosas e mente inventiva — resolvem qualquer problema com as ferramentas certas.",
    sugestoes: ["Inteligência", "Ofícios manuais", "Consertar ou construir sob pressão"],
    grupo: "olimpiano",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-hefesto.png",
  },
  {
    nome: "Hermes",
    foco: "destreza",
    dominio: "Viajantes, mensageiros, comércio e trapaça",
    tema: "Rápidos, espertos e sempre um passo à frente — nascidos para negociar, fugir ou entregar o recado certo na hora certa.",
    sugestoes: ["Destreza", "Furtividade", "Improvisação sob pressão"],
    grupo: "olimpiano",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-hermes.png",
  },
  {
    nome: "Dionísio",
    foco: "carisma",
    dominio: "Festa, excesso, teatro e loucura ritual",
    tema: "Magnéticos e imprevisíveis — arrastam qualquer roda pra festa, mas carregam um caos por perto.",
    sugestoes: ["Carisma", "Atuação", "Virar o clima de uma situação tensa"],
    grupo: "olimpiano",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-dionisio.png",
  },

  // ---------- Deuses Menores ----------
  {
    nome: "Íris",
    foco: "destreza",
    dominio: "Mensagens, arco-íris e comunicação entre mundos",
    tema: "Sempre em movimento entre um lugar e outro — levam recados que ninguém mais consegue entregar.",
    sugestoes: ["Destreza", "Diplomacia", "Atravessar lugares perigosos rápido"],
    grupo: "menor",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-iris.png",
  },
  {
    nome: "Hipnos",
    foco: "inteligencia",
    dominio: "Sono, sonhos e indução mental",
    tema: "Calmos por fora, atentos por dentro — enxergam o que se esconde na mente alheia.",
    sugestoes: ["Inteligência", "Enganação", "Manipular a percepção de um alvo"],
    grupo: "menor",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-hipnos.png",
  },
  {
    nome: "Nêmesis",
    foco: "carisma",
    dominio: "Vingança, equilíbrio e justiça retributiva",
    tema: "Frios e implacáveis — cada dívida é cobrada, cedo ou tarde, exatamente na medida certa.",
    sugestoes: ["Carisma", "Intimidação", "Fazer alguém pagar por um erro"],
    grupo: "menor",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-nemesis.png",
  },
  {
    nome: "Nice",
    foco: "forca",
    dominio: "Vitória e triunfo em competição",
    tema: "Não sabem perder — cada desafio é uma disputa que precisa ser vencida.",
    sugestoes: ["Força", "Atletismo", "Levar qualquer disputa até o fim"],
    grupo: "menor",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-nice.png",
  },
  {
    nome: "Hebe",
    foco: "vigor",
    dominio: "Juventude, vitalidade e renovação",
    tema: "Energia que não se esgota — recuperam-se de qualquer desgaste mais rápido que os outros.",
    sugestoes: ["Vigor", "Atletismo", "Se recuperar rápido de um esforço"],
    grupo: "menor",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-hebe.png",
  },
  {
    nome: "Tique",
    foco: "carisma",
    dominio: "Sorte, fortuna e acaso favorável",
    tema: "A sorte parece sempre inclinada a seu favor — mesmo o improviso mais arriscado dá certo.",
    sugestoes: ["Carisma", "Jogos de azar", "Apostar tudo num plano arriscado"],
    grupo: "menor",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-tique.png",
  },
  {
    nome: "Hécate",
    foco: "inteligencia",
    dominio: "Magia, encruzilhadas e ocultismo",
    tema: "Andam entre o visível e o oculto — sempre sabem mais do que deixam transparecer.",
    sugestoes: ["Inteligência", "Investigação", "Lidar com magia e rituais"],
    grupo: "menor",
    ilustracaoCompletaUrl: "/icons/deuses/ilustracao-deus-hecate.png",
  },
];

export const TOTAL_PONTOS_ATRIBUTO_PADRAO = 14; // soma inicial padrão (regra da casa configurável pelo Oráculo)
export const VALOR_MIN_ATRIBUTO = 1;
export const VALOR_MAX_ATRIBUTO = 5;

export interface RolagemResultado {
  dadoAtributo: number;
  resultadosDado: number[];
  d20: number[];
  usouMito: boolean;
  total: number;
  detalhe: string;
  // Regra da casa: "crítico" = o dado de atributo saiu no valor máximo dele (ex.: D8 saiu 8).
  // O livro não define isso oficialmente — só menciona passivas que reagem a "dado crítico"
  // sem especificar a condição — esta é a interpretação adotada pela plataforma.
  critico: boolean;
}

// Simula 1d20 + dado de atributo, aplicando a Regra do Mito quando cabível.
export function rolarTeste(valorAtributo: number, nivelEspecialidade: NivelEspecialidade): RolagemResultado {
  let dado = dadoDoAtributo(valorAtributo);
  if (nivelEspecialidade === "treinado" || nivelEspecialidade === "mestre") {
    dado = subirCategoria(dado, 1);
  }

  const rolarD = (faces: number) => Math.floor(Math.random() * faces) + 1;

  const usouMito = testeDoMito(valorAtributo, nivelEspecialidade !== "nenhum");
  const d20Resultados = usouMito ? [rolarD(20), rolarD(20)] : [rolarD(20)];
  const d20Final = Math.max(...d20Resultados);

  const resultadosAtributo = [rolarD(dado)];
  if (nivelEspecialidade === "mestre") {
    const segunda = rolarD(dado);
    resultadosAtributo.push(segunda);
  }
  const atributoFinal = Math.max(...resultadosAtributo);

  const total = d20Final + atributoFinal;
  const critico = atributoFinal === dado;

  const detalhe = `1d20${usouMito ? ` (Mito: ${d20Resultados.join(", ")})` : `(${d20Final})`} + 1d${dado}${
    nivelEspecialidade === "mestre" ? ` (Mestre: ${resultadosAtributo.join(", ")})` : `(${atributoFinal})`
  } = ${total}${critico ? " · Crítico!" : ""}`;

  return {
    dadoAtributo: dado,
    resultadosDado: resultadosAtributo,
    d20: d20Resultados,
    usouMito,
    total,
    detalhe,
    critico,
  };
}

// Rolagem livre no formato "NdM+K" (ex.: 2d6+3), usada fora da ficha (sidebar, painéis do Oráculo).
export function rolarFormula(formula: string): RolagemResultado | null {
  const m = formula.replace(/\s/g, "").toLowerCase().match(/^(\d*)d(\d+)([+-]\d+)?$/);
  if (!m) return null;

  const qtd = Math.min(20, parseInt(m[1] || "1", 10));
  const faces = Math.min(100, parseInt(m[2], 10));
  const mod = parseInt(m[3] || "0", 10);
  const rolarD = (f: number) => Math.floor(Math.random() * f) + 1;
  const rolagens = Array.from({ length: qtd }, () => rolarD(faces));
  const total = rolagens.reduce((a, b) => a + b, 0) + mod;

  return {
    dadoAtributo: faces,
    resultadosDado: rolagens,
    critico: false,
    d20: [],
    usouMito: false,
    total,
    detalhe: `[${qtd}d${faces}:${rolagens.join(",")}${mod ? (mod > 0 ? `+${mod}` : mod) : ""}] = ${total}`,
  };
}

export interface ResultadoDano {
  rolagens: number[];
  somaBase: number;
  multiplicador: number;
  total: number;
  detalhe: string;
}

/**
 * Rola o dado de dano de uma arma equipada (ex.: "1d8"), aplicando o multiplicador
 * de crítico do item quando o ataque anterior foi crítico. Função nova e separada
 * de rolarTeste/rolarFormula — não altera a rolagem normal de atributo (1d20+dado).
 */
export function rolarDano(formulaDado: string, multiplicador = 1): ResultadoDano | null {
  const m = formulaDado.replace(/\s/g, "").toLowerCase().match(/^(\d*)d(\d+)([+-]\d+)?$/);
  if (!m) return null;

  const qtd = Math.min(20, parseInt(m[1] || "1", 10));
  const faces = Math.min(100, parseInt(m[2], 10));
  const mod = parseInt(m[3] || "0", 10);
  const rolarD = (f: number) => Math.floor(Math.random() * f) + 1;
  const rolagens = Array.from({ length: qtd }, () => rolarD(faces));
  const somaBase = rolagens.reduce((a, b) => a + b, 0) + mod;
  const total = somaBase * multiplicador;

  const detalhe = `${qtd}d${faces}${mod ? (mod > 0 ? `+${mod}` : mod) : ""}: [${rolagens.join(", ")}]${
    mod ? ` ${mod > 0 ? "+" : ""}${mod}` : ""
  } = ${somaBase}${multiplicador > 1 ? ` × ${multiplicador} (crítico) = ${total}` : ""}`;

  return { rolagens, somaBase, multiplicador, total, detalhe };
}
