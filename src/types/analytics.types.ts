export type Clinica = 'CDU' | 'Gualeguaychú';
export type TipoCirugia = 'Catarata' | 'Vitrectomía';
export type LensStatus = 'Pedido' | 'En Tránsito' | 'En Clínica' | 'Implantada';
export type ObraSocial = 'PAMI' | 'OSER' | 'PARTICULAR';

export interface SurgeryRow {
  id: string;
  paciente: string;
  medico: string;
  clinica: Clinica;
  obraSocial: ObraSocial;
  tipoCirugia: TipoCirugia;
  lensStatus: LensStatus;
  pedidoLente: string;
  reciboLente: string | null;
  lenteEnClinica: string | null;
  fechaProgramada: string | null;
  fechaRealizada: string | null;
  fechaFacturada: string | null;
  bilateral: boolean;
  fechaCirugiaOjo1?: string;
  fechaPedidoLenteOjo2?: string;
}
