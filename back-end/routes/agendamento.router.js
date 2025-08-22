import express from 'express'
import { criarAgendamento } from '../controllers/agendamento.controller.js'
import { autenticar } from '../middlewares/auth.js'

const router = express.Router()

router.post('/agendamento', autenticar, criarAgendamento)

export default router
