const database = require('./database.js');

class Ventas {
    async registrarVenta(req, res) {
        try {
            const body = await getRequestBody(req);
            const ventaData = JSON.parse(body);
            
            const ventas = await database.leerArchivo('ventas.json');
            const inventario = await database.leerArchivo('inventario.json');
            
            const nuevaVenta = {
                id: await database.obtenerProximoId('ventas.json'),
                cliente_id: ventaData.cliente_id,
                productos: ventaData.productos,
                total: ventaData.total,
                fecha: new Date().toISOString(),
                estado: 'completada'
            };
            
            // Actualizar inventario
            for (const productoVenta of ventaData.productos) {
                const inventarioIndex = inventario.findIndex(item => item.producto_id === productoVenta.producto_id);
                if (inventarioIndex !== -1) {
                    inventario[inventarioIndex].cantidad -= productoVenta.cantidad;
                }
            }
            
            ventas.push(nuevaVenta);
            await database.escribirArchivo('ventas.json', ventas);
            await database.escribirArchivo('inventario.json', inventario);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, venta: nuevaVenta }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Error al registrar venta' }));
        }
    }

    async obtenerVentas(req, res) {
        try {
            const ventas = await database.leerArchivo('ventas.json');
            const clientes = await database.leerArchivo('clientes.json');
            const productos = await database.leerArchivo('productos.json');
            
            const ventasCompletas = ventas.map(venta => {
                const cliente = clientes.find(c => c.id === venta.cliente_id);
                const productosCompletos = venta.productos.map(pv => {
                    const producto = productos.find(p => p.id === pv.producto_id);
                    return {
                        ...pv,
                        nombre: producto ? producto.nombre : 'Producto no encontrado',
                        precio_unitario: producto ? producto.precio_venta : 0
                    };
                });
                
                return {
                    ...venta,
                    cliente_nombre: cliente ? cliente.nombre : 'Cliente no encontrado',
                    productos: productosCompletos
                };
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(ventasCompletas));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al obtener ventas' }));
        }
    }
}

function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            resolve(body);
        });
        req.on('error', reject);
    });
}

module.exports = new Ventas();