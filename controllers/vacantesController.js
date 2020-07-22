const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')
const { body, validationResult } = require('express-validator')
const multer = require('multer')
const shortid = require('shortid')

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagLine: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}
exports.agregarVacante = async(req, res) => {
    console.log(req.body);

    const vacante = new Vacante(req.body)

    //usuario autor de la vacante
    vacante.autor = req.user._id

    // crear arreglo de habilidades o skills
    vacante.skills = req.body.skills.split(',')

    // save db
    const nuevaVacante = await vacante.save()

    res.redirect(`/vacantes/${nuevaVacante.url}`)
}
exports.mostrarVacante = async(req, res, next) => {
    //relacionamos una tabla
    const vacante = await await Vacante.findOne({ url: req.params.url }).populate('autor')
    if (!vacante) return next()

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    })
}
exports.formEditarVacante = async(req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url })

    if (!vacante) return next()

    res.render('editarVacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}
exports.editarVacante = async(req, res, next) => {
    const vacanteActualizada = req.body

    // convertimos las skills en un array
    vacanteActualizada.skills = req.body.skills.split(',')

    const vacante = await Vacante.findOneAndUpdate({ url: req.params.url }, vacanteActualizada, {
        new: true,
        runValidators: true
    })

    res.redirect(`/vacantes/${vacante.url}`)
}

// validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = [
    body(['titulo', 'empresa', 'ubicacion', 'salario', 'contrato', 'skills']).escape().trim(),

    // Validar elementos
    body('titulo', 'El titulo es obligatorio').notEmpty(),
    body('empresa', 'La empresa es obligatorio').notEmpty(),
    body('ubicacion', 'La ubicación es obligatorio').notEmpty(),
    body('contrato', 'El contrato es obligatorio').notEmpty(),
    body('descripcion', 'El descripción es obligatorio').notEmpty(),
    body('skills', 'El skills es obligatorio').notEmpty(),

    function(req, res, next) {
        const errors = validationResult(req)

        // si hay errores de validación
        if (!errors.isEmpty()) {
            req.flash('error', errors.errors.map(error => error.msg))
            res.render('nueva-vacante', {
                nombrePagina: 'Nueva vacante',
                tagLine: 'Llena el formulario y publica tu vacante',
                mensajes: req.flash(),
                nombre: req.user.nombre
            })
            return
        }

        next()
    }
];

exports.eliminarVacante = async(req, res) => {
    const { id } = req.params

    const vacante = await Vacante.findById(id)

    if (verificarAutor(vacante, req.user)) {
        // todo bien
        await vacante.remove()
        res.status(200).send('Vacante eliminada correctamente')
    } else {
        // no permitido
        res.status(403).send('Error')
    }

}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if (!vacante.autor.equals(usuario._id)) {
        return false
    }
    return true
}

// subir cv
exports.subirCV = (req, res, next) => {
    upload(req, res, function(error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande max 1mb')
                } else {
                    req.flash('error', error.message)
                }
            } else {
                req.flash('error', error.message)
            }

            res.redirect('back')
            return
        } else {
            return next()
        }
    })
}

//config multer
const configuracionMulter = {
    limits: { fileSize: 1000000 },
    //dest: path.join(__dirname, '../public/upload/temp'),
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '/../public/uploads/cv')
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1]
            cb(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            // el cb se ejecuta como true cuando se acepta la img
            cb(null, true)
        } else {
            cb(new Error('Formato no válido'), false)
        }
    }
}
const upload = multer(configuracionMulter).single('cv')

//almacenar los candidatos en la db
exports.contactar = async(req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url })

    //sino existe
    if (!vacante) return next()

    //todo bien construir nuevo objeto
    if (req.file) {
        const nuevoCandidato = {
            nombre: req.body.nombre,
            email: req.body.email,
            cv: req.file.filename,
        }

        //almacenar la vacante
        vacante.candidatos.push(nuevoCandidato)

        await vacante.save()

        // mensaje flash y redirect
        req.flash('correcto', 'Se envio tu curriculum correctamente')
        res.redirect('/')
    }
}

exports.mostrarCandidatos = async(req, res, next) => {
    const vacante = await Vacante.findById(req.params.id)

    if (vacante.autor != req.user._id.toString()) {
        return next()
    }
    if (!vacante) return next()

    res.render('candidatos', {
        nombrePagina: `Candidatos vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}

//Buscando vacantes
exports.buscarVacantes = async(req, res, next) => {
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    })

    //mostrar las vacantes
    res.render('home', {
        nombrePagina: `Resultados para la búsqueda ${req.body.q}`,
        barra: true,
        vacantes
    })

    console.log(vacante);

}