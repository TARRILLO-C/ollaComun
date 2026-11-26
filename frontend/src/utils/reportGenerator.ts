/**
 * reportGenerator.ts
 * Utilidad pura para exportar reportes de impacto y trazabilidad en EcoFood
 * Genera reportes en formato CSV (abrible directamente en Excel) y documentos
 * imprimibles / guardables en PDF oficiales con membrete y sello de certificación.
 */

export interface ReporteItem {
  id: string;
  fecha: string;
  alimento: string;
  categoria: string;
  cantidad: string;
  contraparte: string; // Comedor receptor o Bodega donante
  metodoOEstado: string;
}

export interface ReporteMetricas {
  titulo: string;
  periodo: string;
  entidadNombre: string;
  tipoEntidad: 'BODEGA' | 'COMEDOR';
  kilosTotales: number;
  racionesTotales: number;
  co2EvitadoKg: number;
  totalOperaciones: number;
  items: ReporteItem[];
}

/**
 * Genera y descarga un archivo CSV compatible con Excel con BOM UTF-8
 */
export function descargarReporteCSV(datos: ReporteMetricas): void {
  const BOM = '\uFEFF';
  const headers = ['ID', 'Fecha', 'Alimento / Lote', 'Categoría', 'Cantidad', 'Comedor / Bodega', 'Validación / Estado'];
  
  const rows = datos.items.map(item => [
    `"${item.id}"`,
    `"${item.fecha}"`,
    `"${item.alimento.replace(/"/g, '""')}"`,
    `"${item.categoria}"`,
    `"${item.cantidad}"`,
    `"${item.contraparte.replace(/"/g, '""')}"`,
    `"${item.metodoOEstado}"`
  ]);

  const resumen = [
    `"REPORTE OFICIAL DE IMPACTO Y TRAZABILIDAD - ECOFOOD"`,
    `"Entidad:","${datos.entidadNombre}"`,
    `"Tipo:","${datos.tipoEntidad === 'BODEGA' ? 'Bodega Donante Solidaria' : 'Comedor Popular / Olla Común'}"`,
    `"Periodo:","${datos.periodo}"`,
    `"Kilos Totales Rescatados:","${datos.kilosTotales} kg"`,
    `"Raciones Estimadas Servidas:","${datos.racionesTotales}"`,
    `"Huella de CO2 Evitada:","${datos.co2EvitadoKg} kg"`,
    `"Total Donaciones Auditadas:","${datos.totalOperaciones}"`,
    `""`, // Línea en blanco
    headers.join(',')
  ];

  const csvContent = BOM + resumen.join('\n') + '\n' + rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const fileName = `Reporte_EcoFood_${datos.tipoEntidad}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Genera una vista de impresión formal lista para guardar en PDF con formato oficial
 */
export function descargarReportePDF(datos: ReporteMetricas): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor permite las ventanas emergentes en tu navegador para ver y descargar el reporte en PDF.');
    return;
  }

  const filasHtml = datos.items.map((item, index) => `
    <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 11px;">${item.id}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${item.fecha}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600;">${item.alimento}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${item.categoria}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: bold; color: #059669;">${item.cantidad}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${item.contraparte}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #475569;">${item.metodoOEstado}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Impacto EcoFood - ${datos.entidadNombre}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 30px;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #059669;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .logo-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-badge {
          background: #059669;
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 900;
        }
        .title {
          font-size: 22px;
          font-weight: 800;
          color: #064e3b;
          margin: 0;
        }
        .subtitle {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }
        .meta-box {
          text-align: right;
          font-size: 12px;
          color: #475569;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .card {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 15px;
          text-align: center;
        }
        .card-val {
          font-size: 24px;
          font-weight: 800;
          color: #059669;
        }
        .card-lbl {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #166534;
          margin-top: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background-color: #064e3b;
          color: white;
          text-align: left;
          padding: 12px 10px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .footer {
          border-top: 1px solid #cbd5e1;
          padding-top: 15px;
          font-size: 11px;
          color: #64748b;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .badge-verified {
          display: inline-block;
          background: #dcfce7;
          color: #15803d;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
        }
        @media print {
          body { padding: 15px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 10px 20px; font-weight: bold; font-size: 14px; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          🖨️ Imprimir / Guardar como PDF
        </button>
      </div>

      <div class="header">
        <div class="logo-box">
          <div class="logo-badge">🌱</div>
          <div>
            <h1 class="title">EcoFood Perú</h1>
            <div class="subtitle">Certificado de Rescate de Alimentos e Impacto Ambiental</div>
          </div>
        </div>
        <div class="meta-box">
          <div><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString('es-PE')}</div>
          <div><strong>Periodo:</strong> ${datos.periodo}</div>
          <div><span class="badge-verified">✓ Trazabilidad Auditada</span></div>
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; margin-bottom: 25px;">
        <div style="font-size: 14px; font-weight: 800; color: #1e293b;">
          ${datos.tipoEntidad === 'BODEGA' ? '🏪 Bodega Emisora' : '🍲 Comedor Beneficiario'}: ${datos.entidadNombre}
        </div>
        <div style="font-size: 12px; color: #64748b; margin-top: 3px;">
          Reporte generado bajo el estándar solidario EcoFood en conformidad con la Ley N° 30988 de prevención de pérdidas de alimentos.
        </div>
      </div>

      <div class="cards-grid">
        <div class="card">
          <div class="card-val">${datos.kilosTotales} kg</div>
          <div class="card-lbl">Kilos Rescatados</div>
        </div>
        <div class="card">
          <div class="card-val">${datos.racionesTotales}</div>
          <div class="card-lbl">Raciones Servidas</div>
        </div>
        <div class="card">
          <div class="card-val">${datos.co2EvitadoKg} kg</div>
          <div class="card-lbl">CO₂ Evitado</div>
        </div>
        <div class="card">
          <div class="card-val">${datos.totalOperaciones}</div>
          <div class="card-lbl">Entregas Validadas</div>
        </div>
      </div>

      <h3 style="font-size: 14px; color: #1e293b; margin-bottom: 12px; font-weight: 800;">
        Detalle de Entregas y Alimentos Rescatados
      </h3>

      <table>
        <thead>
          <tr>
            <th>ID Registro</th>
            <th>Fecha / Hora</th>
            <th>Alimento Rescatado</th>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th>${datos.tipoEntidad === 'BODEGA' ? 'Comedor Receptor' : 'Bodega Donante'}</th>
            <th>Método Validación</th>
          </tr>
        </thead>
        <tbody>
          ${filasHtml}
        </tbody>
      </table>

      <div class="footer">
        <div>EcoFood Perú — Plataforma Oficial de Rescate de Alimentos • www.ecofood.pe</div>
        <div>Código de Seguridad Digital: <strong>ECO-${Math.random().toString(36).substring(2, 9).toUpperCase()}</strong></div>
      </div>

      <script>
        // Disparar diálogo de impresión automáticamente al abrir
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
