const mongoose = require('mongoose');
const { Schema } = mongoose;


const ProductoSchema = new Schema({

  imgPath:{type:String,required:true},
  nombre_producto: {type: String,required: true},
  descripcion_producto: {type: String,required: true},
  precio: {type: Number,required: true},
  cantidad: {type: Number,required: true},
  mimetype:{type: String},
  filename:{type:String},
  originalname:{type:String},
  size:{type:Number},
  date: {type: Date,default: Date.now},

});


module.exports = mongoose.model('Productos', ProductoSchema);