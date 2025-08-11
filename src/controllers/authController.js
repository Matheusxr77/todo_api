const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function isStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.register = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send({ error: 'Por favor, forneça todos os campos.' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).send({ error: 'E-mail inválido.' });
    }

    if (!isStrongPassword(password)) {
        return res.status(400).send({ error: 'A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.run(sql, [name, email, hashedPassword], function (err) {
        if (err) {
            return res.status(400).send({ error: 'E-mail já cadastrado.' });
        }
        res.status(201).send({ id: this.lastID, name, email });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ error: 'Por favor, forneça e-mail e senha.' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, user) => {
        if (err || !user) {
            return res.status(404).send({ error: 'Usuário não encontrado.' });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ error: 'Senha inválida.' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: 86400
        });

        res.status(200).send({ auth: true, token });
    });
};

exports.logout = (req, res) => {
    res.status(200).send({ message: 'Logout realizado com sucesso.' });
};