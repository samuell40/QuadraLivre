const Usuario = require('../services/usuario.service');

async function postUsuario(req, res) {
  try {
    const cadastro = await Usuario.postUsuario(req.body);
    res.status(200).json({ cadastro });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
}

async function updateUsuario(req, res) {
  try {
    const { email, funcao, permissaoId, quadra, timeId } = req.body;

    const usuarioAtualizado = await Usuario.updateUsuario({
      email,
      funcao,
      permissaoId,
      quadra,
      timeId,
    });

    // Retorna o usuário atualizado
    res.status(200).json({ usuario: usuarioAtualizado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao editar usuário.' });
  }
}


async function getUsuarios(req, res) {
  try {
    const usuarios = await Usuario.getUsuarios(); 
    res.status(200).json(usuarios);               
  } catch (error) {
    console.error('Erro no getUsuarios:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
}

async function getPermissoes(req, res) {
  try {
    const permissoes = await Usuario.listarPermissoes();
    res.status(200).json(permissoes);
  } catch (err) {
    console.error('Erro ao buscar permissões:', err);
    res.status(500).json({ error: 'Erro ao buscar permissões.' });
  }
}

const vincularUsuarioTimeController = async (req, res) => {
  try {
    const { usuarioId, timeId } = req.body;
    const vinculo = await Usuario.vincularUsuarioTime(usuarioId, timeId);
    return res.status(201).json({ 
      message: 'Usuário vinculado ao time com sucesso', 
      vinculo 
    });
  } catch (error) {
    // Se for erro de vínculo na mesma modalidade
    if (error.message.includes('já está vinculado ao time')) {
      return res.status(409).json({ error: error.message }); // 409 = conflito
    }
    
    console.error('Erro ao vincular usuário ao time:', error);
    return res.status(400).json({ error: error.message || 'Erro ao vincular usuário ao time.' });
  }
};


module.exports = { postUsuario, updateUsuario, getUsuarios, getPermissoes, vincularUsuarioTimeController};
