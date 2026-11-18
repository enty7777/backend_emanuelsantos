async function login(req, res) {

    const usuario =
        (req.body.usuario ?? '').trim();

    const senha =
        req.body.senha ?? '';

    const resultado =
        await service.login(usuario, senha);

    if (resultado.invalido === true) {

        return res.status(401).json({
            erro: 'Usuario ou senha invalidos.'
        });
    }

    const token =
        sessoes.criar(resultado.usuario.id);

    res.cookie(
        'sid',
        token,
        {
            httpOnly: true
        }
    );

    res.status(200).json(
        resultado.usuario
    );
}