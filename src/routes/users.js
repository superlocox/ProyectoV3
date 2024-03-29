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

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY2);

//para app movil
const jwt = require('jsonwebtoken')
const config = require('../config');
const app = require('..');
const { route } = require('.');

router.get('/api/users', async (req, res)=>{
  const users = await User.find();
  res.json({users});

})

router.post('/api_cancelar', async (req, res)=>{
  try{

    
    const { id } = req.body;

    const pedido = await Pedido.findById(id);

    pedido.estado = "Cancelado";

    pedido.save();

    console.log('Se fue');
    return res.status(200);
  } catch (e) {
    console.log(e)
    res.status(500).send('Algo salio mal');
  }


});


router.get('/api/pedidos',async(req,res)=>{
  const pedidos = await Pedido.find();
  res.json({pedidos});
})


router.post('/api/pedidos_articulo', async(req,res)=>{

  const {email, pedido_id} = req.body;

  //const pedido = await Pedido.findById(pedido_id);

  const pedido = await Pedido.findById(pedido_id).populate('cart');

  //const pedido = await Pedido.findById(pedido_id).populate({path: 'cart', model: 'Cart', populate: { path: 'items', model :"productos"}});
  console.log('Los articulos son');

  //console.log(pedido);

  //console.log(pedido.cart.items);

  const cart = pedido.cart;

  //console.log(cart);

  res.json(cart);



})

router.post('/api/pedidos_cliente', async (req,res)=>{

  const { email} = req.body;

  const usuario = await User.findOne({ email: email });
  console.log(email);

  //const pedidox = new Pedido;

  const pedidox = await Pedido.find({ $and: [ {user: usuario}],  $or:[ {estado:"En cola"},{ estado: "En progreso"}] } );

  console.log('Los pedidox son:');

  // var p = pedidox.nombre_producto;

  // console.log(p.toString);

  //console.log(pedidox);

  // var precio = pedidox.precio;

  // precio.forEach((p)=>{
  //   console.log(`${p.precio}`);
  // })

  //console.log(pedidox.precio[0]);

//   var output = '';
//     for (var property in pedidox.precio) {
//     output += property + ' ';
// }
// console.log(output)

  //console.log(JSON.stringify(pedidox.productos));
  

  Pedido.find({ $and: [ {user: usuario}],  $or:[ {estado:"En cola"},{ estado: "En progreso"}] }, function (err, pedidos) {
    if (err) {
      return res.write('Error!');
    }
    // var cart;
    //console.log("los pedidos son");
    
   // console.log(pedidos);


    //pedidos.find({estado:"En cola", estado:"En progreso"});
    // pedidos.forEach(function (pedido) {
    //   // cart = new Cart(pedido.cart);
    //   // pedido.items = cart.generateArray();
    //   if(pedido.estado == 'En cola' || pedido.estado == 'En progreso'){


        
    //    //pedidox.save(pedido);
    //   }

    // });
    console.log("mis pedidos");
    //console.log(pedidos);

    res.json({pedidos});

  });
  


})

router.post('/elegir_api', async(req,res)=>{
  try{

    const{ _id , latmen, lngmen, email } = req.body;
    const pedido = await Pedido.findById(_id);

    console.log('Antes');
    console.log(pedido.estado);
    
    pedido.estado = "En progreso";

    console.log('Despues');
    console.log(pedido.estado);

    pedido.latmen = latmen;
    pedido.lngmen = lngmen;

    const usuario = await User.findOne({ email: email });

    pedido.id_mensajero = usuario._id;
    pedido.mensajero = usuario.name;

    pedido.save();

    

    console.log('Paso');

    return res.status(200).send('Se eligio');
    
    
  }catch (e) {
    console.log(e)
    res.status(500).send('Algo salio mal');
  }



})

router.post('/finalizar_api', async(req,res)=>{
  try{
    const {_id} = req.body;
    const pedido = await Pedido.findById(_id);
    console.log('Antes');
    console.log(pedido.estado);
    
    pedido.estado = "Completado";

    console.log('Despues');
    console.log(pedido.estado);
    pedido.save();
    res.status(200);
    
  }catch (e) {
    console.log(e)
    res.status(500).send('Algo salio mal');
  }



})

