const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validator

    const encryptPassword = password => {

        const salt = bcrypt.genSaltSync(10)

        return bcrypt.hashSync(password, salt)
    }

    const save = async(req, res) => {

        const user = {...req.body }

        if (req.params.id) {
            user.id = req.params.id
        }

        try {
            existsOrError(user.name, 'Nome não informado')
            existsOrError(user.email, 'E-mail não informado')
            existsOrError(user.password, 'Senha não informada')
            existsOrError(user.confirmPassword, 'Confirmação de Senha inválida')
            equalsOrError(user.password, user.confirmPassword, 'Senhas não conferem')

            const disponibilidadeEmail = await app.db('users').where({ email: user.email }).first()

            if (!user.id) { //Se user.id não existe, a intenção é salvar o usuário
                notExistsOrError(disponibilidadeEmail, 'Email já cadastrado no sistema')
            }
        } catch (msg) {
            return res.status(400).send(msg)
        }


        user.password = encryptPassword(user.password)
        delete user.confirmPassword

        if (user.id) {
            app.db('users')
                .update(user)
                .where({ id: user.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            console.log(user)
            app.db('users')
                .insert(user)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }

    }

    const get = (req, res) => {

        app.db('users')
            .select('id', 'name')
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {

        console.log(req.params)

        app.db('users')
            .select('id', 'name')
            .where({ id: req.params.id })
            .then(user => res.json(user))
            .catch(err => res.status(500).send(err))
    }

    return { save, get, getById }
}