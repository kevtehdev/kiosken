import { API } from "@onslip/onslip-360-node-api";

export const integrationConfig: { integration: API.Integration } = {
    integration: {
        alias: "kiosk",
        name: "Kiosken Integration",
        type: "oauth",
        description: "Integration för Kiosken-applikationen",
        author: "Kevin Johnson",
        email: "kevtehdev@dev201480",
        "web-address": "http://localhost:5173",

        categories: [
            "orders",
            "sales",
            "payments",
        ] as API.StatusEvent.Category[],

        permissions: [] as API.Permission[],

        // Features måste vara tomma eller innehålla bara de features som är explicit definierade i API:et
        features: [] as API.CompanyFeature.Flag[],

        confinements: [
            "authorization",
            "location",
        ] as API.Integration.Confinement[],

        "oauth-redirect-uris": ["http://localhost:3000/api/oauth/callback"],
    },
};