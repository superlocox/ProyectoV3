const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartSchema = new Schema({
    //items: { type: Object },
    items: [{type: Schema.Types.ObjectId, ref:'Productos' }],
    cantTotal: { type: Number },
    precioTotal: { type: Number },
    index: {type: Number}
  
  
});

//CartSchema.methods.add();

module.exports = mongoose.model('Cart', CartSchema);