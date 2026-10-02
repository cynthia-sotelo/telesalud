export function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10_000)}@telesalud.com`;
}

/** Formatea una fecha para un input <input type="datetime-local"> (YYYY-MM-DDTHH:mm). */
export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Una franja horaria futura de 30 minutos, para no chocar con horarios ya cargados en corridas anteriores. */
export function futureScheduleWindow(minutesFromNow = 60): { startsAt: string; endsAt: string } {
  const start = new Date(Date.now() + minutesFromNow * 60_000);
  const end = new Date(start.getTime() + 30 * 60_000);
  return { startsAt: toDatetimeLocalValue(start), endsAt: toDatetimeLocalValue(end) };
}
