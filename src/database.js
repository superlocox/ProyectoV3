const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);


/*
mongoose.connect('mongodb+srv://navidarito:!david123@cluster0-46pmk.gcp.mongodb.net/test?retryWrites=true&w=majority', {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
})  .then(db => console.log('DB is connected'))
.catch(err => console.error(err));
*/


mongoose.connect('mongodb://localhost/node-notes-db', {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
})
  .then(db => console.log('DB is connected'))
  .catch(err => console.error(err));
