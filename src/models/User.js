const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  name: { type: String, required: true },
  apellido: { type: String, required: true },
  celular: { type: Number,   required: true },
  email: { type: String,   required: true },
  password: { type: String, required: true },
  admin:{type:Boolean,required:true},
  resetpwToken: String,
  resetpwExpires: Date,
  mensajero:{type:Boolean,required:true},
  verificado: {type:Boolean,require:true},
  email_token:{type: String},
  date: { type: Date, default: Date.now }
});

UserSchema.methods.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
