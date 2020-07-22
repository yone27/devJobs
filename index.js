const mongoose = require('mongoose')
require('./config/db')
const session = require('express-session')
const express = require('express')
const MongoStore = require('connect-mongo')(session)
const path = require('path')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const Handlebars = require("handlebars");
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");
const app = express()
const router = require('./routes')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const passport = require('./config/passport')
const createError = require('http-errors')

require('dotenv').config({
    path: 'variables.env'
})

// Settings
app.set('port', process.env.PORT || 5000)
app.engine('.hbs',
    exphbs({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars'),
        extname: ".hbs",
        handlebars: allowInsecurePrototypeAccess(Handlebars)
    })
)
app.set('view engine', '.hbs')

//Middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash())
app.use(cookieParser())
app.use(session({
    secret: process.env.SECRETO,
    saveUninitialized: false,
    resave: true,
    key: process.env.KEY,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}))
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    res.locals.mensajes = req.flash()
    next()
})

//Routes
app.use(router())

//404 pagina no existente
// app.use((req, res, next) => {
//     next(createError(404, 'No encontrado'))
// })

//handlers errors
// app.use((error, req, res) => {
//     res.locals.mensaje = error.message
//     const status = error.status || 500
//     res.locals.status = status
//     res.status(status)
//     res.render('error')
// })

// Server start :D
app.listen(app.get('port'), () => {
    console.log('Server on port ', app.get('port'));
})