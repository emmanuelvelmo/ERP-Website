const database = require('./database.js');

class Inventario {
    async obtenerInventario(req, res) {
        try {
            const inventario = await database.leerArchivo('inventario.json');
            const productos = await database.leerArchivo('productos.json');
            
            // Combinar información de productos con inventario
            const inventarioCompleto = inventario.map(item => {
                const producto = productos.find(p => p.id === item.producto_id);
                return {
                    ...item,
                    nombre: producto ? producto.nombre : 'Producto no encontrado',
                    categoria: producto ? producto.categoria : 'N/A'
                };
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(inventarioCompleto));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al obtener inventario' }));
        }
    }

    async agregarProducto(req, res) {
        try {
            const body = await getRequestBody(req);
            const productoData = JSON.parse(body);
            
            const productos = await database.leerArchivo('productos.json');
            const nuevoId = await database.obtenerProximoId('productos.json');
            
            const nuevoProducto = {
                id: nuevoId,
                nombre: productoData.nombre,
                descripcion: productoData.descripcion,
                categoria: productoData.categoria,
                precio_compra: productoData.precio_compra,
                precio_venta: productoData.precio_venta,
                fecha_creacion: new Date().toISOString()
            };
            
            productos.push(nuevoProducto);
            await database.escribirArchivo('productos.json', productos);

            // Agregar al inventario
            const inventario = await database.leerArchivo('inventario.json');
            inventario.push({
                producto_id: nuevoId,
                cantidad: productoData.cantidad_inicial || 0,
                stock_minimo: productoData.stock_minimo || 10,
                ubicacion: productoData.ubicacion || 'Almacén'
            });
            
            await database.escribirArchivo('inventario.json', inventario);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, producto: nuevoProducto }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Error al agregar producto' }));
        }
    }

    async actualizarProducto(req, res) {
        try {
            const body = await getRequestBody(req);
            const updateData = JSON.parse(body);
            
            const productos = await database.leerArchivo('productos.json');
            const productoIndex = productos.findIndex(p => p.id === updateData.id);
            
            if (productoIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Producto no encontrado' }));
                return;
            }
            
            productos[productoIndex] = { ...productos[productoIndex], ...updateData };
            await database.escribirArchivo('productos.json', productos);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, producto: productos[productoIndex] }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Error al actualizar producto' }));
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

module.exports = new Inventario();