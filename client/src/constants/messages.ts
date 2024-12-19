export const MESSAGES = {
    LOADING: {
        PRODUCTS: 'Laddar produkter...',
        CAMPAIGNS: 'Laddar kampanjer...',
        PAYMENT: 'Förbereder betalning...',
    },
    EMPTY_STATES: {
        PRODUCTS: {
            TITLE: 'Inga produkter tillgängliga',
            DESCRIPTION: 'Det finns inga produkter att visa just nu.',
        },
        CAMPAIGNS: {
            TITLE: 'Inga kampanjer tillgängliga',
            DESCRIPTION: 'Det finns inga aktiva kampanjer just nu.',
        },
        CART: {
            TITLE: 'Din varukorg är tom',
            DESCRIPTION: 'Lägg till produkter för att komma igång med din beställning',
        },
    },
    ACTIONS: {
        REFRESH: 'Dra för att uppdatera',
        UPDATING: 'Uppdaterar...',
        HIDE_OUT_OF_STOCK: 'Göm Slut',
        CLEAR_CART: 'Rensa varukorg',
        SELECT_DELIVERY: 'Välj leveransplats först',
        PROCEED_TO_PAYMENT: 'Gå till betalning',
    },
    ERRORS: {
        LOAD_RESOURCES: 'Kunde inte ladda leveransplatser',
        PAYMENT_FAILED: 'Betalningen kunde inte initieras',
        NO_CHECKOUT_URL: 'Ingen checkout-URL mottagen',
        GENERAL: 'Ett fel uppstod',
    },
} as const;
