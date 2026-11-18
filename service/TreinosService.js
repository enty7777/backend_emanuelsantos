function validarTreino(corpo) {
    if (
        typeof corpo.nome !== 'string' ||
        corpo.nome.trim() === ''
    ) {
        return 'O campo nome e obrigatorio e deve ser um texto.';
    }

    if (
        typeof corpo.duracao !== 'number' ||
        corpo.duracao <= 0
    ) {
        return 'O campo duracao e obrigatorio e deve ser um numero maior que zero.';
    }

    if (corpo.duracao > 180) {
        return 'A duracao nao pode ser maior que 180 minutos.';
    }

    return null;
}