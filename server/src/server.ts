import app from "./app";
import { env } from "./config/environment";
import { logger } from "./utils/logger";
import { createServer } from "http";
import { promisify } from "util";

const server = createServer(app);

/**
 * Validera miljövariabler och andra krav
 */
const validateEnvironment = () => {
    const requiredVars = [
        "NODE_ENV",
        "PORT",
        "SESSION_SECRET",
        "ONSLIP_CLIENT_ID",
        "ONSLIP_REDIRECT_URI",
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Saknade miljövariabler: ${missingVars.join(", ")}`);
    }

    // Validera kritiska konfigurationer
    if (env.nodeEnv === "production") {
        if (
            !process.env.SESSION_SECRET ||
            process.env.SESSION_SECRET.length < 32
        ) {
            throw new Error(
                "SESSION_SECRET måste vara minst 32 tecken i produktion"
            );
        }
    }
};

/**
 * Hantera oväntade fel
 */
const setupErrorHandlers = () => {
    process.on("uncaughtException", (error) => {
        logger.error("Ohanterat undantag:", error);
        gracefulShutdown(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
        logger.error("Ohanterad Promise rejection:", reason);
    });

    process.on("SIGTERM", () => {
        logger.info("SIGTERM signal mottagen");
        gracefulShutdown(0);
    });

    process.on("SIGINT", () => {
        logger.info("SIGINT signal mottagen");
        gracefulShutdown(0);
    });
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async (code: number) => {
    logger.info("Påbörjar graceful shutdown...");

    try {
        // Stoppa server från att ta emot nya anslutningar
        server.close(async () => {
            logger.info("Server stängd");

            // Implementera cleanup här om det behövs
            // T.ex. stänga databaskopplingar, cleanup cache etc.

            logger.info("Cleanup slutförd");
            process.exit(code);
        });

        // Sätt timeout för shutdown
        setTimeout(() => {
            logger.error(
                "Kunde inte stänga ner gracefully, forcerar avstängning"
            );
            process.exit(1);
        }, 10000); // 10 sekunder timeout
    } catch (error) {
        logger.error("Fel vid shutdown:", error);
        process.exit(1);
    }
};

/**
 * Starta servern
 */
const start = async () => {
    try {
        validateEnvironment();
        setupErrorHandlers();

        const serverStartTime = Date.now();

        server.listen(env.port, () => {
            const startupTime = Date.now() - serverStartTime;

            logger.info("Server startad", {
                port: env.port,
                environment: env.nodeEnv,
                startupTime: `${startupTime}ms`,
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage(),
                cors: {
                    origins: env.cors.origin,
                },
                pid: process.pid,
            });
        });
    } catch (error) {
        logger.error("Kunde inte starta servern:", error);
        process.exit(1);
    }
};

// Starta applikationen
start();