router.post('/mis_pedidos_api', async (req,res)=>{

  const { user} = req.body;

  const usuario = await User.findOne({ email: user });

  Pedido.find({ user: usuario }, function (err, pedidos) {
    if (err) {
      return res.write('Error!');
    }
    var cart;
    pedidos.forEach(function (pedido) {
      cart = new Cart(pedido.cart);
      pedido.items = cart.generateArray();

    });

    res.json({pedidos});

  });


})


router.post('/singup_api', async (req, res) => {

  try {
    const { name, apellido, celular, email, password, confirm_password } = req.body;

    const emailUser = await User.findOne({ email: email });
    if (emailUser) {
      return res.status(401).send({ auth: false, token: null });
    }
    else {

   


      mensajero = false;
      admin = false;
      verificado = true;
      email_token = crypto.randomBytes(64).toString('hex');
      const user = new User({ name, apellido, celular, email, password, admin, mensajero, verificado, email_token });



      user.password = await user.encryptPassword(password);
      await user.save().then((result)=>{
      //   const msg={
      //     from: 'superlocox@hotmail.es',
      //     to: user.email,
      //     subject: 'SADE - Verificación de cuenta',
      //     text: 'Estás recibiendo este correo debido a que tú (o alguien más) solicitó crear una cuenta en nuestro sitio web.'+ '\n'+ 'Favor de dar clic o copiar el siguiente para completar este proceso'+'\n'+ 'http://'+ req.headers.host + '/users/verify/' + email_token + '\n\n'+'Si usted no solicitó este proceso, favor de ignorar el mensaje y su contraseña seguirá igual'
      //   }
      //    sgMail.send(msg).then(() => {
      //     console.log('Message sent')
          
          
      // }).catch((error) => {
      //     console.log(error.response.body)
      //     // console.log(error.response.body.errors[0].message)
      // })
      })

      const token = jwt.sign({ id: user.id }, config.secreto, {
        expiresIn: '24h'
      });
      res.status(200).json({ auth: true, token });

    }

  } catch (e) {
    console.log(e)
    res.status(500).send('There was a problem signup');
  }

})

router.post('/sigin_api', async (req, res) => {
  try {
    const {lat, lng} = req.body;
    const user = await User.findOne({ email: req.body.email })
    


    console.log(req.body.email);
    console.log("Esto fue:");
    console.log(user);
    if (!user) {
      console.log("email no existe");
      return res.status(400).send('Email no existe')
      
    }
    const password = req.body.password;

    const match = await user.matchPassword(password);
    //const validPaswword = await (req.body.password, user.password)
    console.log(match);
  
    if (!match) {
      console.log("salio mal");
      return res.status(401).send({ auth: false, token: null });
      
    }

    if(user.mensajero){
      user.lat=lat;
    user.lng=lng;
    user.save();

      const token = jwt.sign({ id: user.id }, config.secreto, {
        expiresIn: '24h'
      });
      console.log("Mensajero logeado");
      return res.status(201).json({ auth: true, token });


    }
    else{
      user.lat=lat;
    user.lng=lng;
    user.save();
      
      const token = jwt.sign({ id: user.id }, config.secreto, {
        expiresIn: '24h'
      });
      console.log("salio bien");
      return res.status(200).json({ auth: true, token });
 

    }

   


  } catch (e) {
    console.log(e)
    res.status(500).send('There was a problem signin');
  }
})

router.get('/logout_api', function (req, res) {
  res.status(200).send({ auth: false, token: null });
})


router.get('/users/singup_api', async (req, res) => {
  const users = await User.find();
  res.json({ users });
})

router.get('/users/signup', (req, res) => {
  res.render('users/signup');
});

router.get('/users/singup_administrador', (req, res) => {
  res.render('users/singup_administrador');
});

