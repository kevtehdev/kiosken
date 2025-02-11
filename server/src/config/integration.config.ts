import { API } from "@onslip/onslip-360-node-api";

export const integrationConfig: {
    integration: API.Integration;
} = {
    integration: {
        alias: "kevtehdev111",
        name: "Kiosken Integration (111)",
        type: "oauth",
        description: "Integration för Kiosken",
        author: "Kevin Johnson",
        email: "kevtehdev@dev201480",
        "web-address": "http://localhost:5173",

        categories: ["orders", "sales", "payments", "stock-balances"],

        permissions: [
            "add-external-records",
            "use-access-tokens",
            "show-products",
            "show-product-groups",
            "show-button-maps",
            "show-campaigns",
            "show-customers",
            "show-resources",
            "show-integrations",
            "show-locations",
            "show-orders",
            "edit-orders",
            "send-emails",
            "show-digital-receipts",
            "show-payment-methods",
            "show-stock-balances",
            "edit-records",
            "show-records",
            "edit-digital-receipts",
            "show-digital-receipts",
            "add-records",
            "send-emails",
            "send-digital-receipts",
            "edit-customers",
            "show-customers",
            "show-payment-methods",
            "edit-payment-methods",
            "edit-labels",
            "show-labels",
        ],

        features: ["campaigns", "stock-balances", "external-journal"],

        confinements: ["location"],

        "oauth-redirect-uris": ["http://localhost:3000/api/oauth/callback"],
    },
};

