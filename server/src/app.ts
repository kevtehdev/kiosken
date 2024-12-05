import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { env } from "./config/enviroment";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logging.middleware";

// Routes
import buttonRoutes from "./routes/button.routes";
import campaignRoutes from "./routes/campaign.routes";
import deliveryRoutes from "./routes/delivery.routes";
import paymentRoutes from "./routes/payment.routes";
import resourceRoutes from "./routes/resource.routes";
import userRoutes from "./routes/user.routes";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(requestLogger);

app.get("/test", (req, res) => {
    res.send("hello world");
});

// Routes
app.use("/api/buttons", buttonRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/users", userRoutes);

// Error handling
app.use(errorHandler);

export default app;
