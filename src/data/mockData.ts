import { Cirugia, Clinica, ObraSocial, TipoCirugia } from '../types/cirugia.types';

function agregarDias(fechaISO: string, dias: number): string {
  const d = new Date(fechaISO);
  d.setDate(d.getDate() + dias);
  return d.toISOString();
}

function pick<T>(arr: T[], idx: number): T { return arr[idx % arr.length]; }

const OBRAS: ObraSocial[] = ['PAMI', 'OSER', 'PARTICULAR'];

export function generarMockCirugias(): Cirugia[] {
  const total = 150;
  const cduCount = 85;
  const vitCount = 15;
  const bilateralCount = 25;
  const data: Cirugia[] = [];

  for (let i = 0; i < total; i += 1) {
    const clinica: Clinica = i < cduCount ? 'CDU' : 'Gualeguaychú';
    const tipo: TipoCirugia = i < vitCount ? 'Vitrectomía' : 'Catarata';
    const esBilateral = i < bilateralCount;

    const baseDate = new Date(2024, 0, 1 + (i % 90), 9, 0, 0).toISOString();

    const pedidoLlegada = clinica === 'CDU'
      ? 7 + (i % 12) // tendencia ~12
      : 7 + (i % 6); // tendencia ~8

    const llegadaProgramacion = 2 + ((i * 3) % 7);
    const programacionFacturacion = 3 + ((i * 5) % 8);

    const pedido_lente = baseDate;
    const llegada_lente = agregarDias(pedido_lente, pedidoLlegada);
    const programacion = agregarDias(llegada_lente, llegadaProgramacion);
    const cirugia = programacion;
    const facturacion = agregarDias(programacion, programacionFacturacion);

    const cirugia_ojo1 = esBilateral ? cirugia : undefined;
    const pedido_lente_ojo2 = esBilateral ? agregarDias(cirugia, 20 + ((i * 7) % 26)) : undefined; // 20-45

    data.push({
      id: `MOCK-${String(i + 1).padStart(3, '0')}`,
      paciente: `Paciente ${i + 1}`,
      clinica,
      obra_social: pick(OBRAS, i),
      tipo_cirugia: tipo,
      pedido_lente,
      llegada_lente,
      programacion,
      cirugia,
      facturacion,
      es_bilateral: esBilateral,
      cirugia_ojo1,
      pedido_lente_ojo2,
    });
  }

  return data;
}

export const mockCirugias: Cirugia[] = generarMockCirugias();
