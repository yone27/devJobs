const emailConfig = require('../config/email')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')
const util = require('util')

let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailConfig.user,
        pass: emailConfig.password
    }
})

var options = {
    viewEngine: {
        extname: '.hbs',
        layoutsDir: path.join(__dirname, '/../views/emails'),
        defaultLayout: 'main',
    },
    extName: '.hbs',
    viewPath: path.join(__dirname, '/../views/emails')
};

//utilizar templates de hbs
transport.use('compile', hbs(options))

exports.enviar = async(opciones) => {
    const opcionesEmail = {
        from: 'devJobs',
        to: opciones.usuario.email,
        subject: opciones.subject,
        template: opciones.archivo,
        // Todo lo que se pase aqui se utilizara dentro del template del email
        context: {
            resetUrl: opciones.resetUrl
        }
    }

    const sendMail = util.promisify(transport.sendMail, transport)
    return sendMail.call(transport, opcionesEmail)
}