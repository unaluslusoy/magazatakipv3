const ctrl = require('./src/controllers/userController');
console.log('Exports:', Object.keys(ctrl));
console.log('getAllUsers:', typeof ctrl.getAllUsers);