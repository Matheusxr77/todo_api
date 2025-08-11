const express = require('express');
const router = express.Router();
const { createTask, getPendingTasks, updateTask, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const taskMiddleware = require('../middleware/taskMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Criação de nova tarefa
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [Alta, Média, Baixa]
 *     responses:
 *       201:
 *         description: Tarefa criada
 *       400:
 *         description: Erro ao criar tarefa
 */
router.post('/', taskMiddleware, createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Listar tarefas pendentes do usuário autenticado
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tarefas
 *       400:
 *         description: Erro ao listar tarefas
 */
router.get('/', getPendingTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Editar tarefa do usuário autenticado
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [Alta, Média, Baixa]
 *               status:
 *                 type: string
 *                 enum: [pendente, concluida]
 *     responses:
 *       200:
 *         description: Tarefa editada
 *       404:
 *         description: Tarefa não encontrada
 *       400:
 *         description: Erro ao editar tarefa
 */
router.put('/:id', taskMiddleware, updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Excluir tarefa do usuário autenticado
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *     responses:
 *       204:
 *         description: Tarefa excluída
 *       404:
 *         description: Tarefa não encontrada
 *       400:
 *         description: Erro ao excluir tarefa
 */
router.delete('/:id', deleteTask);

module.exports = router;