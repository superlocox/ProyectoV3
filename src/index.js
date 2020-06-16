const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const multer = require('multer');
const uuid = require('uuid');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

const keyPublishable = process.env.STRIPE_PUBLIC_KEY;
const keySecret = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(keySecret);


// const mongoClient = require('mongodb').MongoClient

// const url = "mongodb://localhost:27017"

// mongoClient.connect(url, (err, db) => {

//   if (err) {
//       console.log("Error while connecting mongo client")
//   } else {

//       const myDb = db.db('node-notes-db')
//      // const myDb = db.db('myDb')
//       const collection = myDb.collection('users')
//       //const collection = myDb.collection('myTable')

//       app.post('/signup', (req, res) => {

//           const newUser = {
//               name: req.body.name,
//               email: req.body.email,
//               password: req.body.password
//           }

//           const query = { email: newUser.email }
 
//           collection.findOne(query, (err, result) => {

//               if (result == null) {
//                   collection.insertOne(newUser, (err, result) => {
//                       res.status(200).send()
//                   })
//               } else {
//                   res.status(400).send()
//               }

//           })

//       })

//       app.post('/login', (req, res) => {

//           const query = {
//               email: req.body.email, 
//               password: req.body.password
//           }

//           collection.findOne(query, (err, result) => {

//               if (result != null) {

//                   const objToSend = {
//                       name: result.name,
//                       email: result.email
//                   }

//                   res.status(200).send(JSON.stringify(objToSend))

//               } else {
//                   res.status(404).send()
//               }

//           })

//       })

//   }

// })


// Inicializacion
const app = express();
require('./database');
require('./config/passport');




// Configuraciones
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
const hbs = exphbs.create({

  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  // Specify helpers which are only registered on this instance.
  helpers: {
    if_equal: function(a, b, options) {
          if (a == b) {
              return options.fn(this)
          } else {
              return options.inverse(this)
          }
      }

  }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');




// middlewares
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,

  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie:{maxAge:180*60*1000}


}));

app.use(express.json())


const storage = multer.diskStorage({
  destination: path.join(__dirname,'public/img/upload'),
  filename:(req,file,cb,filename)=>{
    cb(null,uuid() + path.extname(file.originalname));
  }
});
app.use(multer({storage: storage}).single('image'));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// Variables globales
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.session = req.session;
  next();
});

// Rutas
app.use(require('./routes'));
app.use(require('./routes/users'));
app.use(require('./routes/notes'));
app.use(require('./routes/productos'));



// Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// Servidor escuchando
app.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});


module.exports = app;