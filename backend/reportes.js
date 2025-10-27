const database = require('./database.js');

class Reportes {
    async obtenerReporteVentas(req, res) {
        try {
            const ventas = await database.leerArchivo('ventas.json');
            
            // Agrupar ventas por mes
            const ventasPorMes = {};
            ventas.forEach(venta => {
                const fecha = new Date(venta.fecha);
                const mes = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
                
                if (!ventasPorMes[mes]) {
                    ventasPorMes[mes] = 0;
                }
                ventasPorMes[mes] += venta.total;
            });
            
            // Productos más vendidos
            const productosVendidos = {};
            ventas.forEach(venta => {
                venta.productos.forEach(producto => {
                    if (!productosVendidos[producto.producto_id]) {
                        productosVendidos[producto.producto_id] = 0;
                    }
                    productosVendidos[producto.producto_id] += producto.cantidad;
                });
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                ventasPorMes,
                productosVendidos,
                totalVentas: ventas.reduce((sum, venta) => sum + venta.total, 0),
                cantidadVentas: ventas.length
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al generar reporte de ventas' }));
        }
    }

    async obtenerReporteInventario(req, res) {
        try {
            const inventario = await database.leerArchivo('inventario.json');
            const productos = await database.leerArchivo('productos.json');
            
            const productosBajoStock = inventario.filter(item => item.cantidad <= item.stock_minimo);
            const valorTotalInventario = inventario.reduce((sum, item) => {
                const producto = productos.find(p => p.id === item.producto_id);
                return sum + (item.cantidad * (producto ? producto.precio_compra : 0));
            }, 0);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                productosBajoStock: productosBajoStock.map(item => {
                    const producto = productos.find(p => p.id === item.producto_id);
                    return {
                        ...item,
                        nombre: producto ? producto.nombre : 'N/A'
                    };
                }),
                valorTotalInventario,
                totalProductos: inventario.length,
                productosActivos: inventario.filter(item => item.cantidad > 0).length
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al generar reporte de inventario' }));
        }
    }
}

module.exports = new Reportes();