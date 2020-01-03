var mongoose = require('mongoose');
var { Schema } = mongoose;

var PedidoSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref:'User'},
    cart: {type: Object, required:true},
  //  id_pago: {type: String, required: true},
    activo: {type: Boolean, required: true},
    estado: {type: String, required: true},
    pago:{type: String, required:true}

});

module.exports = mongoose.model('Pedido', PedidoSchema);