router.post('/users/signup', async (req, res) => {


  let errors = [];
  const { name, apellido, celular, email, password, confirm_password } = req.body;

  const celularUser = await User.findOne({ celular: celular });
  const emailUser = await User.findOne({ email: email });

  if (name.length <= 0) {
    errors.push({ text: 'Por favor ingrese un nombre.' });
  }
  if (apellido.length <= 0) {
    errors.push({ text: 'Por favor ingrese un apellido.' });
  }
  if (celular.length != 10) {
    errors.push({ text: 'Número Celular no válido.' });
  }
  if (celularUser) {
    errors.push({ text: 'Este celular esta en uso.' });
  }
  if (email.length <= 0) {
    errors.push({ text: 'Email vacío.' });
  }
  if (emailUser) {
    errors.push({ text: 'Este correo esta en uso.' });
  }
  if (password != confirm_password) {
    errors.push({ text: 'Las contraseñas no coinciden.' });
  }
  if (password.length < 8) {
    errors.push({ text: 'La contraseña debe tener mas de 7 caracteres.' })
  }
  if (errors.length > 0) {
    res.render('users/signup', { errors, name, apellido, celular, email, password, confirm_password });
  } else {

    // Saving a New User
    mensajero = false;
    admin = false;
    verificado = true;
    email_token = crypto.randomBytes(64).toString('hex');
    const newUser = new User({ name, apellido, celular, email, password, admin, mensajero, verificado, email_token });
    newUser.password = await newUser.encryptPassword(password);
    await newUser.save();

    //newUser.password = await newUser.encryptPassword(password);
    // await newUser.save().then((result)=>{
    //   const msg={
    //     from: 'superlocox@hotmail.es',
    //     to: newUser.email,
    //     subject: 'SADE - Verificación de cuenta',
    //     text: 'Estás recibiendo este correo debido a que tú (o alguien más) solicitó crear una cuenta en nuestro sitio web.'+ '\n'+ 'Favor de dar clic o copiar el siguiente para completar este proceso'+'\n'+ 'http://'+ req.headers.host + '/users/verify/' + email_token + '\n\n'+'Si usted no solicitó este proceso, favor de ignorar el mensaje y su contraseña seguirá igual'
    //   }
    //    sgMail.send(msg).then(() => {
    //     console.log('Message sent')
    //     req.flash('success_msg', 'El correo fue enviado a '+ newUser.email+ ' con instrucciones para completar este proceso');
    //     res.redirect('/users/signin');
        
    // }).catch((error) => {
    //     console.log(error.response.body)
    //     // console.log(error.response.body.errors[0].message)
    // })
    // })

    // const token = jwt.sign({ id: newUser.id }, config.secreto, {
    //   expiresIn: '24h'
    // });

    req.flash('success_msg', 'Cuenta registrada.');
    res.redirect('/users/signin');




  }
});


router.post('/users/singup_administrador', async (req, res) => {
  let errors = [];
  var admin = false;
  var mensajero = false;
  const { name, apellido, celular, email, password, confirm_password, jerarquia } = req.body;

  const celularUser = await User.findOne({ celular: celular });
  const emailUser = await User.findOne({ email: email });

  if (name.length <= 0) {
    errors.push({ text: 'Por favor ingrese un nombre.' });
  }
  if (apellido.length <= 0) {
    errors.push({ text: 'Por favor ingrese un apellido.' });
  }
  if (celular.length != 10) {
    errors.push({ text: 'Número Celular no válido.' });
  }
  if (email.length <= 0) {
    errors.push({ text: 'Email vacío.' });
  }
  if (emailUser) {
    errors.push({ text: 'Este correo esta en uso.' });
  }
  if (celularUser) {
    errors.push({ text: 'Este celular esta en uso.' });
  }
  if (password != confirm_password) {
    errors.push({ text: 'Las contraseñas no coinciden.' });
  }
  if (password.length < 8) {
    errors.push({ text: 'La contraseña debe tener mas de 7 caracteres.' })
  }
  if (errors.length > 0) {
    res.render('users/singup_administrador', { errors, name, apellido, celular, email, password, confirm_password, jerarquia });
  } else {
    // Look for email coincidence
    if (jerarquia == 'Administrador') {
      admin = true;
      mensajero = true;

    } else {
      mensajero = true;
    }

    // Saving a New User

    verificado = true;

    const newUser = new User({ name, apellido, celular, email, password, jerarquia, admin, mensajero,verificado });
    newUser.password = await newUser.encryptPassword(password);
      await newUser.save();

      const token = jwt.sign({id: newUser.id},config.secreto,{
        expiresIn: '24h'
      });
      //res.status(200).json({auth:true, token});


      req.flash('success_msg', 'Cuenta registrada.');
      res.redirect('/users/singup_administrador');

    




  }
});

