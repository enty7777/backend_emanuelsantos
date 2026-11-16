
const express = require('express');
const { DatabaseSync } = require('node:sqlite');

const app = express();
app.use(express.json());

// ------------------------------------------------------------
// BANCO DE DADOS SQLITE
// ------------------------------------------------------------

const db = new DatabaseSync('treinos.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS treinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        duracao INTEGER NOT NULL
    )
`);

// ------------------------------------------------------------
// VALIDAÇÃO
// ------------------------------------------------------------

function validarTreino(corpo) {
    if (typeof corpo.nome !== 'string' || corpo.nome.trim() === '') {
        return 'O campo nome e obrigatorio e deve ser um texto.';
    }

    if (typeof corpo.duracao !== 'number' || corpo.duracao <= 0) {
        return 'O campo duracao e obrigatorio e deve ser um numero maior que zero.';
    }

    return null;
}

// ------------------------------------------------------------
// EXERCÍCIO 1 - GET /treinos/total
// Conta quantos treinos existem
// ------------------------------------------------------------

app.get('/treinos/total', (req, res) => {
    const resultado = db.prepare(`
        SELECT COUNT(*) AS total
        FROM treinos
    `).get();

    res.status(200).json(resultado);
});

// ------------------------------------------------------------
// EXERCÍCIO 5 - GET /treinos/resumo
// Mostra total, minutos e média
// ------------------------------------------------------------

app.get('/treinos/resumo', (req, res) => {
    const resultado = db.prepare(`
        SELECT
            COUNT(*) AS total,
            COALESCE(SUM(duracao), 0) AS minutos,
            COALESCE(AVG(duracao), 0) AS media
        FROM treinos
    `).get();

    res.status(200).json(resultado);
});

// ------------------------------------------------------------
// GET /treinos
// Lista, filtra, busca e ordena os treinos
// Exercícios 2, 3 e 4
// ------------------------------------------------------------

app.get('/treinos', (req, res) => {
    const minimo = req.query.minimo;
    const busca = req.query.busca;

    let sql = 'SELECT * FROM treinos';
    const condicoes = [];
    const valores = [];

    if (minimo !== undefined) {
        const duracaoMinima = Number(minimo);

        if (!Number.isFinite(duracaoMinima)) {
            return res.status(400).json({
                erro: 'O minimo deve ser um numero valido.'
            });
        }

        condicoes.push('duracao >= ?');
        valores.push(duracaoMinima);
    }

    if (busca !== undefined) {
        condicoes.push('nome LIKE ?');
        valores.push(`%${busca}%`);
    }

    if (condicoes.length > 0) {
        sql += ' WHERE ' + condicoes.join(' AND ');
    }

    sql += ' ORDER BY duracao DESC';

    const treinos = db.prepare(sql).all(...valores);

    res.status(200).json(treinos);
});

// ------------------------------------------------------------
// GET /treinos/:id
// Busca um treino pelo ID
// Exercício 6 - ID inválido retorna 400
// ------------------------------------------------------------

app.get('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            erro: 'ID deve ser um numero inteiro.'
        });
    }

    const treino = db.prepare(`
        SELECT * FROM treinos
        WHERE id = ?
    `).get(id);

    if (treino === undefined) {
        return res.status(404).json({
            erro: 'Treino nao encontrado.'
        });
    }

    res.status(200).json(treino);
});

// ------------------------------------------------------------
// POST /treinos
// Cria um novo treino
// ------------------------------------------------------------

app.post('/treinos', (req, res) => {
    const erro = validarTreino(req.body);

    if (erro !== null) {
        return res.status(400).json({
            erro: erro
        });
    }

    const resultado = db.prepare(`
        INSERT INTO treinos (nome, duracao)
        VALUES (?, ?)
    `).run(req.body.nome, req.body.duracao);

    const novo = db.prepare(`
        SELECT * FROM treinos
        WHERE id = ?
    `).get(resultado.lastInsertRowid);

    res.status(201).json(novo);
});

// ------------------------------------------------------------
// PUT /treinos/:id
// Atualiza um treino existente
// ------------------------------------------------------------

app.put('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            erro: 'ID deve ser um numero inteiro.'
        });
    }

    const treino = db.prepare(`
        SELECT * FROM treinos
        WHERE id = ?
    `).get(id);

    if (treino === undefined) {
        return res.status(404).json({
            erro: 'Treino nao encontrado.'
        });
    }

    const erro = validarTreino(req.body);

    if (erro !== null) {
        return res.status(400).json({
            erro: erro
        });
    }

    db.prepare(`
        UPDATE treinos
        SET nome = ?, duracao = ?
        WHERE id = ?
    `).run(req.body.nome, req.body.duracao, id);

    const atualizado = db.prepare(`
        SELECT * FROM treinos
        WHERE id = ?
    `).get(id);

    res.status(200).json(atualizado);
});

// ------------------------------------------------------------
// DELETE /treinos/:id
// Remove um treino
// ------------------------------------------------------------

app.delete('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            erro: 'ID deve ser um numero inteiro.'
        });
    }

    const treino = db.prepare(`
        SELECT * FROM treinos
        WHERE id = ?
    `).get(id);

    if (treino === undefined) {
        return res.status(404).json({
            erro: 'Treino nao encontrado.'
        });
    }

    db.prepare(`
        DELETE FROM treinos
        WHERE id = ?
    `).run(id);

    res.status(204).end();
});

// ------------------------------------------------------------
// SERVIDOR
// ------------------------------------------------------------

const PORTA = 3000;

app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
