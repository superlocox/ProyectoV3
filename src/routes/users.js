const router = require('express').Router();
const passport = require('passport');
const Cart = require("../models/Carrito");
const Pedido = require('../models/Pedido');
const asyncs = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
// Models
const User = require('../models/User');
//const pw = process.env.GMAILPW;
const pw = '!david123';

//para app movil
const jwt = require('jsonwebtoken')
const config = require('../config')

router.post('/singup_api', async(req, res)=>{

  try{
    const { name, apellido, celular ,email, password, confirm_password} = req.body;

    const emailUser = await User.findOne({email: email});
    if(emailUser){
      return res.status(401).send({auth:false, token:null});
    }
    else{

      mensajero = false;
      admin = false;

      const user = new User({name, apellido, celular, email, password, admin,mensajero});
    

    user.password = await user.encryptPassword(password);
    await user.save();

    const token = jwt.sign({id: user.id},config.secreto,{
      expiresIn: '24h'
    });
    res.status(200).json({auth:true, token});

    }

  } catch (e){
    console.log(e)
    res.status(500).send('There was a problem signup');
  }

})

router.post('/sigin_api', async(req,res)=>{
  try{
    const user = await User.findOne({email: req.body.email})
    if(!user){
      return res.status(400).send('Email no existe')
    }
    const validPaswword = await (req.body.password, user.password)
    if(!validPaswword){
      return res.status(401).send({auth:false, token:null});
    }
    const token= jwt.sign({ id:user.id},config.secreto,{
      expiresIn: '24h'
    });
    res.status(200).json({auth:true,token});


  } catch(e){
    console.log(e)
    res.status(500).send('There was a problem signin');
  }
})

router.get('/logout_api',function(req,res){
  res.status(200).send({auth:false,token:null});
})


router.get('/users/singup_api', async (req,res)=>{
  const users = await User.find();
  res.json({users});
}) 

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

      const token = jwt.sign({id: newUser.id},config.secreto,{
        expiresIn: '24h'
      });
     

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
      res.redirect('/users/singup_administrador');
    } else {
      // Saving a New User
      
      const newUser = new User({name, apellido, celular, email, password, jerarquia, admin, mensajero});
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();

      const token = jwt.sign({id: newUser.id},config.secreto,{
        expiresIn: '24h'
      });
      res.status(200).json({auth:true, token});


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





router.get('/users/confirm_email',  (req, res) => {
  res.render('users/confirm_email');
});

router.post('/users/confirm_email', async(req, res) => {
  asyncs.waterfall([
    function (done) {
      crypto.randomBytes(20,function (err,buf) {
        var token = buf.toString('hex');
        done(err,token);
        
      });
      
    },
    function (token,done) {
      User.findOne({email: req.body.email},function (err,user) {
        if(!user){
          req.flash('error','No existe una cuenta con este email');
          return res.redirect('/users/confirm_email');

        }
        user.resetpwToken = token;
        user.resetpwExpires= Date.now()+ 3600000; //Una hora

        user.save(function (err) {
          done(err,token,user);
          
        });
        
      });
      
    },
    function (token,user,done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth:{
          user:'megalaxusd@gmail.com',
          pass: pw
        }
      });
      var mailoptions={
        to: user.email,
        from: 'megalaxusd@gmail.com',
        subject: 'Restablecer la contraseña',
        text: 'Estás recibiendo este correo debido a que tú (o alguien más) solicitó resetear la contraseña'+ '\n'+ 'Favor de dar clic o copiar el siguiente para completar este proceso'+'\n'+ 'http://'+ req.headers.host + '/users/resetpw/' + token + '\n\n'+'Si usted no solicitó este proceso, favor de ignorar el mensaje y su contraseña seguirá igual'
      };

      smtpTransport.sendMail(mailoptions, function(err) {

        console.log('mail sent');
      
        req.flash('success_msg', 'El correo fue enviado a '+ user.email+ ' con instrucciones para completar este proceso');
        done(err, 'done');

        
      });
      
    }
    
  ],function(err) {
    if(err) return next(err);


    res.redirect('/users/confirm_email');
    
  })
});

router.get('/users/resetpw/:token', function(req, res) {
  User.findOne({ resetpwToken: req.params.token, resetpwExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/confirm_email');
    }
    res.render('users/resetpw', {token: req.params.token});
  });
});




router.post('/users/resetpw/:token', async(req, res) =>{
  asyncs.waterfall([
    function(done) {
      User.findOne({ resetpwToken: req.params.token, resetpwExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'El token es invalido o expiro.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetpwToken = undefined;
            user.resetpwExpires = undefined;

            user.save();
            done(err,user);
          })
        } else {
            req.flash("error", "Contraseña no coincide.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'megalaxusd@gmail.com',
          pass: pw
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'megalaxusd@gmail.com',
        subject: 'Tu contraseña ha sido cambiado',
        text: 'Hola,\n\n' +
          'Esto es una confirmación de que la contraseña de ' + user.email + ' ha sido cambiado.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('contraseña cambiada');

        req.flash('success_msg', 'Listo! Tu contraseña ha sido cambiada.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/users/signin');
  });
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