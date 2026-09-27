await Promise.all(['../src/config/env.js', '../src/app.js'].map((modulePath) => import(modulePath)));
console.log('API: módulos verificados correctamente.');

