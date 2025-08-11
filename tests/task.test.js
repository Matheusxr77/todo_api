const request = require('supertest');
const app = require('../src/app');

let token;
let createdTaskId;

beforeAll(async () => {
    await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Task User',
            email: 'taskuser@example.com',
            password: 'Abcdef1!'
        });
    const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'taskuser@example.com',
            password: 'Abcdef1!'
        });
    token = res.body.token;
});

describe('Task Endpoints', () => {
    it('should create a new task', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Test Task',
                priority: 'Alta'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('description', 'Test Task');
        createdTaskId = res.body.id;
    });

    it('should list pending tasks', async () => {
        await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Another Task',
                priority: 'Média'
            });
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body[0]).toHaveProperty('status', 'pendente');
    });

    it('should edit a task', async () => {
        const res = await request(app)
            .put(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Edited Task',
                priority: 'Baixa',
                status: 'concluida'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('description', 'Edited Task');
        expect(res.body).toHaveProperty('priority', 'Baixa');
        expect(res.body).toHaveProperty('status', 'concluida');
    });

    it('should delete a task', async () => {
        const res = await request(app)
            .delete(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(204);
    });

    it('should not allow access with malformed token (missing Bearer)', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `BadToken abcdef`);
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error', 'Token mal formatado');
    });

    it('should not allow access with token with wrong parts', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer`);
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error', 'Erro no token');
    });

    it('should not allow access with invalid token', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer invalidtoken`);
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error', 'Token inválido');
    });

    it('should not allow access without token', async () => {
        const res = await request(app)
            .get('/api/tasks');
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error', 'Nenhum token fornecido');
    });

    it('should not create a task without description', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                priority: 'Alta'
            });
        expect(res.statusCode).toEqual(400);
    });

    it('should not create a task without priority', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'No priority'
            });
        expect(res.statusCode).toEqual(400);
    });

    it('should not create a task with invalid priority', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Invalid priority',
                priority: 'Urgente'
            });
        expect(res.statusCode).toEqual(400);
    });

    it('should not edit a task with invalid status', async () => {
        const createRes = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Task for status test',
                priority: 'Alta'
            });
        const taskId = createRes.body.id;

        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'em andamento'
            });
        expect(res.statusCode).toEqual(400);
    });

    it('should not edit a non-existent task', async () => {
        const res = await request(app)
            .put('/api/tasks/9999')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Should not work'
            });
        expect(res.statusCode).toEqual(404);
    });

    it('should not delete a non-existent task', async () => {
        const res = await request(app)
            .delete('/api/tasks/9999')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });

    it('should not allow editing/deleting another user\'s task', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Other User',
                email: 'otheruser@example.com',
                password: 'Abcdef1!'
            });
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'otheruser@example.com',
                password: 'Abcdef1!'
            });
        const otherToken = loginRes.body.token;

        const editRes = await request(app)
            .put(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${otherToken}`)
            .send({ description: 'Hack' });
        expect(editRes.statusCode).toEqual(404);

        const deleteRes = await request(app)
            .delete(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${otherToken}`);
        expect(deleteRes.statusCode).toEqual(404);
    });

    it('should not edit a task without description, priority or status (should keep old values)', async () => {
        const createRes = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Edit Partial',
                priority: 'Alta'
            });
        const taskId = createRes.body.id;

        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({});
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('description', 'Edit Partial');
        expect(res.body).toHaveProperty('priority', 'Alta');
        expect(res.body).toHaveProperty('status', 'pendente');
    });

    it('should create a task with explicit status pendente', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Explicit status',
                priority: 'Alta',
                status: 'pendente'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('description', 'Explicit status');
        expect(res.body).toHaveProperty('priority', 'Alta');
    });

    it('should not create a task with status inválido', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Invalid status',
                priority: 'Alta',
                status: 'em andamento'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Status inválido.');
    });

    it('should edit a task only with description', async () => {
        const createRes = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Edit only desc',
                priority: 'Média'
            });
        const taskId = createRes.body.id;

        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Edited desc'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('description', 'Edited desc');
        expect(res.body).toHaveProperty('priority', 'Média');
        expect(res.body).toHaveProperty('status', 'pendente');
    });

    it('should edit a task only with priority', async () => {
        const createRes = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Edit only priority',
                priority: 'Alta'
            });
        const taskId = createRes.body.id;

        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                priority: 'Baixa'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('description', 'Edit only priority');
        expect(res.body).toHaveProperty('priority', 'Baixa');
        expect(res.body).toHaveProperty('status', 'pendente');
    });

    it('should edit a task only with status', async () => {
        const createRes = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Edit only status',
                priority: 'Média'
            });
        const taskId = createRes.body.id;

        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'concluida'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('description', 'Edit only status');
        expect(res.body).toHaveProperty('priority', 'Média');
        expect(res.body).toHaveProperty('status', 'concluida');
    });

    it('should edit a task with no fields (should keep old values)', async () => {
        const createRes = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Edit nothing',
                priority: 'Alta'
            });
        const taskId = createRes.body.id;

        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({});
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('description', 'Edit nothing');
        expect(res.body).toHaveProperty('priority', 'Alta');
        expect(res.body).toHaveProperty('status', 'pendente');
    });

    it('should not list tasks from other users', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'User2',
                email: 'user2@example.com',
                password: 'Abcdef1!'
            });
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'user2@example.com',
                password: 'Abcdef1!'
            });
        const token2 = loginRes.body.token;

        await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token2}`)
            .send({
                description: 'User2 Task',
                priority: 'Média'
            });

        const listRes = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`);
        const found = listRes.body.find(t => t.description === 'User2 Task');
        expect(found).toBeUndefined();
    });

    it('should handle database error on createTask', async () => {
        const db = require('../src/config/database');
        const originalRun = db.run;
        db.run = (sql, params, cb) => cb(new Error('DB error'));
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'DB error',
                priority: 'Alta'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Não foi possível criar a tarefa.');
        db.run = originalRun;
    });

    it('should handle database error on getPendingTasks', async () => {
        const db = require('../src/config/database');
        const originalAll = db.all;
        db.all = (sql, params, cb) => cb(new Error('DB error'));
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Não foi possível listar as tarefas.');
        db.all = originalAll;
    });

    it('should handle database error on updateTask', async () => {
        const db = require('../src/config/database');
        const originalGet = db.get;
        db.get = (sql, params, cb) => cb(new Error('DB error'));
        const res = await request(app)
            .put('/api/tasks/1')
            .set('Authorization', `Bearer ${token}`)
            .send({ description: 'fail' });
        expect(res.statusCode).toEqual(404);
        db.get = originalGet;
    });

    it('should handle database error on updateTask when updating', async () => {
        const createRes = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'DB error update',
                priority: 'Alta'
            });
        const taskId = createRes.body.id;
        const db = require('../src/config/database');
        const originalRun = db.run;
        db.run = (sql, params, cb) => cb(new Error('DB error'));
        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ description: 'fail' });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Não foi possível editar a tarefa.');
        db.run = originalRun;
    });

    it('should handle database error on deleteTask', async () => {
        const db = require('../src/config/database');
        const originalGet = db.get;
        db.get = (sql, params, cb) => cb(new Error('DB error'));
        const res = await request(app)
            .delete('/api/tasks/1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
        db.get = originalGet;
    });

    it('should handle database error on deleteTask when deleting', async () => {
        const createRes = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'DB error delete',
                priority: 'Alta'
            });
        const taskId = createRes.body.id;
        const db = require('../src/config/database');
        const originalRun = db.run;
        db.run = (sql, params, cb) => cb(new Error('DB error'));
        const res = await request(app)
            .delete(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Não foi possível excluir a tarefa.');
        db.run = originalRun;
    });
});