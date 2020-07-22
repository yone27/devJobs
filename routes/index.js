const express = require('express')
const router = express.Router()
const homeController = require('../controllers/homeController')
const vacantesController = require('../controllers/vacantesController')
const usuariosController = require('../controllers/usuariosController')
const authController = require('../controllers/authController')
const { body } = require('express-validator')

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos)

    //Crear vacantes
    router.get(
        '/vacantes/nueva',
        authController.isAuthenticated,
        vacantesController.formularioNuevaVacante
    )
    router.post(
        '/vacantes/nueva',
        authController.isAuthenticated,
        vacantesController.validarVacante,
        vacantesController.agregarVacante
    )

    //Mostrar Vacante (singular)
    router.get('/vacantes/:url', vacantesController.mostrarVacante)

    //Editar vacante
    router.get(
        '/vacantes/editar/:url',
        authController.isAuthenticated,
        vacantesController.formEditarVacante
    )
    router.post(
        '/vacantes/editar/:url',
        authController.isAuthenticated,
        vacantesController.validarVacante,
        vacantesController.editarVacante
    )

    //Eliminar vacante
    router.delete(
        '/vacantes/eliminar/:id',
        authController.isAuthenticated,
        vacantesController.eliminarVacante
    )

    // Crear cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta)
    router.post('/crear-cuenta', [
        // sanitizar los elementos
        body(['nombre', 'email', 'password']).escape().trim(),

        // Validar elementos
        body('nombre', 'El nombre es obligatorio').not().notEmpty(),
        body('email', 'Email no valido').isEmail().normalizeEmail(),
        body('password', 'Contraseña obligatoria').not().notEmpty(),
        body('confirmar', 'Passwords do not match').custom((value, { req }) => (value === req.body.password))
    ], usuariosController.crearUsuario)

    // Autenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion)
    router.post('/iniciar-sesion', authController.autenticarUsuario)

    //Resetear password (emails)
    router.get('/reestablecer-password', authController.formReestablecerPassword)
    router.post('/reestablecer-password', authController.enviarToken)

    //Resetear password (almacenar en la db)
    router.get('/reestablecer-password/:token', authController.reestablecerPassword)
    router.post('/reestablecer-password/:token', authController.guardarPassword)
        //cerrar sesión
    router.get('/cerrar-sesion',
        authController.isAuthenticated,
        authController.cerrarSesion
    )

    // Panel de administracion
    router.get(
        '/administracion',
        authController.isAuthenticated,
        authController.mostrarPanel
    )

    //Editar perfil
    router.get(
        '/editar-perfil',
        authController.isAuthenticated,
        usuariosController.formEditarPerfil
    )

    router.post(
        '/editar-perfil',
        authController.isAuthenticated,
        // usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    )

    //recibir mensajes de candidatos
    router.post('/vacantes/:url',
        //authController.isAuthenticated,
        vacantesController.subirCV,
        vacantesController.contactar
    )

    // Muestra los candidatos por vacante
    router.get('/candidatos/:id',
        authController.isAuthenticated,
        vacantesController.mostrarCandidatos
    )

    //Buscador de vacantes
    router.post('/buscador', vacantesController.buscarVacantes)

    return router
}