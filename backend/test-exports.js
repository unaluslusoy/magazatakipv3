const ctrl = require('./src/controllers/templateController');
console.log('Exports:', Object.keys(ctrl));
console.log('getAllTemplates:', typeof ctrl.getAllTemplates);