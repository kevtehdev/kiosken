import {
    API,
    nodeRequestHandler,
    oauthPKCE,
} from "@onslip/onslip-360-node-api";
import pkg from "../../package.json";
import { Resource } from "../types";
import { env } from "../config/environment";
import { integrationConfig } from "../config/integration.config";
import { OAuthTokenResponse } from "../types/oauth.types";

export class OnslipService {
    private api: API;
    private static instance: OnslipService;

    constructor() {
        API.initialize(
            nodeRequestHandler({ userAgent: `${pkg.name}/${pkg.version}` })
        );
        this.api = new API(
            env.onslip.apiUrl,
            env.onslip.realm,
            env.onslip.hawkId,
            env.onslip.apiKey
        );
    }

    public static getInstance(): OnslipService {
        if (!OnslipService.instance) {
            OnslipService.instance = new OnslipService();
        }
        return OnslipService.instance;
    }

    // API Methods
    async listButtonMaps() {
        return await this.api.listButtonMaps();
    }

    async listProducts() {
        return await this.api.listProducts();
    }

    async listCampaigns() {
        return await this.api.listCampaigns();
    }

    async listCustomers() {
        return await this.api.listCustomers();
    }

    async getCustomer(id: number) {
        return await this.api.getCustomer(id);
    }

    async listResources() {
        return await this.api.listResources();
    }

    async addResource(resource: Resource) {
        const { id, ...resourceData } = resource;
        return await this.api.addResource(resourceData as API.Resource);
    }

    async doCommand(command: API.Command) {
        return await this.api.doCommand(command);
    }

    /**
     * Registrerar integrationen med Onslip
     */
    async registerIntegration(): Promise<API.Integration> {
        try {
            console.log(
                "Attempting to register integration with config:",
                integrationConfig.integration
            );
            const result = await this.api.addIntegration(
                integrationConfig.integration
            );
            console.log("Integration registered successfully:", result);
            return result;
        } catch (error) {
            console.error("Failed to register integration:", error);
            if (error instanceof Error) {
                throw new Error(
                    `Kunde inte registrera integration: ${error.message}`
                );
            }
            throw new Error("Kunde inte registrera integration");
        }
    }

    /**
     * Genererar en auktoriserings-URL med PKCE
     */
    public async generateAuthorizationUrl(): Promise<{
        authorizationUrl: string;
        codeVerifier: string;
    }> {
        try {
            const [codeChallenge, codeVerifier] = await oauthPKCE();

            const params = new URLSearchParams({
                client_id: integrationConfig.integration.alias,
                redirect_uri: env.onslip.redirectUri,
                response_type: "code",
                code_challenge: codeChallenge,
                code_challenge_method: "S256",
            });

            const authorizationUrl = `${
                env.onslip.authEndpoint
            }?${params.toString()}`;
            console.log("Generated authorization URL:", authorizationUrl);

            return {
                authorizationUrl,
                codeVerifier,
            };
        } catch (error) {
            console.error("Error generating authorization URL:", error);
            throw new Error("Kunde inte generera auktoriserings-URL");
        }
    }

    /**
     * Byter ut auktoriseringskoden mot en access token
     */
    public async exchangeCodeForToken(
        code: string,
        codeVerifier: string
    ): Promise<OAuthTokenResponse> {
        try {
            console.log("Attempting to exchange code for token...");
            const tokenEndpoint = `${env.onslip.tokenEndpoint}`;

            const response = await fetch(tokenEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    grant_type: "authorization_code",
                    client_id: integrationConfig.integration.alias,
                    redirect_uri: env.onslip.redirectUri,
                    code,
                    code_verifier: codeVerifier,
                }),
            });

            console.log("response", response);

            if (!response.ok) {
                const errorData = (await response.json()) as {
                    error?: string;
                    error_description?: string;
                };
                throw new Error(
                    errorData.error_description ||
                        errorData.error ||
                        "Kunde inte byta ut auktoriseringskod mot token"
                );
            }

            const tokenResponse = await response.json();
            console.log("Successfully exchanged code for token");
            return tokenResponse as OAuthTokenResponse;
        } catch (error) {
            console.error("Error exchanging code for token:", error);
            if (error instanceof Error) {
                throw new Error(
                    `Kunde inte hämta access token: ${error.message}`
                );
            }
            throw new Error("Kunde inte hämta access token");
        }
    }

    /**
     * Verifierar att en token är giltig
     */
    public async verifyToken(token: OAuthTokenResponse): Promise<boolean> {
        console.log("token", token.access_token);
        console.log("realm", token.realm);
        console.log("secret", token.secret);

        try {
            console.log("Verifying token validity...");
            const tempApi = new API(
                env.onslip.apiUrl,
                token.realm,
                token.access_token,
                token.secret
            );

            // await tempApi.listProducts();
            console.log("Token verification successful");
            return true;
        } catch (error) {
            console.error("Token validation error:", error);
            return false;
        }
    }
}

export default OnslipService.getInstance();
