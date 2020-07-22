const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true); // para quitar un warnings
require('dotenv').config({
    path: 'variables.env'
})
mongoose.set('useFindAndModify', false); // Quitamos los warnings de findOneAndUpdate / delete
mongoose.connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(db => console.log("db is connect"))
    .catch(err => console.error(err))

mongoose.connection.on('error', error => {
    console.log(error);
})

// Importar los modelos
require('../models/Vacantes')
require('../models/Usuarios')