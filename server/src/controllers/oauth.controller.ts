import { Request, Response } from "express";
import { OnslipService } from "../services/onslip.service";
import { env } from "../config/environment";
import { logger } from "../utils/logger";
import { ApplicationError } from "../middleware/error.middleware";

export class OAuthController {
    private onslipService: OnslipService;

    constructor() {
        this.onslipService = OnslipService.getInstance();
    }

    public authorize = async (req: Request, res: Response): Promise<void> => {
        try {
            const { authorizationUrl, codeVerifier } =
                await this.onslipService.generateAuthorizationUrl();

            req.session.oauth = {
                codeVerifier,
                state: req.query.state as string,
            };
            await req.session.save();

            logger.info("Generated OAuth authorization URL");
            res.json({ authorizationUrl });
        } catch (error) {
            throw new ApplicationError("OAuth authorization failed", 500);
        }
    };

    public callback = async (req: Request, res: Response): Promise<void> => {
        try {
            const { code, error, error_description } = req.query;
            const oauthSession = req.session.oauth;

            console.log("QRY", req.query);
            console.log("SESSSION", req.session);

            if (error) {
                throw new ApplicationError(
                    `OAuth error: ${error_description || error}`,
                    400
                );
            }

            if (!code || !oauthSession?.codeVerifier) {
                throw new ApplicationError(
                    "Invalid OAuth callback parameters",
                    400
                );
            }

            const tokenResponse = await this.onslipService.exchangeCodeForToken(
                code as string,
                oauthSession.codeVerifier
            );

            console.log("token", tokenResponse);

            const isValid = await this.onslipService.verifyToken(tokenResponse);
            if (!isValid) {
                throw new ApplicationError("Invalid token received", 401);
            }

            OnslipService.reset(
                tokenResponse.access_token,
                btoa(tokenResponse.secret),
                tokenResponse.realm
            );

            delete req.session.oauth;
            await req.session.save();

            const redirectUrl = new URL(
                "/config",
                env.cors.origin.split(",")[0]
            );
            redirectUrl.searchParams.set("success", "true");
            redirectUrl.searchParams.set("state", oauthSession.state || "");
            redirectUrl.searchParams.set(
                "hawkId",
                encodeURIComponent(tokenResponse.access_token)
            );
            redirectUrl.searchParams.set(
                "key",
                encodeURIComponent(tokenResponse.secret)
            );
            redirectUrl.searchParams.set(
                "realm",
                encodeURIComponent(tokenResponse.realm)
            );

            res.redirect(redirectUrl.toString());
        } catch (error) {
            delete req.session.oauth;
            await req.session.save();

            const redirectUrl = new URL(
                "/config",
                env.cors.origin.split(",")[0]
            );
            redirectUrl.searchParams.set("error", "true");
            redirectUrl.searchParams.set(
                "message",
                error instanceof Error ? error.message : "Integration failed"
            );

            res.redirect(redirectUrl.toString());
        }
    };
}

export default new OAuthController();
