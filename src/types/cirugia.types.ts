export type Clinica = 'CDU' | 'Gualeguaychú';
export type ObraSocial = 'PAMI' | 'OSER' | 'PARTICULAR';
export type TipoCirugia = 'Catarata' | 'Vitrectomía';

export interface Cirugia {
  id: string;
  paciente: string;
  clinica: Clinica;
  obra_social: ObraSocial;
  tipo_cirugia: TipoCirugia;
  pedido_lente: string;
  llegada_lente: string | null;
  programacion: string | null;
  cirugia: string | null;
  facturacion: string | null;
  es_bilateral: boolean;
  cirugia_ojo1?: string;
  pedido_lente_ojo2?: string;
}

export interface EstadisticaDemora {
  media: number;
  mediana: number;
  cantidad: number;
}

export interface DemorasPorClinica {
  CDU: EstadisticaDemora;
  Gualeguaychú: EstadisticaDemora;
}

export interface AnalisisFacturacion {
  total_facturadas: number;
  vitrectomias: number;
  otras: number;
  porcentaje_vitrectomias: number;
}

export interface FacturacionPorClinica {
  CDU: AnalisisFacturacion;
  Gualeguaychú: AnalisisFacturacion;
  total: AnalisisFacturacion;
}
