const TZ = "America/Argentina/Buenos_Aires";

// "YYYY-MM-DD" de hoy en hora Argentina
export const hoyAR = () => new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(new Date());

const aUTC = (iso: string) => new Date(`${iso}T00:00:00Z`);
export const sumarDias = (iso: string, n: number) => {
  const d = aUTC(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const lunesDe = (iso: string) => sumarDias(iso, -((aUTC(iso).getUTCDay() + 6) % 7));

export const esFecha = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const diaCorto = (iso: string) => DIAS[(aUTC(iso).getUTCDay() + 6) % 7];
export const fechaCorta = (iso: string) => `${diaCorto(iso)} ${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export const horasMin = (min: number | null) =>
  min === null ? "–" : `${Math.floor(Math.abs(min) / 60)}h ${String(Math.abs(min) % 60).padStart(2, "0")}m`;
