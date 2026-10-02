const TZ = "America/Argentina/Buenos_Aires";

export const fechaHora = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", { timeZone: TZ, dateStyle: "short", timeStyle: "short" }).format(new Date(iso));

export const hora = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", { timeZone: TZ, timeStyle: "short" }).format(new Date(iso));
