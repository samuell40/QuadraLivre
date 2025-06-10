const verificarPermissoes = require('../../utils/permisssion.utils.js');
const permissions = require('../../config/permissions.config.js')

async function get(req, res, next) {
    try {
        await verificarPermissoes(req.user, permissions.PERMISSAO_ADMIN);
        next(); 
    } catch (err) {
        next(err);
    }
}
async function getDados(req, res, next) {
    try {
        await verificarPermissoes(req.user, permissions.TODOS);
        next(); 
    } catch (err) {
        next(err);
    }
}

async function post(req, res, next) {
    try {
        await verificarPermissoes(req.user, permissions.TODOS);
        next();
    } catch (err) {
        next(err);
    }
}
async function apagar(req, res, next) {
    try {
        await verificarPermissoes(req.user, permissions.PERMISSAO_ADMIN);
        next(); 
    } catch (err) {
        next(err);
    }
}
async function postUsuario(req, res, next) {
    try {
        await verificarPermissoes(req.user, permissions.PERMISSAO_ADMIN);
        next(); 
    } catch (err) {
        next(err);
    }
}

module.exports = {get, getDados, post, apagar, postUsuario};