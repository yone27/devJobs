const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async(email, password, done) => {
    const usuario = await Usuarios.findOne({ email })

    //sino encuentra el user
    if (!usuario) return done(null, false, {
        message: 'Este usuario no existe'
    })

    // el usuario existe, vamos a verificarlo
    const verificarPass = usuario.compararPassword(password)
    if (!verificarPass) return done(null, false, {
        message: 'Password incorrecto'
    })

    // Usuario existe y el password es correcto
    return done(null, usuario)
}))

passport.serializeUser((usuario, done) => done(null, usuario._id))
passport.deserializeUser(async(id, done) => {
    const usuario = await Usuarios.findById(id).exec()
    return done(null, usuario)
})

module.exports = passport