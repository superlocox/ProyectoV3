const router = require('express').Router();
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Pedido = require('../models/Pedido');
const { isAuthenticated } = require('../helpers/auth');
const readline = require('readline');
const User = require('../models/User');


// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config()
//   }
  
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
console.log(stripeSecretKey, stripePublicKey)


const stripe = require('stripe')('sk_test_Y20a1WyCOc9YxyjZyT1ppq4l008RKslg6a');
// Models
const Productos = require('../models/Productos');
const Cart = require("../models/Carrito");
const Carrito = require('../models/Cart');
const { session } = require('passport');




// router.post('/elegir_p_api', async(req, res)=>{

//     try{
//         const{ _id , latmen, lngmen, email } = req.body;

//         const usuario = await User.findOne({ _id: _id });


//     }



// });

router.post('/pedido_api', async(req,res)=>{

    try{
        const { user, cart, pago, latclient, lngclient} = req.body;

        var cc = "id: ";
        var ids = [];
        var cantidades = [];

        for(var index = cart.indexOf(cc);index >=0;index =cart.indexOf(cc, index+1) )
        {
           // console.log(cart.substring(index+4,index+28));
            ids.push(cart.substring(index+4,index+28));
        }
        var dd = "cantidad: ";

        for(var index = cart.indexOf(dd);index >=0;index =cart.indexOf(dd, index+1) )
        {
            //console.log(cart.substring(index+10,index+11));
            cantidades.push(cart.substring(index+10,index+11));
        }


        var carrito = new Carrito();

        var cantidadT = 0;
        var precioT= 0;
        var el_carrito = [];
        var carx = {};

        for(var index = 0; index<ids.length;index++){
            var itemAlmacenado = await Productos.findById(ids[index]);
            console.log("El item es:  -")
            console.log(itemAlmacenado);
            itemAlmacenado.cantidad = cantidades[index];
            console.log(itemAlmacenado.cantidad);
            cantidadT += itemAlmacenado.cantidad;
            precioT += itemAlmacenado.precio*cantidades[index];
    
            carx [itemAlmacenado._id] = itemAlmacenado;
            //el_carrito.push({items: itemAlmacenado});


        }


        console.log('los items son:');
        console.log(carx);
        console.log('Cant T: ');
        
        carrito.cantTotal = cantidadT;

        console.log(carrito.cantTotal);
        carrito.precioTotal = precioT;


        console.log('Precio Total: ');
        console.log(carrito.precioTotal);

        carrito.items = carx;

        const usuario = await User.findOne({ email: user });
        console.log('El usuario es:');
        console.log(usuario.id);


        


        if(!carrito){
            console.log("Salio mal");
            return res.status(400).send('No tienes artículos');
            
        }else{

            const pedido = new Pedido({
                user: usuario,
                username: usuario.name,
                cart: carrito,
                pago: pago,
                activo: true,
                estado: "En cola",
                id_mensajero: 'null',
                id_pago:'null',
                latclient: latclient,
                lngclient: lngclient
    
            });


            pedido.markModified(cart);
    
            pedido.save(function(err, result){
     
                console.log("Se guardoooo");
            })
        
    
            return res.status(200).json('Pedido Realizado');
        }
        
       



    }catch (e) {
        console.log(e)
        res.status(500).send('Hubo un problema al realizar el pedido');
      }


      /*
        console.log(user);

        console.log(cart);
        //console.log(cart.items);

        cart.array.forEach(element => {
           
            console.log( cart[element]);

        });


        var carrrito = new Cart();
        for (let index = 0; index < cart.length; index++) {
            console.log('El id es: '+cart[index].id);
            console.log('La cantidad es:'+ cart[index].cantidad);
            carrrito.addpercount(cart[index].id,cart[index].cantidad);
            
            
        }
        console.log(carrrito);
        */

    
});



router.get('/api/productos', async (req, res)=>{
    const productos = await Productos.find();
    res.json({productos});

})


router.get('/productos/add_product', (req, res) => {
    res.render('productos/add_product');
});

router.get('/productos/show',async(req,res)=>{
    const productos = await Productos.find();
    //console.log(productos);
    res.render('productos/show',{productos});
})

