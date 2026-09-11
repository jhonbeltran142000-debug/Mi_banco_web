const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const REQUERIDAS = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];

const faltantes = REQUERIDAS.filter((clave) => !process.env[clave]);

if (faltantes.length > 0) {
  const mensaje = `Faltan variables de entorno requeridas: ${faltantes.join(', ')}`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(mensaje);
  }
  console.warn(`ADVERTENCIA: ${mensaje}`);
}

const jwtSecret = process.env.JWT_SECRET || '';
if (jwtSecret && (jwtSecret.length < 32 || /secret|banco|1234|password|admin/i.test(jwtSecret))) {
  console.warn(
    'ADVERTENCIA: JWT_SECRET es debil o predecible. Usa una cadena aleatoria de al menos 32 caracteres.'
  );
}

if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = '8h';
}

module.exports = {
  REQUERIDAS,
};
