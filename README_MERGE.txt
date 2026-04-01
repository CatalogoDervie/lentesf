MERGE realizado:
- Base estructural tomada de 2.zip
- Recuperadas funciones clave de 1.zip: WhatsApp funcional, modal Lentess, stock de lentes, exportación de listos
- Corregidos botones sin listeners en header y modales
- Corregido badge de conector y cierre de modales
- Incluido datos_desde_excel.json del ZIP 1 como referencia

Prueba recomendada:
1. Abrir index.html / deployar.
2. Verificar login.
3. Probar edición inline en tabla.
4. Probar tab WhatsApp.
5. Probar Lentess con conector local.
6. Probar Stock lentes.


FACTURAR TAB (2026-03-27)
- Nueva pestaña 'Facturar' en la web.
- Filtra pacientes en estado REALIZADA / falta facturar.
- Envía al conector local un job POST /jobs/facturar_docs con base_dir, output_dir y pacientes[].
- Las plantillas DOCX e imágenes DR *.jpg deben vivir en la carpeta local indicada por el usuario.
