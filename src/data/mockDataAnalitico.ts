import { SurgeryRow, Clinica, TipoCirugia, LensStatus, ObraSocial } from '../types/analytics.types';

const medicos = ['Dr. Luna', 'Dra. Pérez', 'Dr. Gómez', 'Dra. Silva'];
const obras: ObraSocial[] = ['PAMI', 'OSER', 'PARTICULAR'];

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

export const mockDataAnalitico: SurgeryRow[] = Array.from({ length: 120 }).map((_, i) => {
  const clinica: Clinica = i % 2 === 0 ? 'CDU' : 'Gualeguaychú';
  const tipoCirugia: TipoCirugia = i % 10 === 0 ? 'Vitrectomía' : 'Catarata';
  const base = new Date(2025, (i % 12), 1 + (i % 25), 9, 0, 0).toISOString();

  const d1 = clinica === 'CDU' ? 8 + (i % 10) : 6 + (i % 8); // pedido->recibo
  const d2 = 1 + (i % 6); // clinica->programada
  const d3 = (i % 6) - 1; // programada->realizada (reprogramaciones)
  const d4 = 2 + (i % 9); // realizada->facturada

  const pedidoLente = base;
  const reciboLente = addDays(pedidoLente, d1);
  const lenteEnClinica = addDays(reciboLente, 1);
  const fechaProgramada = addDays(lenteEnClinica, d2);
  const fechaRealizada = addDays(fechaProgramada, d3);
  const fechaFacturada = addDays(fechaRealizada, d4);

  const outlier = i % 27 === 0;
  const adjustedFact = outlier ? addDays(fechaRealizada, 45 + (i % 12)) : fechaFacturada;

  const bilateral = i % 5 === 0;
  const fechaCirugiaOjo1 = bilateral ? fechaRealizada : undefined;
  const fechaPedidoLenteOjo2 = bilateral ? addDays(fechaRealizada, outlier ? 60 : 18 + (i % 15)) : undefined;

  const statusFlow: LensStatus = !reciboLente ? 'Pedido' : !lenteEnClinica ? 'En Tránsito' : !fechaRealizada ? 'En Clínica' : 'Implantada';

  return {
    id: `AN-${String(i + 1).padStart(4, '0')}`,
    paciente: `Paciente ${i + 1}`,
    medico: pick(medicos, i),
    clinica,
    obraSocial: pick(obras, i),
    tipoCirugia,
    lensStatus: statusFlow,
    pedidoLente,
    reciboLente,
    lenteEnClinica,
    fechaProgramada,
    fechaRealizada,
    fechaFacturada: adjustedFact,
    bilateral,
    fechaCirugiaOjo1,
    fechaPedidoLenteOjo2,
  };
});
