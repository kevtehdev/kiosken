import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import session from "express-session";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/environment";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logging.middleware";
import { validateSession } from "./middleware/validation.middleware";
import { logger } from "./utils/logger";

// Routes
import buttonRoutes from "./routes/button.routes";
import campaignRoutes from "./routes/campaign.routes";
import deliveryRoutes from "./routes/delivery.routes";
import paymentRoutes from "./routes/payment.routes";
import resourceRoutes from "./routes/resource.routes";
import customerRoutes from "./routes/customer.routes";
import oauthRoutes from "./routes/oauth.routes";
import orderRoutes from "./routes/order.routes";

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuter
    max: 1000, // Max 100 förfrågningar per IP
    message: "För många förfrågningar från denna IP, försök igen senare",
});

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", env.cors.origin],
            },
        },
        crossOriginEmbedderPolicy: env.nodeEnv === "production",
    })
);

const corsOptions = {
    origin: env.cors.origin.split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-request-id",
        "x-api-key",
    ],
    exposedHeaders: ["x-request-id"],
    maxAge: 600, // 10 minuter
};

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(requestLogger);
app.use("/api/", limiter);

const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dev-secret",
    name: "sessionId",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: env.nodeEnv === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 15, // 15 minuter
        sameSite:
            env.nodeEnv === "production" ? ("none" as const) : ("lax" as const),
        domain: env.nodeEnv === "production" ? ".yourdomain.com" : undefined,
    },
};

if (env.nodeEnv === "production") {
    app.set("trust proxy", 1);
}

app.use(session(sessionConfig));

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv,
    });
});

app.use("/api/buttons", validateSession, buttonRoutes);
app.use("/api/campaigns", validateSession, campaignRoutes);
app.use("/api/delivery", validateSession, deliveryRoutes);
app.use("/api/payments", validateSession, paymentRoutes);
app.use("/api/resources", validateSession, resourceRoutes);
app.use("/api/customers", validateSession, customerRoutes);
app.use("/api/orders", validateSession, orderRoutes);
app.use("/api/oauth", oauthRoutes);

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use(errorHandler);

process.on("SIGTERM", () => {
    logger.info("SIGTERM signal mottagen. Stänger ner servern...");
});

export default app;