router.get('/users/verify/:token', async(req,res,next)=>{
  try{
    const user = await User.findOne({email_token: req.query.token});
    if(!user){
      req.flash('error','El token es inválido, favor contactarnos.');
      return res.redirect('/');
    }

    user.email_token = null;
    user.verificado = true;
    await user.save();
    await req.login(user, async(err)=>{
      if(err) return next(err);
      req.flash('success_msg','Cuenta verificada, ahora puedes iniciar sesión ');
      //const redirectUrl = req.session.redirectUrl || '/';
      //delete req.session.redirectUrl;
      res.redirect('/users/signin');
    });
  }catch (error){
    console.log(error);
    req.flash('error','Algo salió mal');
    res.redirect('/');
  }
 

});



router.get('/users/signin', (req, res) => {
  res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local', {


  
  failureRedirect: '/users/signin',

  //failureFlash: 'Ingrese bien sus credenciales'
  badRequestMessage: 'Falta información',
  failureFlash: true
}), function (req, res, next) {
  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/notes')
  }
});



router.get('/contact', (req, res) => {
  res.render('users/contact');
});

router.post('/contact', async (req, res) => {

  const msg = {
    to: 'megalaxusd@gmail.com',
    from: 'superlocox@hotmail.es',
    subject: `Mensaje de Contactanos de Sade de ${req.body.email}`,
    text: req.body.message,
    html: `
    <p>${req.body.message}</p>
    `,
  };
  try {
    await sgMail.send(msg);
    req.flash('success_msg', 'Su correo fue enviado exitosamente.');
    res.redirect('back');
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body)
    }
    req.flash('error', 'Lo sentimos, algo salio mal contactanos a admin_sade@hotmail.com');
    res.redirect('back');
  }

});



router.get('/users/confirm_email', (req, res) => {
  res.render('users/confirm_email');
});

router.post('/users/confirm_email',  (req, res) => {
  crypto.randomBytes(64,(err,buffer)=>{
    if(err){
      console.log(err);
    }
    const token = buffer.toString('hex')
    User.findOne({email: req.body.email})
    .then(user=>{
      if(!user){
        return res.status(422).json({error:"No existe un usuario con este correo"})
      }
      user.resetpwToken=token;
      user.resetpwExpires= Date.now()+ 3600000; //Una 
      
      user.save().then((result)=>{
        const msg={
                  from: 'superlocox@hotmail.es',
                  to: user.email,
                  subject: 'Restablecer la contraseña',
                  text: 'Estás recibiendo este correo debido a que tú (o alguien más) solicitó resetear la contraseña'+ '\n'+ 'Favor de dar clic o copiar el siguiente para completar este proceso'+'\n'+ 'http://'+ req.headers.host + '/users/resetpw/' + token + '\n\n'+'Si usted no solicitó este proceso, favor de ignorar el mensaje y su contraseña seguirá igual'
                }
                 sgMail.send(msg).then(() => {
                  console.log('Message sent')
                  req.flash('success_msg', 'El correo fue enviado a '+ user.email+ ' con instrucciones para completar este proceso');
                  res.redirect('/users/confirm_email');
                  
              }).catch((error) => {
                  console.log(error.response.body)
                  // console.log(error.response.body.errors[0].message)
              })
                  
      })
    })
  })


});

