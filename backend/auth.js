const database = require('./database.js');

class Auth {
    async handleLogin(req, res) {
        try {
            const body = await getRequestBody(req);
            const { usuario, password } = JSON.parse(body);
            
            const usuarios = await database.leerArchivo('usuarios.json');
            const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.password === password);
            
            if (usuarioEncontrado) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    usuario: {
                        id: usuarioEncontrado.id,
                        nombre: usuarioEncontrado.nombre,
                        rol: usuarioEncontrado.rol
                    }
                }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Credenciales incorrectas' }));
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Error en el servidor' }));
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

module.exports = new Auth();