const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'Abcdef1!'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('should not register duplicate email', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'dup@example.com',
                password: 'Abcdef1!'
            });
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'dup@example.com',
                password: 'Abcdef1!'
            });
        expect(res.statusCode).toEqual(400);
    });

    it('should login with correct credentials', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Login User',
                email: 'login@example.com',
                password: 'Abcdef1!'
            });
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'login@example.com',
                password: 'Abcdef1!'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should not login with wrong password', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Wrong Pass',
                email: 'wrongpass@example.com',
                password: 'Abcdef1!'
            });
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'wrongpass@example.com',
                password: 'wrongpass'
            });
        expect(res.statusCode).toEqual(401);
    });

    it('should not register with invalid email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Invalid Email',
                email: 'invalidemail',
                password: 'Abcdef1!'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'E-mail inválido.');
    });

    it('should not register with weak password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Weak Password',
                email: 'weakpass@example.com',
                password: '12345678'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should logout successfully', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Logout User',
                email: 'logout@example.com',
                password: 'Abcdef1!'
            });
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'logout@example.com',
                password: 'Abcdef1!'
            });
        const token = loginRes.body.token;

        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Logout realizado com sucesso.');
    });

    it('should logout without token (optional)', async () => {
        const res = await request(app)
            .post('/api/auth/logout');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Logout realizado com sucesso.');
    });

    it('should not register without name', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'noname@example.com',
                password: 'Abcdef1!'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Por favor, forneça todos os campos.');
    });

    it('should not register without email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'No Email',
                password: 'Abcdef1!'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Por favor, forneça todos os campos.');
    });

    it('should not register without password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'No Password',
                email: 'nopassword@example.com'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Por favor, forneça todos os campos.');
    });

    it('should not login with non-existent user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'notfound@example.com',
                password: 'Abcdef1!'
            });
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('error', 'Usuário não encontrado.');
    });

    it('should not login with invalid email format', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'invalidemail',
                password: 'Abcdef1!'
            });
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('error', 'Usuário não encontrado.');
    });

    it('should not login without password', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'NoPassLogin',
                email: 'nopasslogin@example.com',
                password: 'Abcdef1!'
            });
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nopasslogin@example.com'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Por favor, forneça e-mail e senha.');
    });
});