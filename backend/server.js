const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Importar módulos
const auth = require('./auth.js');
const database = require('./database.js');
const inventario = require('./inventario.js');
const ventas = require('./ventas.js');
const clientes = require('./clientes.js');
const reportes = require('./reportes.js');

const PORT = 3000;

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Servir archivos estáticos del frontend
    if (method === 'GET' && pathname.startsWith('/frontend/')) {
        const filePath = path.join(__dirname, '..', pathname);
        serveStaticFile(res, filePath);
        return;
    }

    // Rutas de la API
    try {
        if (pathname === '/api/login' && method === 'POST') {
            await auth.handleLogin(req, res);
        }
        else if (pathname === '/api/inventario' && method === 'GET') {
            await inventario.obtenerInventario(req, res);
        }
        else if (pathname === '/api/inventario' && method === 'POST') {
            await inventario.agregarProducto(req, res);
        }
        else if (pathname === '/api/inventario' && method === 'PUT') {
            await inventario.actualizarProducto(req, res);
        }
        else if (pathname === '/api/ventas' && method === 'POST') {
            await ventas.registrarVenta(req, res);
        }
        else if (pathname === '/api/ventas' && method === 'GET') {
            await ventas.obtenerVentas(req, res);
        }
        else if (pathname === '/api/clientes' && method === 'POST') {
            await clientes.registrarCliente(req, res);
        }
        else if (pathname === '/api/clientes' && method === 'GET') {
            await clientes.obtenerClientes(req, res);
        }
        else if (pathname === '/api/reportes/ventas' && method === 'GET') {
            await reportes.obtenerReporteVentas(req, res);
        }
        else if (pathname === '/api/reportes/inventario' && method === 'GET') {
            await reportes.obtenerReporteInventario(req, res);
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
        }
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error interno del servidor' }));
    }
});

function serveStaticFile(res, filePath) {
    const extname = path.extname(filePath);
    const contentType = getContentType(extname);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Archivo no encontrado');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

function getContentType(extname) {
    const types = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg'
    };
    return types[extname] || 'text/plain';
}

server.listen(PORT, () => {
    console.log(`Servidor SysGestor ejecutándose en http://localhost:${PORT}`);
    console.log(`Accede a la aplicación desde: http://localhost:${PORT}/frontend/login.html`);
});

// Cerrar servidor correctamente
process.on('SIGINT', () => {
    console.log('\nCerrando servidor...');
    process.exit(0);
});