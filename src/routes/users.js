const router = require('express').Router();
const passport = require('passport');
const Cart = require("../models/Carrito");
const Pedido = require('../models/Pedido');
// Models
const User = require('../models/User');

router.get('/users/signup', (req, res) => {
  res.render('users/signup');
});

router.get('/users/singup_administrador', (req, res) => {
  res.render('users/singup_administrador');
});

router.post('/users/signup', async (req, res) => {
  let errors = [];
  const { name, apellido, celular ,email, password, confirm_password,jer } = req.body;
  if(name.length <=0){
    errors.push({text: 'Por favor ingrese un nombre.'});
  }
  if(apellido.length <=0){
    errors.push({text: 'Por favor ingrese un apellido.'});
  }
  if(celular.length != 10){
    errors.push({text: 'Número Celular no válido.'});
  }
  if(email.length <= 0){
    errors.push({text: 'Email vacío.'});
  }
  if(password != confirm_password) {
    errors.push({text: 'Las contraseñas no coinciden.'});
  }
  if(password.length < 8) {
    errors.push({text: 'La contraseña debe tener mas de 7 caracteres.'})
  }
  if(errors.length > 0){
    res.render('users/signup', {errors, name, apellido, celular, email, password, confirm_password});
  } else {
    // Look for email coincidence
    const emailUser = await User.findOne({email: email});
    if(emailUser) {
      req.flash('error_msg', 'Este email esta en uso.');
      res.redirect('/users/signup');
    } else {
      // Saving a New User
      mensajero = false;
      admin = false;
      const newUser = new User({name, apellido, celular, email, password, admin,mensajero});
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();
      req.flash('success_msg', 'Estas registrado.');
      res.redirect('/users/signin');
    }
  }
});


router.post('/users/singup_administrador', async (req, res) => {
  let errors = [];
  var admin=false;
  var mensajero=false;
  const { name, apellido, celular ,email, password, confirm_password , jerarquia } = req.body;
  if(name.length <=0){
    errors.push({text: 'Por favor ingrese un nombre.'});
  }
  if(apellido.length <=0){
    errors.push({text: 'Por favor ingrese un apellido.'});
  }
  if(celular.length != 10){
    errors.push({text: 'Número Celular no válido.'});
  }
  if(password != confirm_password) {
    errors.push({text: 'Las contraseñas no coinciden.'});
  }
  if(password.length < 8) {
    errors.push({text: 'La contraseña debe tener mas de 7 caracteres.'})
  }
  if(errors.length > 0){
    res.render('users/singup_administrador', {errors, name, apellido, celular, email, password, confirm_password, jerarquia});
  } else {
    // Look for email coincidence
    if(jerarquia=='Administrador'){
      admin=true;
      mensajero=true;

    }else{
      mensajero=true;
    }
    const emailUser = await User.findOne({email: email});
    if(emailUser) {
      req.flash('error_msg', 'Este email esta en uso.');
      res.redirect('/users/signup');
    } else {
      // Saving a New User
      
      const newUser = new User({name, apellido, celular, email, password, jerarquia, admin, mensajero});
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();
      req.flash('success_msg', 'Estas registrado.');
      res.redirect('/notes');
    }
  }
});

router.get('/users/signin', (req, res) => {
  res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local', {
  
  
  failureRedirect: '/users/signin',
  failureFlash: 'Ingrese bien sus credenciales'
}), function(req,res,next){
    if( req.session.oldUrl){
      var oldUrl=req.session.oldUrl;
      req.session.oldUrl=null;
      res.redirect(oldUrl);
    } else{
      res.redirect('/notes')
    }
});



router.get('/users/mis_pedidos', isLogIn, function (req,res,next) {
 
  
  Pedido.find({user: req.user}, function(err,pedidos) {
    if(err){
      return res.write('Error!'); 
    }
    var cart;
    pedidos.forEach(function(pedido) {
      cart= new Cart(pedido.cart);
      pedido.items = cart.generateArray();
      
    });

    res.render('users/mis_pedidos' , {pedidos: pedidos});
    
  });

  
});





router.get('/users/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Estás desconectado ahora.');
  res.redirect('/users/signin');
});

router.get('/maps/localizacion', (req, res) => {
  res.render('maps/localizacion');
});

router.get('/dispositivo/funciones', (req, res) => {
  res.render('dispositivo/funciones');
});

router.get('/dispositivo/pedidos', async(req, res) =>{
/*
  const pedidos_activos = [
    nombres={},
    pedidos={}
  ];

  const users = await User.find();
  const pedidos = await Pedido.find();
  for(i=0;i<user.length;i++){
    for(j=0;j<pedidos.length;j++){
      if(user.id==pedidos.user){
        pedidos_activos[i].nombres=user.name[i];

        pedidos_activos[i].pedidos=pedidos[j];

      }
    

    
    }
    

    
  }
*/
const users = await User.find();
const pedidos = await Pedido.find();

    res.render('dispositivo/pedidos',{users,pedidos});


 
});




module.exports = router;


function isLogIn(req, res, next){
  if(req.isAuthenticated()){
      return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/users/signin');
}

function initMap(){

  var output = document.getElementById('map');


    if(navigator.geolocation){
        console.log("Tu navegador soporta geolocalizacion");
    }

  

  

    navigator.geolocation.getCurrentPosition(localizar,error);



}

function localizar(posicion){
  var latitude = posicion.coords.latitude;
  var longitude = posicion.coords.longitude;

  //var imgURL="https://maps.googleapis.com/maps/api/staticmap?center="+latitude+","+longitude+"&size=600x300&markers=color:red%7C"+latitude+","+longitude+"&key=AIzaSyChSPm7qthyY7znh5vF28ix2tDSC2iYvYo";

  output.innerHTML = "<p>latitud: "+latitude+"<br>Longitud: "+longitude+"</p>";
  //output.innerHTML ="<img src='"+imgURL+"'>";


}

function error(){
  console.log("No se pudo obtener la ubicacion");
}