module.exports = (req, res, next) => {
    const { description, priority, status } = req.body;

    if (req.method === 'POST') {
        if (!description || !priority) {
            return res.status(400).send({ error: 'Descrição e prioridade são obrigatórias.' });
        }
    }

    if (priority && !['Alta', 'Média', 'Baixa'].includes(priority)) {
        return res.status(400).send({ error: 'Prioridade inválida.' });
    }

    if (status && !['pendente', 'concluida'].includes(status)) {
        return res.status(400).send({ error: 'Status inválido.' });
    }

    next();
};