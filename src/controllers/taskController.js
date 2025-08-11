const db = require('../config/database');

exports.createTask = (req, res) => {
    const { description, priority } = req.body;
    const userId = req.userId;

    const sql = 'INSERT INTO tasks (description, priority, userId) VALUES (?, ?, ?)';
    db.run(sql, [description, priority, userId], function (err) {
        if (err) {
            return res.status(400).send({ error: 'Não foi possível criar a tarefa.' });
        }
        res.status(201).send({ id: this.lastID, description, priority });
    });
};

exports.getPendingTasks = (req, res) => {
    const userId = req.userId;

    const sql = `SELECT id, description, priority, status FROM tasks WHERE userId = ? AND status = 'pendente'`;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(400).send({ error: 'Não foi possível listar as tarefas.' });
        }
        res.status(200).send(rows);
    });
};

exports.updateTask = (req, res) => {
    const userId = req.userId;
    const taskId = req.params.id;
    const { description, priority, status } = req.body;

    const sqlCheck = 'SELECT * FROM tasks WHERE id = ? AND userId = ?';
    db.get(sqlCheck, [taskId, userId], (err, task) => {
        if (err || !task) {
            return res.status(404).send({ error: 'Tarefa não encontrada.' });
        }
        const sqlUpdate = 'UPDATE tasks SET description = ?, priority = ?, status = ? WHERE id = ?';
        db.run(sqlUpdate, [description || task.description, priority || task.priority, status || task.status, taskId], function (err) {
            if (err) {
                return res.status(400).send({ error: 'Não foi possível editar a tarefa.' });
            }
            res.status(200).send({ id: taskId, description: description || task.description, priority: priority || task.priority, status: status || task.status });
        });
    });
};

exports.deleteTask = (req, res) => {
    const userId = req.userId;
    const taskId = req.params.id;

    const sqlCheck = 'SELECT * FROM tasks WHERE id = ? AND userId = ?';
    db.get(sqlCheck, [taskId, userId], (err, task) => {
        if (err || !task) {
            return res.status(404).send({ error: 'Tarefa não encontrada.' });
        }
        const sqlDelete = 'DELETE FROM tasks WHERE id = ?';
        db.run(sqlDelete, [taskId], function (err) {
            if (err) {
                return res.status(400).send({ error: 'Não foi possível excluir a tarefa.' });
            }
            res.status(204).send();
        });
    });
};