// router.post('/users/confirm_email', async(req, res) => {
//   asyncs.waterfall([
//     function (done) {
//       crypto.randomBytes(20,function (err,buf) {
//         var token = buf.toString('hex');
//         done(err,token);

//       });

//     },
//     function (token,done) {
//       const user = User.findOne({email: req.body.email},function (err,user) {
//         if(!user){
//           req.flash('error','No existe una cuenta con este email');
//           return res.redirect('/users/confirm_email');

//         }
//         user.resetpwToken = token;
//         user.resetpwExpires= Date.now()+ 3600000; //Una hora

//         user.save(function (err) {
//           done(err,token,user);

//         });



//       });

//     },

//     function (token,user,done){

//       const msg={
//         from: 'megalaxusd@gmail.com',
//         to: user.email,
//         subject: 'Restablecer la contraseña',
//         text: 'Estás recibiendo este correo debido a que tú (o alguien más) solicitó resetear la contraseña'+ '\n'+ 'Favor de dar clic o copiar el siguiente para completar este proceso'+'\n'+ 'http://'+ req.headers.host + '/users/resetpw/' + token + '\n\n'+'Si usted no solicitó este proceso, favor de ignorar el mensaje y su contraseña seguirá igual'
//       }
//        sgMail.send(msg);
//         req.flash('success_msg', 'El correo fue enviado a '+ user.email+ ' con instrucciones para completar este proceso');
//         done(err, 'done');


//     }



//     // function (token,user,done) {
//     //   var smtpTransport = nodemailer.createTransport({
//     //     service: 'Gmail',
//     //     auth:{
//     //       user:'megalaxusd@gmail.com',
//     //       pass: pw
//     //     }
//     //   });
//     //   var mailoptions={
//     //     to: user.email,
//     //     from: 'megalaxusd@gmail.com',
//     //     subject: 'Restablecer la contraseña',
//     //     text: 'Estás recibiendo este correo debido a que tú (o alguien más) solicitó resetear la contraseña'+ '\n'+ 'Favor de dar clic o copiar el siguiente para completar este proceso'+'\n'+ 'http://'+ req.headers.host + '/users/resetpw/' + token + '\n\n'+'Si usted no solicitó este proceso, favor de ignorar el mensaje y su contraseña seguirá igual'
//     //   };

//     //   smtpTransport.sendMail(mailoptions, function(err) {

//     //     console.log('mail sent');

//     //     req.flash('success_msg', 'El correo fue enviado a '+ user.email+ ' con instrucciones para completar este proceso');
//     //     done(err, 'done');


//     //   });

//     // }

//   ],function(err) {
//     if(err) return next(err);


//     res.redirect('/users/confirm_email');

//   })
// });

router.get('/users/resetpw/:token', function (req, res) {
  User.findOne({ resetpwToken: req.params.token, resetpwExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      req.flash('error', 'Ha expirado el reseteo de clave.');
      return res.redirect('/users/confirm_email');
    }
    res.render('users/resetpw', { token: req.params.token });
  });
});

router.post('/users/resetpw/:token', async (req, res) => {

      
  User.findOne({ resetpwToken: req.params.token, resetpwExpires: { $gt: Date.now() } })
  .then(user=>{
    if (!user) {
      req.flash('error', 'El token es invalido o expiro.');
      return res.redirect('back');
    }
    if (req.body.password === req.body.confirm) {
      user.setPassword(req.body.password, function (err) {
        user.resetpwToken = undefined;
        user.resetpwExpires = undefined;

        user.save().then((result)=>{

          const msg={
            from: 'superlocox@hotmail.es',
            to: user.email,
            subject: 'Tu contraseña ha sido cambiado',
            text: 'Hola,\n\n' +
            'Esto es una confirmación de que la contraseña de ' + user.email + ' ha sido cambiado.\n'
          }
           sgMail.send(msg).then(() => {
            console.log('Message sent')
            req.flash('success_msg', 'Listo! Tu contraseña ha sido cambiada.');
            res.redirect('/users/signin');
            
        }).catch((error) => {
            console.log(error.response.body)
            // console.log(error.response.body.errors[0].message)
        })

        })
       
      })
    }else {
      req.flash("error", "Contraseña no coincide.");
      return res.redirect('back');
    }


  })


});


