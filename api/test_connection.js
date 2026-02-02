// test_connection.js
require('dotenv').config({ path: '.env.local' }); // Carga el archivo .env
const Redis = require('ioredis');

async function test() {
    console.log("📡 Conectando a Redis...");

    try {
        const redis = new Redis(process.env.REDIS_URL);

        // Escribir un dato de prueba
        await redis.set('prueba_agroletras', '¡Funciona!');
        console.log("✅ Escritura exitosa.");

        // Leer el dato
        const valor = await redis.get('prueba_agroletras');
        console.log(`📖 Lectura exitosa: ${valor}`);

        // Limpiar
        await redis.del('prueba_agroletras');

        redis.disconnect();
        console.log("👋 Desconectado correctamente.");
    } catch (error) {
        console.error("❌ ERROR DE CONEXIÓN:", error);
    }
}

test();