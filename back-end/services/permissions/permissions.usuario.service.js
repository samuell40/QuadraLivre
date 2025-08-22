const verificarPermissoes = require('../../utils/permisssion.utils.js');
const permissions = require('../../config/permissions.config.js');

function checkPermission(requiredPerms) {
  return async (req, res, next) => {
    try {
      await verificarPermissoes(req.user, requiredPerms);
      next();
    } catch (err) {
      next(err);
    }
  };
}

const todos = checkPermission(permissions.TODOS); 
const admin = checkPermission(permissions.ADMINISTRADOR); 
const devAdmin = checkPermission(permissions.DESENVOLVEDOR_DE_SISTEMA_E_ADMINISTRADOR);
const dev = checkPermission(permissions.DESENVOLVEDOR_DE_SISTEMA);
const usuarioComum = checkPermission(permissions.USUARIO);

module.exports = {
  todos,
  admin,
  devAdmin,
  dev,
  usuarioComum,
};