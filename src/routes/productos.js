const router = require('express').Router();
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Pedido = require('../models/Pedido');
const { isAuthenticated } = require('../helpers/auth');
const readline = require('readline');


if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
console.log(stripeSecretKey, stripePublicKey)


const stripe = require('stripe')('sk_test_Y20a1WyCOc9YxyjZyT1ppq4l008RKslg6a');
// Models
const Productos = require('../models/Productos');
const Cart = require("../models/Carrito");

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

router.get('/productos/articulos',async(req,res)=>{
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
            res.redirect('/notes');
            
        }
    }
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

  router.get('/productos/carrito',  async(req,res)=>{
      if(!req.session.cart){
          return res.render('productos/carrito',{products:null});
      }
      var cart =  new Cart(req.session.cart);
      res.render('productos/carrito',{products:cart.generateArray(),Preciototal: cart.precioTotal} );
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
        cart: req.session.cart,
        activo: true,
        estado: "En cola",
        pago: req.body.pago

    });

    pedido.save(function(err, result){
     
        req.flash('success','Pedido realizado');
        req.session.cart=null;
        res.redirect('/users/mis_pedidos');
    })



});


    router.post('/charge', isLogIn, async (req,res)=>{
     

        const customer = await stripe.customers.create({
            email: req.body.stripeEmail,
            source: req.body.stripeToken
           
        })

        const charge = await stripe.charges.create({
            amount: (req.session.cart.precioTotal*100),
            currency: 'dop',
            customer: customer.id,
            description: 'prueba pago'
        })

        console.log(charge.id);
        const pedido = new Pedido({
            user: req.user,
            cart: req.session.cart,
            id_pago: charge.id,
            activo: true

        });

        pedido.save(function(err, result){
         
            req.flash('success','Pedido realizado');
            req.session.cart=null;
            res.redirect('/');
        })


        
    });




module.exports = router;


function isLogIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/users/signin');
}