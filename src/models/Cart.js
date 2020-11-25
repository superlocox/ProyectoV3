const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartSchema = new Schema({
    items: { type: Object },
    cantTotal: { type: Number },
    precioTotal: { type: Number },
  
  
});

//CartSchema.methods.add();

module.exports = mongoose.model('Cart', CartSchema);