const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
// Models
const Note = require('../models/Note');
const Cart = require("../models/Carrito");
// Helpers
const { isAuthenticated } = require('../helpers/auth');

// New Note
router.get('/notes/add', isAuthenticated, (req, res) => {
  res.render('notes/new-note');
});

router.post('/notes/new-note', isAuthenticated, async (req, res) => {
  const { title, description } = req.body;
  const errors = [];
  if (!title) {
    errors.push({text: 'Please Write a Title.'});
  }
  if (!description) {
    errors.push({text: 'Please Write a Description'});
  }
  if (errors.length > 0) {
    res.render('notes/new-note', {
      errors,
      title,
      description
    });
  } else {
    const newNote = new Note({title, description});
    newNote.user = req.user.id;
    await newNote.save();
    req.flash('success_msg', 'Note Added Successfully');
    res.redirect('/notes');
  }
});

// Get All Notes
router.get('/notes', isAuthenticated, async (req, res) => {
 // const notes = await Note.find({user: req.user.id}).sort({date: 'desc'});
  Pedido.find({user: req.user}, function (err, pedidos) {
    if(err){
      return res.write('No tienes pedidos');
    }
    var cart;
    pedidos.forEach(function (pedido) {
      cart = new Cart(pedido.cart);
      pedido.items = cart.generateArray();
      
    });

    res.render('notes/all-notes', { pedidos: pedidos });
    
  });

  //res.render('notes/all-notes', { notes });

});

// Edit Notes
router.get('/notes/edit/:id', isAuthenticated, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if(note.user != req.user.id) {
    req.flash('error_msg', 'Not Authorized');
    return res.redirect('/notes');
  } 
  res.render('notes/edit-note', { note });
});

router.put('/notes/edit-note/:id', isAuthenticated, async (req, res) => {
  const { title, description } = req.body;
  await Note.findByIdAndUpdate(req.params.id, {title, description});
  req.flash('success_msg', 'Nota creada exitosamente');
  res.redirect('/notes');
});

// Delete Notes
router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  req.flash('success_msg', 'Nota borrada exitosamente');
  res.redirect('/notes');
});

module.exports = router;
