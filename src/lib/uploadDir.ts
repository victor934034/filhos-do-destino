import { mkdir } from "fs/promises";
import path from "path";

// Em Docker aponta para o volume persistido (/app/data/uploads); em dev local
// cai numa pasta ao lado do banco SQLite, fora do public/ (que não sobrevive a rebuild).
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");

export async function diretorioDeUploads(): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  return UPLOAD_DIR;
}
