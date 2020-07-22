const passport = require('passport')
const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')
const Usuarios = mongoose.model('Usuarios')
const crypto = require('crypto')
const enviarEmail = require('../handler/email')

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
})

//revisar si el usuario esta autenticado o no
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }

    return res.redirect('/iniciar-sesion')
}

exports.mostrarPanel = async(req, res) => {
    // vacantes del usuario
    const vacantes = await Vacante.find({ autor: req.user._id })

    res.render('administracion', {
        nombrePagina: 'Panel de administracion',
        tagLine: 'Crea y administra tus vacantes desde aqui',
        vacantes,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

exports.cerrarSesion = (req, res) => {
    req.logout()
    req.flash('correcto', 'Cerraste sesion correctamente')
    return res.redirect('/iniciar-sesion')
}

// form para reiniciar el password
exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Reestablece tu password',
        tagLine: 'Si ya tienes una cuenta pero olvidaste tu password coloca tu email'
    })
}

//genera el token en la tbl user
exports.enviarToken = async(req, res, next) => {
    const usuario = await Usuarios.findOne({ email: req.body.email })

    if (!usuario) {
        req.flash('error', 'No existe esa cuenta')
        return res.redirect('/iniciar-sesion')
    }

    // el usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex')
    usuario.expira = Date.now() + 3600000 //1h

    // guardar usuario
    await usuario.save()
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`

    //  notificacion por email

    //Todo correcto
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    })

    req.flash('correcto', 'Se envio un correo a tu cuenta')
    res.redirect('/iniciar-sesion')
}


//valida si el usuario es valido y el token 
exports.reestablecerPassword = async(req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    })

    if (!usuario) {
        req.flash('error', 'El formulario ya no es valido intente de nuevo')
        return res.redirect('/reestablecer-password')
    }

    // todo bien, mostrar el formulario
    res.render('nuevo-password', {
        nombrePagina: 'Nuevo password'
    })
}

// almacea el nuevo password en la db
exports.guardarPassword = async(req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    })

    if (!usuario) {
        req.flash('error', 'El formulario ya no es valido intente de nuevo')
        return res.redirect('/reestablecer-password')
    }

    //guardamos y limpiamos tokes
    usuario.password = req.body.password
    usuario.token = undefined
    usuario.expira = undefined
    await usuario.save()

    // todo bien, mostrar el formulario
    req.flash('correcto', 'Modificado correctamente')
    res.redirect('/iniciar-sesion')
}