// router.post('/users/resetpw/:token', async (req, res) => {
//   asyncs.waterfall([
//     function (done) {
//       User.findOne({ resetpwToken: req.params.token, resetpwExpires: { $gt: Date.now() } }, function (err, user) {
//         if (!user) {
//           req.flash('error', 'El token es invalido o expiro.');
//           return res.redirect('back');
//         }
//         if (req.body.password === req.body.confirm) {
//           user.setPassword(req.body.password, function (err) {
//             user.resetpwToken = undefined;
//             user.resetpwExpires = undefined;

//             user.save();
//             done(err, user);
//           })
//         } else {
//           req.flash("error", "Contraseña no coincide.");
//           return res.redirect('back');
//         }
//       });
//     },
//     function (user, done) {
//       var smtpTransport = nodemailer.createTransport({
//         service: 'Gmail',
//         auth: {
//           user: 'megalaxusd@gmail.com',
//           pass: pw
//         }
//       });
//       var mailOptions = {
//         to: user.email,
//         from: 'megalaxusd@gmail.com',
//         subject: 'Tu contraseña ha sido cambiado',
//         text: 'Hola,\n\n' +
//           'Esto es una confirmación de que la contraseña de ' + user.email + ' ha sido cambiado.\n'
//       };
//       smtpTransport.sendMail(mailOptions, function (err) {
//         console.log('contraseña cambiada');

//         req.flash('success_msg', 'Listo! Tu contraseña ha sido cambiada.');
//         done(err);
//       });
//     }
//   ], function (err) {
//     res.redirect('/users/signin');
//   });
// });



router.get('/users/mis_pedidos', isLogIn, function (req, res, next) {


  Pedido.find({ user: req.user }, function (err, pedidos) {
    if (err) {
      return res.write('Error!');
    }
    var cart;
    pedidos.forEach(function (pedido) {
      //cart = new Cart(pedido.cart);
      //pedido.items = cart.generateArray();

      

    });

    console.log(pedidos);

    res.render('users/mis_pedidos', { pedidos: pedidos });

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

router.get('/dispositivo/pedidos', async (req, res) => {
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

  res.render('dispositivo/pedidos', { users, pedidos });



});

router.get('/users/elegir_p', async(req, res) =>  {
  const users = await User.find();
  const pedidos = await Pedido.find();
  res.render('users/elegir_p',{ users, pedidos });
});


router.get('/maps/seguimiento', isLogIn, (req, res) => {
  res.render('maps/seguimiento');
});


const rooms ={}

router.get('/users/index_chat', (req, res) => {
  res.render('users/index_chat', {rooms:rooms});
});

router.get('/room', async(res,req)=> {
  const pedidos = await Pedido.find();
  const users = await User.find();

  res.render('users/room',{pedidos,users});
});




module.exports = router;


function isLogIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/users/signin');
}

function initMap() {

  var output = document.getElementById('map');


  if (navigator.geolocation) {
    console.log("Tu navegador soporta geolocalizacion");
  }





  navigator.geolocation.getCurrentPosition(localizar, error);



}

function localizar(posicion) {
  var latitude = posicion.coords.latitude;
  var longitude = posicion.coords.longitude;

  //var imgURL="https://maps.googleapis.com/maps/api/staticmap?center="+latitude+","+longitude+"&size=600x300&markers=color:red%7C"+latitude+","+longitude+"&key=AIzaSyChSPm7qthyY7znh5vF28ix2tDSC2iYvYo";

  output.innerHTML = "<p>latitud: " + latitude + "<br>Longitud: " + longitude + "</p>";
  //output.innerHTML ="<img src='"+imgURL+"'>";


}

function error() {
  console.log("No se pudo obtener la ubicacion");
}