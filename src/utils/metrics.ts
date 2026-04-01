import { Cirugia, DemorasPorClinica, EstadisticaDemora, FacturacionPorClinica, Clinica } from '../types/cirugia.types';

/** Calcula la diferencia en días entre dos fechas ISO. */
export function calcularDemoraEnDias(fechaInicio: string, fechaFin: string): number {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffMs = fin.getTime() - inicio.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

/** Calcula media, mediana y cantidad sobre un arreglo de demoras en días. */
export function calcularMediaYMediana(demoras: number[]): EstadisticaDemora {
  const demorasValidas = demoras.filter((d) => Number.isFinite(d) && d >= 0);
  if (!demorasValidas.length) return { media: 0, mediana: 0, cantidad: 0 };

  const suma = demorasValidas.reduce((acc, val) => acc + val, 0);
  const media = suma / demorasValidas.length;

  const ordenadas = [...demorasValidas].sort((a, b) => a - b);
  const mitad = Math.floor(ordenadas.length / 2);
  const mediana = ordenadas.length % 2 === 0
    ? (ordenadas[mitad - 1] + ordenadas[mitad]) / 2
    : ordenadas[mitad];

  return {
    media: Math.round(media * 10) / 10,
    mediana: Math.round(mediana * 10) / 10,
    cantidad: demorasValidas.length,
  };
}

function acumularPorClinica(cirugias: Cirugia[], getDelay: (c: Cirugia) => number | null): DemorasPorClinica {
  const cdu: number[] = [];
  const gchu: number[] = [];
  cirugias.forEach((c) => {
    const demora = getDelay(c);
    if (demora == null) return;
    if (c.clinica === 'CDU') cdu.push(demora);
    else gchu.push(demora);
  });
  return {
    CDU: calcularMediaYMediana(cdu),
    Gualeguaychú: calcularMediaYMediana(gchu),
  };
}

/** A) Pedido -> Llegada */
export function calcularDemorasPedidoLlegada(cirugias: Cirugia[]): DemorasPorClinica {
  return acumularPorClinica(cirugias, (c) => {
    if (!c.pedido_lente || !c.llegada_lente) return null;
    return calcularDemoraEnDias(c.pedido_lente, c.llegada_lente);
  });
}

/** B) Llegada -> Programación */
export function calcularDemorasLlegadaProgramacion(cirugias: Cirugia[]): DemorasPorClinica {
  return acumularPorClinica(cirugias, (c) => {
    if (!c.llegada_lente || !c.programacion) return null;
    return calcularDemoraEnDias(c.llegada_lente, c.programacion);
  });
}

/** C) Programación -> Facturación */
export function calcularDemorasProgramacionFacturacion(cirugias: Cirugia[]): DemorasPorClinica {
  return acumularPorClinica(cirugias, (c) => {
    if (!c.programacion || !c.facturacion) return null;
    return calcularDemoraEnDias(c.programacion, c.facturacion);
  });
}

/** D) Cirugía ojo1 -> Pedido lente ojo2 (solo bilaterales) */
export function calcularDemorasCirugiaOjo1PedidoOjo2(cirugias: Cirugia[]): DemorasPorClinica {
  const bilaterales = cirugias.filter((c) => c.es_bilateral && c.cirugia_ojo1 && c.pedido_lente_ojo2);
  return acumularPorClinica(bilaterales, (c) => {
    if (!c.cirugia_ojo1 || !c.pedido_lente_ojo2) return null;
    return calcularDemoraEnDias(c.cirugia_ojo1, c.pedido_lente_ojo2);
  });
}

/** Analiza vitrectomías facturadas sobre total facturado. */
export function calcularAnalisisVitrectomias(cirugias: Cirugia[]): FacturacionPorClinica {
  const facturadas = cirugias.filter((c) => c.facturacion !== null);

  const calcular = (clinica: Clinica | null) => {
    const subset = clinica ? facturadas.filter((c) => c.clinica === clinica) : facturadas;
    const vitrectomias = subset.filter((c) => c.tipo_cirugia === 'Vitrectomía').length;
    const total = subset.length;
    return {
      total_facturadas: total,
      vitrectomias,
      otras: total - vitrectomias,
      porcentaje_vitrectomias: total > 0 ? Math.round((vitrectomias / total) * 100) : 0,
    };
  };

  return {
    CDU: calcular('CDU'),
    Gualeguaychú: calcular('Gualeguaychú'),
    total: calcular(null),
  };
}
