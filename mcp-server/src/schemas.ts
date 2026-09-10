import { z } from "zod";

export const CategoriaSchema = z
  .enum(["original", "comunidade"])
  .optional()
  .describe("Filtra por categoria: 'original' (curado por admins) ou 'comunidade' (enviado por qualquer chave admin). Omitir traz as duas.");

export const AtributoSchema = z
  .enum(["forca", "destreza", "vigor", "inteligencia", "carisma", "aparencia"])
  .describe("Um dos 6 atributos do sistema.");

export const ListarCampanhasSchema = z.object({
  categoria: CategoriaSchema,
}).strict();

export const MissaoInputSchema = z.object({
  titulo: z.string().min(1).describe("Título da missão/capítulo."),
  descricao: z.string().optional().describe("Descrição da missão."),
}).strict();

export const CriarCampanhaSchema = z.object({
  nome: z.string().min(1).max(80).describe("Nome da campanha."),
  sinopse: z.string().optional().describe("Sinopse/premissa da campanha."),
  tom: z.string().optional().describe("Tags de tom livres, separadas por vírgula (ex.: 'sombrio, investigação')."),
  capaUrl: z.string().url().optional().describe("URL de uma imagem de capa já hospedada."),
  visibilidade: z.enum(["publica", "privada"]).default("publica").describe("Se 'privada', só entra por convite."),
  vagasMaximas: z.number().int().min(1).max(20).default(5).describe("Número máximo de jogadores aprovados."),
  oficial: z
    .boolean()
    .default(false)
    .describe("Marca como 'Original' (curadoria oficial) — só tem efeito se a chave for de uma conta admin; senão é ignorado."),
  missoes: z.array(MissaoInputSchema).default([]).describe("Missões/capítulos iniciais já escritos, se houver."),
}).strict();

export const AdicionarMissaoSchema = z.object({
  campanhaId: z.string().min(1).describe("ID da campanha (dona da chave, ou qualquer uma se a chave for admin)."),
  titulo: z.string().min(1).describe("Título da missão/capítulo."),
  descricao: z.string().optional().describe("Descrição da missão."),
}).strict();

export const ListarCompendioSchema = z.object({
  categoria: CategoriaSchema,
}).strict();

const HabilidadeAtivaSchema = z.object({
  nome: z.string().min(1),
  alcance: z.enum(["corpoACorpo", "linhaReta", "area"]),
  dadoDeDano: z.string().describe("Ex.: '2d6', '1d8+2'."),
}).strict();

const HabilidadePassivaSchema = z.object({
  nome: z.string().min(1),
  efeito: z.string(),
}).strict();

export const CriarMonstroSchema = z.object({
  nome: z.string().min(1).max(80),
  ilustracaoUrl: z.string().url().optional(),
  vida: z.number().int().min(1),
  aspis: z.number().int().min(0),
  forca: z.number().int().min(1).max(5),
  destreza: z.number().int().min(1).max(5),
  vigor: z.number().int().min(1).max(5),
  inteligencia: z.number().int().min(1).max(5),
  carisma: z.number().int().min(1).max(5),
  aparencia: z.number().int().min(1).max(5),
  atributoAtaque: AtributoSchema.describe("Atributo usado pra rolar o ataque deste monstro."),
  habilidadesAtivas: z.array(HabilidadeAtivaSchema).default([]),
  habilidadesPassivas: z.array(HabilidadePassivaSchema).default([]),
  oficial: z
    .boolean()
    .default(false)
    .describe("Marca como 'Original' — só tem efeito com chave de conta admin."),
}).strict();

export const CriarItemSchema = z.object({
  nome: z.string().min(1).max(80),
  ilustracaoUrl: z.string().url().optional(),
  tipo: z.enum(["arma", "consumivel", "narrativo", "legado"]),
  dadoDeDano: z.string().optional().describe("Ex.: '1d8' — só faz sentido pra tipo 'arma'."),
  multiplicadorCritico: z.number().int().min(1).default(2),
  efeito: z.string().default("").describe("Efeito mecânico do item."),
  textoLore: z.string().default("").describe("Texto narrativo/flavor do item."),
  preco: z.number().int().min(0).default(0).describe("Preço em Dracmas no Mercado — 0 = não vendido lá."),
  oficial: z
    .boolean()
    .default(false)
    .describe("Marca como 'Original' — só tem efeito com chave de conta admin."),
}).strict();

export const CriarPoderSchema = z.object({
  nome: z.string().min(1).max(80),
  ilustracaoUrl: z.string().url().optional(),
  tipoAcao: z.enum(["Ação", "Reação", "Livre"]),
  custoEstamina: z.number().int().min(0).default(0),
  duracao: z.string().default("Instantânea"),
  efeito: z.string().describe("Efeito mecânico do poder."),
  oficial: z
    .boolean()
    .default(false)
    .describe("Marca como 'Original' — só tem efeito com chave de conta admin."),
}).strict();