router.get('/productos/lista_productos',async(req,res)=>{
    const productos = await Productos.find();
    //console.log(productos);
    res.render('productos/lista_productos',{productos});
})

router.get('/productos/articulos', isLogIn ,async(req,res)=>{
    const productos = await Productos.find();
    //console.log(productos);
    res.render('productos/articulos',{productos});
})

router.post('/productos/add_product', async (req, res) => {
    let errors = [];
    const { imgPath, nombre_producto, descripcion_producto, precio, cantidad } = req.body;

    //if(imgPath =="null"){
     //   errors.push({ text: 'Por favor ingrese una imagen.' });
    //}

    if (nombre_producto.length <= 0) {
        errors.push({ text: 'Por favor ingrese un nombre.' });
    }
    if (descripcion_producto.length <= 0) {
        errors.push({ text: 'Por favor ingrese una descripcion.' });
    }
    if (precio <1) {
        errors.push({ text: 'Ingrese cantidad valida.' });
    }
    if (cantidad <1) {
        errors.push({ text: 'Ingrese cantidad valida.' });
    }
    if (errors.length > 0) {
        res.render('productos/add_product', { errors, imgPath, nombre_producto, descripcion_producto, precio, cantidad });
    } else {
        // Look for email coincidence
        const nombre_productox = await Productos.findOne({ imgPath, nombre_producto: nombre_producto });
        if (nombre_productox) {
            req.flash('error_msg', 'Este producto ya existe.');
            res.redirect('/productos/add_product');
        } else {
            // Saving a New User
            
           // const newProduct = new Productos({imgPath, nombre_producto, descripcion_producto, precio, cantidad});
           const newProduct = new Productos();
           newProduct.nombre_producto = req.body.nombre_producto;
           newProduct.descripcion_producto = req.body.descripcion_producto;
           newProduct.filename = req.file.filename;
           newProduct.precio = req.body.precio;
           newProduct.cantidad = req.body.cantidad;
           newProduct.imgPath = '/img/upload/' + req.file.filename;
           newProduct.originalname = req.file.originalname;
           newProduct.mimetype = req.file.mimetype;
           newProduct.size = req.file.size;
        
            await newProduct.save();
            req.flash('success_msg', 'Se registro el producto.');
            res.redirect('/productos/articulos');
            
        }
    }
});


router.get('/productos/:id', (req, res) => {
    Productos.findById(req.params.id, (err, doc) => {
        if (!err) {
           // console.log(doc);
            res.render("\productos/product_edit", {
                producto: doc
            });
        }
    });
});


router.post('/update_product', async (req,res)=>{

    Productos.findOneAndUpdate({_id: req.body._id}, req.body, {new: true}, (err, doc)=>{
        if(!err){
            res.redirect('/productos/articulos');
        }
        else{

            res.render("\productos/product_edit", {
                producto: doc
            });
            console.log('Error during record update : ' + err);

        }
    })


});

router.get('/productos/delete/:id', (req, res) => {
    Productos.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/productos/articulos');
        }
        else { console.log('Error in employee delete :' + err); }
    });
});

/*
router.get('/productos/mostrar_productos', async (req, res) => {
    const products =  await Productos.find();
    res.render('productos/mostrar_productos', {products});
});


router.get('/productos/show_p', (req, res) => {
    res.render('productos/show_p');
});

*/

router.get('/productos/show/:id',function(req,res,next){

    var productId= req.params.id;
    var cart= new Cart(req.session.cart ? req.session.cart:{});
    Productos.findById(productId,function(err,productos){
        if(err){
            return res.redirect('/');
        }

        cart.add(productos,productos.id);
    
        req.session.cart= cart;
        console.log(cart);
        res.redirect('productos/show')
    })
});


