module.exports = middleware => {
    return (req, res, next) => {
        req.user.admin ? middleware(req, res, next) : res.status(402).send('Usuário não é administrador')
    }
}