const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')

exports.mostrarTrabajos = async(req, res, next) => {
    const vacantes = await Vacante.find()
    if (!vacantes) return next()
    res.render('home', {
        nombrePagina: 'DevJobs',
        tagLine: 'Encuentra y pública trabajos para desarrollo web',
        barra: true,
        boton: true,
        vacantes
    })
}