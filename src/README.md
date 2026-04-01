# DashboardAnalitico (React + TypeScript)

## Estructura implementada
- `types/analytics.types.ts`: tipos del modelo quirúrgico y estados de lente.
- `utils/stats.utils.ts`: funciones puras (media, mediana, moda, percentiles P25/P50/P75/P90, daysBetween).
- `data/mockDataAnalitico.ts`: dataset mock con outliers.
- `data/mockDataAnalitico.json`: export JSON de prueba para BI.
- `components/analitico/FiltersPanel.tsx`: filtros cruzados globales.
- `components/analitico/KPICards.tsx`: tarjetas KPI.
- `components/analitico/ChartsPanel.tsx`: gráfico de volumen y dispersión/outliers.
- `components/analitico/HighPerformanceTable.tsx`: tabla con ordenamiento + paginación + badges de estado.
- `components/analitico/ExportButton.tsx`: exportación CSV de dataset filtrado.
- `components/analitico/DashboardAnalitico.tsx`: composición de todo el módulo.

## Qué analiza
1. Supply Chain: Pedido de lente -> Recibo de lente
2. Planificación: Lente en clínica -> Fecha programada
3. Ejecución: Fecha programada -> Fecha realizada
4. Administración: Fecha realizada -> Fecha facturada

## Detección de anomalías
- Se calcula P90 por etapa y se marca como outlier toda demora > P90.
- Los outliers se visualizan en rojo en el scatter.

## Integración sugerida
1. Montar `DashboardAnalitico` en una ruta React.
2. Reemplazar `mockDataAnalitico` por dataset real desde API/Firebase.
3. Mantener fechas ISO para precisión estadística.