router.get('/productos/show/add-to-cart/:id', async(req,res)=>{
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {items:{}});
    console.log(productId)
    Productos.findById(productId,function(err,product){
      if(err){
        return res.redirect('/');
      }
      cart.add(product, product.id);
      req.session.cart = cart;
      console.log(req.session);
      res.redirect('/productos/lista_productos');
  
    })
  });

  router.get('/productos/show/reduce/:id', async(req,res)=>{

    var productId= req.params.id;
    var cart= new Cart(req.session.cart ? req.session.cart:{});
    Productos.findById(productId,function(err,product){
        if(err){
            console.log('error')
            return res.redirect('/');
            
        }

        cart.reduceByOne(productId);
    
        req.session.cart= cart;
        console.log(cart);
        res.redirect('productos/show')
        res.redirect('/productos/carrito');
    })



    // var productId = req.params.id;
    // console.log(productId)
    // var cart = new Cart(req.session.cart ? req.session.cart : {});
    // console.log(cart)
    // cart.reduceByOne(productId);
    // req.session.cart = cart;
    // console.log(req.session.cart);
    // res.redirect('/productos/carrito');
    
   

  });

  router.get('/productos/carrito',  async(req,res)=>{
    if(!req.session.cart){
        return res.render('productos/carrito',{product:null});
    }
    var cart =  new Cart(req.session.cart);
    res.render('productos/carrito',{product:cart.generateArray(),Preciototal: cart.precioTotal} );
});

  router.get('/productos/pago', isLogIn, async(req, res) => {
    if(!req.session.cart){
        return res.redirect('productos/carrito');
    }
    var cart= new Cart(req.session.cart);
    res.render('productos/pago',{total:cart.precioTotal});
    
    /*
    const rl = readline.createInterface(process.stdin,process.stdout);

    rl.on('line',(input)=>{
        var press= [];

        var index1 = press.indexOf("%B") + 2;
		var index2 = press.indexOf("^") + 1;
		var index3 = press.indexOf("^", index2 + 1) + 1;
		var cardNumber = ccs.substring( index1, index2 - 1);
		var expMonth = ccs.substr(index3, 2);
		var expYear = ccs.substr(index3 + 2, 2);
		var holderName = ccs.substring(index2, index3 - 1);
		document.getElementById("card_number").value = cardNumber;
		document.getElementById("ecard-expiry-monthm").value = expMonth;
		document.getElementById("card-expiry-YEAR").value = expYear;
        document.getElementById("card-card-holder-name").value = holderName;
        console.log(press);
    }); */
})


router.post('/pedido',isLogIn, async(req,res)=>{

    const pedido = new Pedido({
        user: req.user,
        username: req.user.name,
        cart: req.session.cart,
        pago: req.body.pago,
        activo: true,
        estado: "En cola",
        id_mensajero: 'null',
        id_pago:'null',
        mensajero:'null'

    });

    pedido.save(function(err, result){
     
        req.flash('success','Pedido realizado');
        req.session.cart=null;
        res.redirect('/users/mis_pedidos');
    })



});

router.get('/pago_stripe',isLogIn, async(req,res)=>{
    res.redirect('pago_stripe');

});

router.post('/productos/activar_pedido', isLogIn, async(req,res)=>{
    console.log(req.body.id);
    const id_pedido = req.body.id;
    console.log(id_pedido);
    
    Pedido.findById(id_pedido).then(pedido=>{
        pedido.estado = "En progreso";
        pedido.save();
        res.redirect('back');

    })



   
0

});


    router.post('/charge', isLogIn, async (req,res)=>{
     

      

        const customer = await stripe.customers.create({
            email: req.body.stripeEmail,
            source: req.body.stripeToken
           
        })

        const charge = await stripe.charges.create({
            amount: (req.session.cart.precioTotal)*100,
            currency: 'dop',
            customer: customer.id,
            description: 'prueba pago'
        })

        console.log(charge.id);

        req.flash('success','Pedido realizado');
            req.session.cart=null;
            res.redirect('/');
        
        // const pedido = new Pedido({
        //     user: req.user,
        //     cart: req.session.cart,
        //     id_pago: charge.id,
        //     activo: true

        // });

        // pedido.save(function(err, result){
         
        //     req.flash('success','Pedido realizado');
        //     req.session.cart=null;
        //     res.redirect('/');
        // })


        
    });




module.exports = router;


function isLogIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/users/signin');
}