var mongoose = require('mongoose');
var { Schema } = mongoose;

var PedidoSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref:'User'},
    username: {type:String},
    cart: {type: Schema.Types.ObjectId, ref:'Cart'},
    id_pago: {type: String},
    activo: {type: Boolean, required: true},
    estado: {type: String, required: true},
    pago:{type: String, required:true},
    id_mensajero:{type:String},
    mensajero:{type:String},
    latclient:{type: Number},
    lngclient:{type: Number},
    latmen:{type: Number},
    lngmen:{type: Number},



    productos: [{type: Schema.Types.ObjectId, ref:'Productos' }],
    cantTotal: { type: Number },
    precioTotal: { type: Number },

});

module.exports = mongoose.model('Pedido', PedidoSchema);