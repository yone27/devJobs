const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')
const { body, validationResult } = require('express-validator')
const multer = require('multer')
const shortid = require('shortid')

exports.subirImagen = (req, res, next) => {
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

            res.redirect('/administracion')
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
            cb(null, __dirname + '/../public/uploads/perfiles')
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1]
            cb(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            // el cb se ejecuta como true cuando se acepta la img
            cb(null, true)
        } else {
            cb(new Error('Formato no válido'), false)
        }
    }
}
const upload = multer(configuracionMulter).single('imagen')

exports.formCrearCuenta = (req, res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crea tu cuenta en devJobs',
        tagLine: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    })
}
exports.crearUsuario = async(req, res, next) => {
    const errors = validationResult(req)

    // si hay errores de validación
    if (!errors.isEmpty()) {
        req.flash('error', errors.errors.map(error => error.msg))
        res.render('crearCuenta', {
            nombrePagina: 'Crea tu cuenta en devJobs',
            tagLine: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
            mensajes: req.flash()
        })
        return
    } else {
        //crear el usuario
        const usuario = new Usuarios(req.body)

        try {
            await usuario.save()
            res.redirect('/iniciar-sesion')
        } catch (error) {
            req.flash('error', error)
            res.redirect('/crear-cuenta')
        }
    }
}

exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar sesion en devJobs'
    })
}

//form editar el perfil
exports.formEditarPerfil = (req, res) => {
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil en devJobs',
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

// guardar cambios editar perfil
exports.editarPerfil = async(req, res) => {
    const usuario = await Usuarios.findById(req.user._id)
    usuario.nombre = req.body.nombre
    usuario.email = req.body.email[0]

    if (req.body.password) {
        usuario.password = req.body.password
    }

    if (req.file) {
        usuario.imagen = req.file.filename
    }

    await usuario.save()

    req.flash('correcto', 'Cambios guardados correctamente')

    //redirect
    res.redirect('/administracion')
}

//sanitizar y validar form edit perfiles
exports.validarPerfil = [
    body(['nombre', 'email', 'password']).escape().trim(),

    // Validar elementos
    body('nombre', 'El nombre no puede ir vacio').notEmpty(),
    body('email', 'La email no puede ir vacio').notEmpty(),

    function(req, res, next) {
        const errors = validationResult(req)

        // si hay errores de validación
        if (!errors.isEmpty()) {
            req.flash('error', errors.errors.map(error => error.msg))
            res.render('editar-perfil', {
                nombrePagina: 'Edita tu perfil en devJobs',
                usuario: req.user,
                cerrarSesion: true,
                nombre: req.user.nombre,
                mensajes: req.flash(),
            })
            return
        }

        next()
    }
];