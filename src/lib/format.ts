export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const minutesToLabel = (m: number) => {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h}h` : `${h}h ${rest}min`;
};

export const categoryLabel: Record<string, string> = {
  cabelo: "Cabelo",
  unhas: "Unhas",
  maquiagem: "Maquiagem",
  estetica: "Estética",
  sobrancelhas: "Sobrancelhas",
};