import { API } from "@onslip/onslip-360-node-api";

export interface OAuthAuthorizationResponse {
    authorizationUrl: string;
}

export interface OAuthTokenResponse {
    token_type: string;      // Always 'Hawk'
    access_token: string;    // The Hawk key identifier
    secret: string;         // The Hawk key secret
    algorithm: string;      // Always 'sha256'
    realm: string;         // The realm/company alias
    scope?: string;        // Space-separated list of granted permissions
    journal?: number;      // ID of external journal if applicable
    location?: number;     // ID of location if token is location-bound
}

export interface OAuthSessionData {
    codeVerifier: string;
    state?: string;
}

export interface PKCEPair {
    codeChallenge: string;
    codeVerifier: string;
}

// För att utöka express-session med våra egna typer
declare module 'express-session' {
    interface SessionData {
        oauth?: OAuthSessionData;
    }
}