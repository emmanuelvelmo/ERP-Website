const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

class Database {
    async leerArchivo(archivo) {
        try {
            const filePath = path.join(DATA_DIR, archivo);
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // Si el archivo no existe, retornar array vacío
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    async escribirArchivo(archivo, datos) {
        const filePath = path.join(DATA_DIR, archivo);
        await fs.writeFile(filePath, JSON.stringify(datos, null, 2), 'utf8');
    }

    async obtenerProximoId(archivo) {
        const datos = await this.leerArchivo(archivo);
        if (datos.length === 0) return 1;
        return Math.max(...datos.map(item => item.id)) + 1;
    }
}

module.exports = new Database();