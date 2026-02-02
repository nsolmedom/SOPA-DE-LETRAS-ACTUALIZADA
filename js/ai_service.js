class AIService {
    static history = {};

    static async generateLevel(topic, difficulty) {
        const normalizedTopic = topic.trim().toUpperCase();
        if (!this.history[normalizedTopic]) {
            this.history[normalizedTopic] = new Set();
        }

        // Limitamos el historial enviado para no inflar el costo
        const usedWords = Array.from(this.history[normalizedTopic]).slice(-20).join(',');

        try {
            // Llamada al proxy seguro (Vercel Function)
            const response = await fetch('/api/generate_level', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic: topic,
                    difficulty: difficulty,
                    usedWords: usedWords
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error del servidor');
            }

            const data = await response.json();

            // data trae: { gridSize, directions, wordsData: [{word, fact}] }

            const words = data.wordsData.map(item => item.word.toUpperCase());
            const facts = {};

            data.wordsData.forEach(item => {
                facts[item.word.toUpperCase()] = item.fact;
                this.history[normalizedTopic].add(item.word.toUpperCase());
            });

            return {
                gridSize: data.gridSize,
                words: words,
                facts: facts,
                directions: data.directions
            };

        } catch (error) {
            console.error('AI Generation failed:', error);
            // Tu fallback actual está perfecto
            return this.getFallbackConfig();
        }
    }

    static getFallbackConfig() {
        return {
            gridSize: 10,
            words: ['ERROR', 'REINTENTAR'],
            facts: { 'ERROR': 'No se pudo conectar.', 'REINTENTAR': 'Prueba de nuevo.' },
            directions: ['horizontal', 'vertical']
        };
    }
}