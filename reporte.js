// Lee datos desde localStorage o usa arrays vacíos
const ventas = JSON.parse(localStorage.getItem('ventasChbelaHistorial') || '[]');
const productos = JSON.parse(localStorage.getItem('productosChbela') || '[]');
const vendedores = JSON.parse(localStorage.getItem('vendedoresChbela') || '[]');

// Utilidad para crear elementos tabla
function crearFilaTabla(cols) {
  const tr = document.createElement('tr');
  cols.forEach(col => {
    const td = document.createElement('td');
    td.textContent = col;
    tr.appendChild(td);
  });
  return tr;
}

// Rellenar tabla de ventas
function cargarTablaVentas() {
  const tbody = document.querySelector('#tablaVentas tbody');
  tbody.innerHTML = '';
  ventas.forEach(venta => {
    venta.productos.forEach(prod => {
      tbody.appendChild(crearFilaTabla([
        venta.ticket,
        venta.fecha,
        venta.vendedor,
        prod.codigo,
        prod.descripcion,
        prod.cantidad,
        prod.precio.toFixed(2),
        prod.subtotal.toFixed(2),
        venta.total.toFixed(2),
      ]));
    });
  });
}

// Rellenar tabla de inventario
function cargarTablaInventario() {
  const tbody = document.querySelector('#tablaInventario tbody');
  tbody.innerHTML = '';
  productos.forEach(prod => {
    tbody.appendChild(crearFilaTabla([
      prod.codigo,
      prod.descripcion,
      parseFloat(prod.precioVenta).toFixed(2),
      prod.existencia,
    ]));
  });
}

// Calcular resumen de vendedores
function calcularResumenVendedores() {
  const resumen = {};
  ventas.forEach(venta => {
    const v = venta.vendedor;
    if (!resumen[v]) resumen[v] = { totalVentas: 0, ventasRealizadas: 0, productosVendidos: 0 };
    resumen[v].totalVentas += venta.total;
    resumen[v].ventasRealizadas += 1;
    venta.productos.forEach(p => {
      resumen[v].productosVendidos += p.cantidad;
    });
  });
  return resumen;
}

// Rellenar tabla de vendedores
function cargarTablaVendedores() {
  const tbody = document.querySelector('#tablaVendedores tbody');
  tbody.innerHTML = '';
  const resumen = calcularResumenVendedores();
  for (const vendedor in resumen) {
    const data = resumen[vendedor];
    tbody.appendChild(crearFilaTabla([
      vendedor,
      data.totalVentas.toFixed(2),
      data.ventasRealizadas,
      data.productosVendidos,
    ]));
  }
}

// Convertir JSON a CSV (para exportar)
function jsonToCSV(items, columns) {
  const header = columns.join(',');
  const rows = items.map(item => {
    return columns.map(col => {
      let val = item[col] !== undefined ? item[col] : '';
      if (typeof val === 'string') {
        val = val.replace(/"/g, '""');
        if (val.search(/("|,|\n)/g) >= 0) {
          val = `"${val}"`;
        }
      }
      return val;
    }).join(',');
  });
  return [header, ...rows].join('\n');
}

// Descargar CSV
function descargarArchivo(contenido, nombreArchivo) {
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nombreArchivo;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Exportar ventas
document.getElementById('exportVentasBtn').addEventListener('click', () => {
  if (ventas.length === 0) {
    alert('No hay ventas para exportar.');
    return;
  }
  let csvRows = [];
  ventas.forEach(venta => {
    venta.productos.forEach(prod => {
      csvRows.push({
        Ticket: venta.ticket,
        Fecha: venta.fecha,
        Vendedor: venta.vendedor,
        Codigo: prod.codigo,
        Descripcion: prod.descripcion,
        Cantidad: prod.cantidad,
        Precio: prod.precio.toFixed(2),
        Subtotal: prod.subtotal.toFixed(2),
        TotalVenta: venta.total.toFixed(2)
      });
    });
  });
  const csv = jsonToCSV(csvRows, ['Ticket','Fecha','Vendedor','Codigo','Descripcion','Cantidad','Precio','Subtotal','TotalVenta']);
  descargarArchivo(csv, 'reporte_ventas.csv');
});

// Exportar inventario
document.getElementById('exportInventarioBtn').addEventListener('click', () => {
  if (productos.length === 0) {
    alert('No hay productos en inventario.');
    return;
  }
  const csv = jsonToCSV(productos, ['codigo','descripcion','precioVenta','existencia']);
  descargarArchivo(csv, 'inventario_actual.csv');
});

// Exportar vendedores
document.getElementById('exportVendedoresBtn').addEventListener('click', () => {
  const resumen = calcularResumenVendedores();
  const data = Object.entries(resumen).map(([vendedor, vals]) => ({
    Vendedor: vendedor,
    TotalVentas: vals.totalVentas.toFixed(2),
    VentasRealizadas: vals.ventasRealizadas,
    TotalProductosVendidos: vals.productosVendidos
  }));
  if (data.length === 0) {
    alert('No hay datos de vendedores para exportar.');
    return;
  }
  const csv = jsonToCSV(data, ['Vendedor','TotalVentas','VentasRealizadas','TotalProductosVendidos']);
  descargarArchivo(csv, 'resumen_vendedores.csv');
});

// Cargar datos al cargar la página
window.onload = () => {
  cargarTablaVentas();
  cargarTablaInventario();
  cargarTablaVendedores();
};
