const database = require('./database.js');

class Clientes {
    async registrarCliente(req, res) {
        try {
            const body = await getRequestBody(req);
            const clienteData = JSON.parse(body);
            
            const clientes = await database.leerArchivo('clientes.json');
            
            const nuevoCliente = {
                id: await database.obtenerProximoId('clientes.json'),
                nombre: clienteData.nombre,
                email: clienteData.email,
                telefono: clienteData.telefono,
                direccion: clienteData.direccion,
                fecha_registro: new Date().toISOString()
            };
            
            clientes.push(nuevoCliente);
            await database.escribirArchivo('clientes.json', clientes);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, cliente: nuevoCliente }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Error al registrar cliente' }));
        }
    }

    async obtenerClientes(req, res) {
        try {
            const clientes = await database.leerArchivo('clientes.json');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(clientes));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al obtener clientes' }));
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

module.exports = new Clientes();