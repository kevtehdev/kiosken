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

    private constructor(hawkId: string, secret: string, realm: string) {
        API.initialize(
            nodeRequestHandler({ userAgent: `${pkg.name}/${pkg.version}` })
        );
        this.api = new API(env.onslip.apiUrl, realm, hawkId, secret);
    }

    public static getInstance(): OnslipService {
        if (!OnslipService.instance) {
            OnslipService.instance = new OnslipService(
                env.onslip.hawkId,
                env.onslip.apiKey,
                env.onslip.realm
            );
        }
        return OnslipService.instance;
    }

    public static reset(hawkId: string, secret: string, realm: string) {
        OnslipService.instance = new OnslipService(hawkId, secret, realm);
    }

    // Journal Methods
    async addJournalRecord(order: API.Order, orderId: string) {
        try {
            if (!order.items) {
                throw new Error('Order items are required');
            }

            const items = order.items.map(item => ({
                ...item,
                amount: -(item.price || 0) * (item.quantity || 1)
            }));

            const totalAmount = items.reduce((sum, item) => sum + Math.abs(item.amount), 0);

            const externalRecord: API.ExternalRecord = {
                date: new Date().toISOString(),
                type: 'receipt',
                'timezone-offset': new Date().getTimezoneOffset(),
                'client-name': 'Onslip Kiosk',
                'cashier-name': 'Onslip',
                description: `Web order ${orderId}`,
                receipt: {
                    type: 'sale',
                    items: items,
                    payments: [{
                        method: 'card',
                        amount: -totalAmount,
                        name: 'Card Payment'
                    }],
                    change: 0,
                    rounding: 0,
                    reference: orderId,
                    'our-reference': orderId
                }
            };

            return await this.api.addExternalRecord(0, externalRecord);
        } catch (error) {
            console.error('Failed to add journal record:', error);
            throw new Error('Could not add transaction to journal');
        }
    }

    // Regular API Methods
    async listButtonMaps() {
        return await OnslipService.instance.api.listButtonMaps();
    }

    async listProducts() {
        return await OnslipService.instance.api.listProducts();
    }

    async listCampaigns() {
        return await OnslipService.instance.api.listCampaigns();
    }

    async listCustomers() {
        return await OnslipService.instance.api.listCustomers();
    }

    async getCustomer(id: number) {
        return await OnslipService.instance.api.getCustomer(id);
    }

    async listResources() {
        return await OnslipService.instance.api.listResources();
    }

    async addResource(resource: Resource) {
        const { id, ...resourceData } = resource;
        return await OnslipService.instance.api.addResource(
            resourceData as API.Resource
        );
    }

    async doCommand(command: API.Command) {
        return await OnslipService.instance.api.doCommand(command);
    }

    async addOrder(order: API.Order) {
        return await OnslipService.instance.api.addOrder(order);
    }

    async listStockBalance(location: number, query: string) {
        return await OnslipService.instance.api.listStockBalances(
            location,
            query
        );
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
            const result = await OnslipService.instance.api.addIntegration(
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

    async calcTotal(items: API.Item[]) {
        let discountedTotal = 0;

        const cartItems: API.Item[] = structuredClone(items);

        const sortedCart = cartItems.sort((item1, item2) => {
            if (item1.price && item2.price) {
                return item2.price - item1.price;
            }
            return 0;
        });

        const campaigns = await this.listCampaigns();

        const multiItemCampaigns = campaigns.filter((campaign) => {
            return (
                campaign.rules.length > 1 ||
                campaign.rules[0]?.products.length > 1
            );
        });

        multiItemCampaigns.forEach((campaign) => {
            const { amount, rules } = campaign;

            if (
                campaign.rules.length > 1 ||
                campaign.rules[0].products.length > 1
            ) {
                if (campaign.type === "cheapest-free") {
                    campaign.rules.forEach((rule) => {
                        const { quantity, products } = rule;

                        const matchedItems = products
                            .map((product) => {
                                return sortedCart.filter(
                                    (item) =>
                                        item.product === product &&
                                        item.quantity >= quantity
                                );
                            })
                            .flat();

                        if (matchedItems.length > 0) {
                            const cheapestItem = matchedItems.sort(
                                (a, b) => (a!.price || 0) - (b!.price || 0)
                            )[0];

                            if (cheapestItem) {
                                discountedTotal -= cheapestItem.price!;

                                matchedItems.forEach((item) => {
                                    if (item) {
                                        item.quantity -= 1;
                                    }
                                });
                            }
                        }
                    });
                } else if (
                    campaign.type === "fixed-price" &&
                    campaign.rules.length <= 1
                ) {
                    while (true) {
                        const eligibleProducts = sortedCart.filter((item) =>
                            rules.some((rule) =>
                                rule.products.includes(item.product!)
                            )
                        );

                        const allProducts = eligibleProducts.flatMap((item) =>
                            Array(item.quantity).fill(item)
                        );

                        const campaignQuantity = rules[0].quantity;

                        if (allProducts.length >= campaignQuantity) {
                            discountedTotal += amount!;
                            let count = campaignQuantity;

                            eligibleProducts.forEach((item) => {
                                if (count > 0 && item.quantity > 0) {
                                    const takeQuantity = Math.min(
                                        item.quantity,
                                        count
                                    );
                                    item.quantity -= takeQuantity;
                                    count -= takeQuantity;
                                }
                            });

                            if (count > 0) break;
                        } else {
                            break;
                        }
                    }
                } else if (
                    campaign.type === "fixed-amount" ||
                    campaign.type === "percentage"
                ) {
                    while (true) {
                        const eligibleProducts = sortedCart.filter((item) =>
                            rules.some((rule) =>
                                rule.products.includes(item.product!)
                            )
                        );

                        const allProducts = eligibleProducts.flatMap((item) =>
                            Array(item.quantity).fill(item)
                        );

                        const campaignQuantity = rules[0].quantity;

                        if (allProducts.length >= campaignQuantity) {
                            let totalEligiblePrice = 0;
                            let totalDiscountedPrice = 0;
                            let count = campaignQuantity;

                            eligibleProducts.forEach((item) => {
                                if (count <= 0) return;

                                const takeQuantity = Math.min(
                                    item.quantity,
                                    count
                                );
                                totalEligiblePrice +=
                                    (item.price || 0) * takeQuantity;
                                item.quantity -= takeQuantity;
                                count -= takeQuantity;
                            });

                            if (campaign.type === "fixed-amount") {
                                if (count === 0) {
                                    totalDiscountedPrice = amount!;
                                }

                                discountedTotal +=
                                    totalEligiblePrice - totalDiscountedPrice;
                            } else {
                                if (count === 0) {
                                    totalDiscountedPrice =
                                        (totalEligiblePrice *
                                            (campaign["discount-rate"] || 0)) /
                                        100;
                                }

                                discountedTotal +=
                                    totalEligiblePrice - totalDiscountedPrice;
                            }
                        }

                        break;
                    }
                } else if (rules.every((rule) => rule.products.length > 1)) {
                    while (true) {
                        const allProducts = sortedCart.flatMap((item) =>
                            item.product
                                ? Array(item.quantity).fill(item.product)
                                : []
                        );

                        const campaignQuantity = rules[0].quantity;

                        if (allProducts.length < campaignQuantity) break;

                        let count = campaignQuantity;
                        let foundMatch = false;

                        sortedCart.forEach((item) => {
                            const isProductInCampaign = rules.some((rule) =>
                                rule.products.includes(item.product!)
                            );

                            if (
                                isProductInCampaign &&
                                count > 0 &&
                                item.quantity > 0
                            ) {
                                foundMatch = true;
                                const takeQuantity = Math.min(
                                    item.quantity,
                                    count
                                );
                                discountedTotal += amount!;

                                item.quantity -= takeQuantity;
                                count -= takeQuantity;
                            }
                        });

                        if (!foundMatch || count <= 0) break;
                    }
                } else {
                    while (true) {
                        const matchedItems = rules.map((rule) => {
                            const { quantity, products } = rule;
                            return sortedCart.find(
                                (item) =>
                                    products.includes(item.product!) &&
                                    item.quantity >= quantity
                            );
                        });
                        if (matchedItems.some((item) => !item)) {
                            break;
                        }
                        matchedItems.forEach((item, index) => {
                            item!.quantity -= rules[index].quantity;
                        });
                        discountedTotal += amount!;
                    }
                }
            }
        });

        const prices = await Promise.all(
            sortedCart.map((item) => this.getCampaignPriceForItem(item))
        );

        const remainingTotal = prices.reduce((sum, price) => sum + price, 0);

        let total = discountedTotal + remainingTotal;

        const fullCampaigns = campaigns.filter((campaign) => {
            return (
                campaign.type === "tab-fixed-amount" ||
                campaign.type === "tab-percentage"
            );
        });

        fullCampaigns.forEach((campaign) => {
            switch (campaign.type) {
                case "tab-fixed-amount":
                    if (campaign.amount) {
                        total = total - campaign.amount;
                    }
                    break;
                case "tab-percentage":
                    if (campaign["discount-rate"]) {
                        total =
                            total *
                            (1 - (campaign["discount-rate"] || 0) / 100);
                    }
                    break;
                default:
                    break;
            }
        });

        return total;
    }

    async getCampaignPriceForItem(item: API.Item): Promise<number> {
        const { quantity, price } = item;

        if (price == undefined || quantity == undefined) {
            return 0;
        }

        const campaign = await this.findBestCampaign(item.product!);

        let reducedPrice = price * quantity;

        if (!campaign) return reducedPrice;

        if (campaign.rules.length > 1) {
            return reducedPrice;
        }

        switch (campaign.type) {
            case "fixed-amount":
                if (quantity >= campaign.rules[0]?.quantity) {
                    const requiredQuantity = campaign.rules[0]?.quantity || 1;
                    const divisibleUnits = Math.floor(
                        quantity / requiredQuantity
                    );
                    reducedPrice =
                        price * quantity -
                        (campaign.amount || 0) * divisibleUnits;
                    break;
                }
            case "percentage":
                if (quantity >= campaign.rules[0]?.quantity) {
                    const requiredQuantity = campaign.rules[0]?.quantity || 1;
                    const divisibleUnits = Math.floor(
                        quantity / requiredQuantity
                    );
                    const remainingQuantity = quantity % requiredQuantity;

                    reducedPrice =
                        price *
                            requiredQuantity *
                            divisibleUnits *
                            (1 - (campaign["discount-rate"] || 0) / 100) +
                        remainingQuantity * price;
                    break;
                }
            case "fixed-price":
                if (quantity >= campaign.rules[0]?.quantity) {
                    const requiredQuantity = campaign.rules[0]?.quantity || 1;
                    const remainingQuantity = quantity % requiredQuantity;
                    const divisibleUnits = Math.floor(
                        quantity / requiredQuantity
                    );

                    reducedPrice =
                        campaign.amount! * divisibleUnits +
                        price * remainingQuantity;
                }
                break;
            case "cheapest-free":
                if (quantity >= campaign.rules[0].quantity) {
                    const freeItems = Math.floor(
                        quantity / campaign.rules[0].quantity
                    );
                    const discount = freeItems * price;
                    reducedPrice = price * quantity - discount;
                    break;
                }
                break;
            default:
                break;
        }

        return reducedPrice;
    }

    async findBestCampaign(productId: number): Promise<API.Campaign | null> {
        const campaigns = await OnslipService.instance.api.listCampaigns();
        const filteredCampaigns = campaigns.filter((campaign) =>
            campaign.rules.some((rule) => rule.products.includes(productId))
        );

        const product = await OnslipService.instance.api.getProduct(productId);
        const productPrice = product.price;

        if (!filteredCampaigns.length || productPrice == undefined) return null;

        return filteredCampaigns.reduce<API.Campaign | null>(
            (bestCampaign, currentCampaign) => {
                let currentReducedPrice = productPrice;
                let bestReducedPrice = productPrice;

                if (bestCampaign) {
                    switch (bestCampaign.type) {
                        case "fixed-amount":
                            bestReducedPrice =
                                productPrice - (bestCampaign.amount || 0);
                            break;
                        case "percentage":
                            bestReducedPrice =
                                productPrice *
                                (1 -
                                    (bestCampaign["discount-rate"] || 0) / 100);
                            break;
                        case "fixed-price":
                            bestReducedPrice =
                                bestCampaign.amount || productPrice;
                            break;
                        default:
                            break;
                    }
                }

                switch (currentCampaign.type) {
                    case "fixed-amount":
                        currentReducedPrice =
                            productPrice - (currentCampaign.amount || 0);
                        break;
                    case "percentage":
                        currentReducedPrice =
                            productPrice *
                            (1 - (currentCampaign["discount-rate"] || 0) / 100);
                        break;
                    case "fixed-price":
                        currentReducedPrice =
                            currentCampaign.amount || productPrice;
                        break;
                    default:
                        break;
                }

                return !bestCampaign || currentReducedPrice < bestReducedPrice
                    ? currentCampaign
                    : bestCampaign;
            },
            null
        );
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