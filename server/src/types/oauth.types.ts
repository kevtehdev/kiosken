import { API } from "@onslip/onslip-360-node-api";

export interface OAuthAuthorizationResponse {
    authorizationUrl: string;
}

export interface OAuthTokenResponse {
    token_type: string;     
    access_token: string;   
    secret: string;        
    algorithm: string;     
    realm: string;        
    scope?: string;        
    journal?: number;      
    location?: number;     
}

export interface OAuthSessionData {
    codeVerifier: string;
    state?: string;
}

export interface PKCEPair {
    codeChallenge: string;
    codeVerifier: string;
}

declare module 'express-session' {
    interface SessionData {
        oauth?: OAuthSessionData;
    }
}