import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const criarAgendamento = async (req, res) => {
  try {
    const usuarioId = req.user.id 
    const { quadraId, dia, mes, ano, hora } = req.body

    if (!quadraId || !dia || !mes || !ano || !hora) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' })
    }

    // verifica se a quadra existe
    const quadra = await prisma.quadra.findUnique({ where: { id: quadraId } })
    if (!quadra) {
      return res.status(404).json({ error: 'Quadra não encontrada.' })
    }

    // verifica se já existe agendamento no mesmo horário
    const conflito = await prisma.agendamento.findFirst({
      where: { dia, mes, ano, hora }
    })
    if (conflito) {
      return res.status(409).json({ error: 'Horário já agendado.' })
    }

    // cria o agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        dia,
        mes,
        ano,
        hora,
        status: true,
        usuarioId,
      }
    })

    return res.status(201).json(agendamento)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao criar agendamento.' })
  }
}
