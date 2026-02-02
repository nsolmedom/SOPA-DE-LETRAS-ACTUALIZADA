import Redis from 'ioredis';

// Conexión segura usando la variable de entorno (o tu URL si estás probando rápido)
const redis = new Redis(process.env.REDIS_URL);
const REDIS_KEY = 'agroletras:global_ranking';

export default async function handler(req, res) {
    // Configurar CORS para permitir peticiones desde tu juego
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // --- GET: Obtener Ranking ---
        if (req.method === 'GET') {
            // Obtener los top 20 (Rango 0 a 19) con puntajes
            // ZRANGE devuelve de menor a mayor (ideal para tiempos: menor tiempo es mejor)
            const rawData = await redis.zrange(REDIS_KEY, 0, 19, 'WITHSCORES');

            // Formatear la respuesta plana de Redis a objetos JSON
            const formattedRecords = [];
            for (let i = 0; i < rawData.length; i += 2) {
                // Redis devuelve: [nombre, tiempoMs, nombre, tiempoMs...]
                const name = rawData[i];
                const timeMs = parseInt(rawData[i + 1]);

                // Recalcular string de tiempo MM:SS
                const totalSeconds = Math.floor(timeMs / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                formattedRecords.push({ name, time: timeString, timeMs });
            }

            return res.status(200).json(formattedRecords);
        }

        // --- POST: Guardar Nuevo Récord ---
        if (req.method === 'POST') {
            const { name, timeMs } = req.body;

            if (!name || !timeMs) {
                return res.status(400).json({ error: 'Faltan datos' });
            }

            // Guardar en Redis Sorted Set (ZSET)
            // ZADD key score member
            // Si el nombre ya existe, actualizará su mejor tiempo
            await redis.zadd(REDIS_KEY, timeMs, name);

            // Mantenimiento: Mantener solo los mejores 50 en la DB para ahorrar espacio
            // (Borrar desde el puesto 50 hasta el final)
            await redis.zremrangebyrank(REDIS_KEY, 50, -1);

            // Calcular la nueva posición del jugador
            const rank = await redis.zrank(REDIS_KEY, name);

            return res.status(200).json({ success: true, position: rank + 1 });
        }

    } catch (error) {
        console.error('Redis Error:', error);
        return res.status(500).json({ error: 'Error de servidor' });
    }
}
