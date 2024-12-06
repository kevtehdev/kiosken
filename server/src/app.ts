import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import session from "express-session";
import { env } from "./config/environment";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logging.middleware";

// Routes
import buttonRoutes from "./routes/button.routes";
import campaignRoutes from "./routes/campaign.routes";
import deliveryRoutes from "./routes/delivery.routes";
import paymentRoutes from "./routes/payment.routes";
import resourceRoutes from "./routes/resource.routes";
import customerRoutes from "./routes/customer.routes";
import oauthRoutes from "./routes/oauth.routes";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: env.cors.origin.split(','),
    credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(requestLogger);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: env.nodeEnv === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 15, // 15 minuter
        sameSite: env.nodeEnv === 'production' ? 'none' : 'lax'
    }
}));

app.get("/test", (req, res) => {
    res.send("hello world");
});

// Routes
app.use("/api/buttons", buttonRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/oauth", oauthRoutes);

// Error handling
app.use(errorHandler);

export default app;