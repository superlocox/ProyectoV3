const express = require('express');
const router = express.Router();


var Product = require('../models/Productos');
var Cart = require('../models/Carrito');
//var Pedido = require('../models/Pedido');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/about', (req, res) => {
  res.render('about');
});


/*
router.get('/upload', (req, res) => {
  res.render('Form Upload');
});

router.post('/upload', (req, res) => {
  console.log(req.file);
  res.send('Subido');
});

router.get('/product/:id', (req, res) => {
  res.render('Form Upload');
});

router.get('/product/:id/delete', (req, res) => {
  res.render('Form Upload');
});


*/




module.exports = router;
