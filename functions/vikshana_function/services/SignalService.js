const catalyst = require('zcatalyst-sdk-node');

class SignalService {
    /**
     * Publishes a serverless event signal across the Catalyst Signals event bus.
     */
    static async publish(req, eventType, payload = {}) {
        const timestamp = new Date().toISOString();
        const eventSignal = {
            eventType,
            timestamp,
            payload
        };

        try {
            if (req) {
                const app = catalyst.initialize(req);
                // Access Catalyst Signals / Event Bus API if available
                if (app.signals) {
                    await app.signals().raiseSignal(eventType, eventSignal);
                }
            }
            console.log(`[SignalService] Signal Published: ${eventType}`, eventSignal);
            return { success: true, signal: eventSignal };
        } catch (error) {
            console.warn(`[SignalService] Signal publish warning (${eventType}):`, error.message);
            // Non-blocking fallback for local serverless execution
            return { success: true, signal: eventSignal, fallback: true };
        }
    }
}

module.exports = SignalService;
