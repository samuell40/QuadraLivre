const prisma = require('../lib/prisma');

async function verificarPermissions(usuario, permission_id) {
    for (let i in permission_id) {
        if (usuario.permissaoId === permission_id[i]) {
            return 'Autorizado';
        }
    }
    const err = new Error('Permissao negada.');
    err.code = 401;
    err.statusCode = 401;
    throw err;
}

module.exports = verificarPermissions;
