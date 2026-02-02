class RecordSystem {
    constructor() {
        this.records = { top20: [] };
        this.isLoading = false;
        // Ajusta esto si tu API está en otra ruta, pero en Vercel suele ser /api/records
        this.apiUrl = '/api/records';
    }

    // Cargar récords globales desde Redis
    async loadRecords() {
        this.isLoading = true;
        try {
            const response = await fetch(this.apiUrl);
            if (response.ok) {
                const data = await response.json();
                this.records.top20 = data;

                // Si la base de datos está vacía, mostramos vacía (o podrías inyectar defaults visuales)
                if (this.records.top20.length === 0) {
                    console.log("No hay récords globales aún.");
                }
            } else {
                console.warn('Error conectando con el servidor de ranking.');
            }
        } catch (error) {
            console.error('Error de red:', error);
        } finally {
            this.isLoading = false;
        }
        return this.records;
    }

    // Utilidad para convertir tiempo
    timeToMs(timeString) {
        const parts = timeString.split(':');
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        return (minutes * 60 + seconds) * 1000;
    }

    // Verificación preliminar (Optimista)
    // Compara con la caché local de Top 20 para ver si vale la pena enviar al servidor
    checkRecord(timeString) {
        const timeMs = this.timeToMs(timeString);
        const top20 = this.records.top20;

        // Caso: Tabla vacía
        if (top20.length === 0) {
            return { isRecord: true, position: 1, replacedPlayer: null };
        }

        // Buscar posición comparando con cada récord actual
        let position = 1;
        let replacedPlayer = null;

        for (let i = 0; i < top20.length; i++) {
            if (timeMs < top20[i].timeMs) {
                // Si el tiempo es menor, esta es tu posición
                position = i + 1;
                replacedPlayer = top20[i];
                break;
            }
        }

        // Si no superaste a nadie pero hay hueco (menos de 20)
        if (!replacedPlayer && top20.length < 20) {
            return {
                isRecord: true,
                position: top20.length + 1,
                replacedPlayer: null
            };
        }

        // Si superaste a alguien o entraste en hueco, es récord
        return {
            isRecord: replacedPlayer !== null,
            position: position,
            replacedPlayer: replacedPlayer
        };
    }

    // Guardar en Redis Global
    async addRecord(name, timeString) {
        const timeMs = this.timeToMs(timeString);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, timeMs })
            });

            if (response.ok) {
                const result = await response.json();
                // Recargar inmediatamente para mostrar la tabla actualizada
                await this.loadRecords();
                return result.position;
            } else {
                console.error('Error guardando en la nube');
                return -1;
            }
        } catch (error) {
            console.error('Error de red al guardar:', error);
            return -1;
        }
    }

    getTop20() { return this.records.top20; }
    getTop5() { return this.records.top20.slice(0, 5); }
    getTop3() { return this.records.top20.slice(0, 3); }
}

const recordSystem = new RecordSystem();
