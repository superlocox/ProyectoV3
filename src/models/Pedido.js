var mongoose = require('mongoose');
var { Schema } = mongoose;

var PedidoSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref:'User'},
    username: {type:String},
    cart: {type: Object},
    id_pago: {type: String},
    activo: {type: Boolean, required: true},
    estado: {type: String, required: true},
    pago:{type: String, required:true},
    id_mensajero:{type:String},
    mensajero:{type:String}

});

module.exports = mongoose.model('Pedido', PedidoSchema);