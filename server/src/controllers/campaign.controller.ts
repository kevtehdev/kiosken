import { Request, Response } from "express";
import { OnslipService } from "../services/onslip.service";
import { Campaign, ProductCampaign, CampaignRule } from "../types";
import { API } from "@onslip/onslip-360-node-api";

export class CampaignController {
    private onslipService: OnslipService;

    constructor() {
        this.onslipService = new OnslipService();
    }

    getCampaigns = async (req: Request, res: Response) => {
        try {
            const campaigns = await this.onslipService.listCampaigns();
            const filteredCampaigns = campaigns
                .filter((campaign: API.Stored_Campaign) =>
                    this.isValidCampaign(campaign)
                )
                .map(this.convertToCampaign);
            res.json(filteredCampaigns);
        } catch (error) {
            res.status(500).json({ error: "Kunde inte hämta kampanjer" });
        }
    };

    findCampaignsForProduct = async (req: Request, res: Response) => {
        try {
            const { campaigns, productId } = req.body;
            const productCampaigns = this.findProductCampaigns(
                campaigns,
                Number(productId)
            );
            res.json(productCampaigns);
        } catch (error) {
            res.status(500).json({
                error: "Kunde inte hitta kampanjer för produkten",
            });
        }
    };

    calculateDiscountedPrice = async (req: Request, res: Response) => {
        try {
            const { originalPrice, campaign } = req.body;
            const discountedPrice = this.calculateDiscount(
                originalPrice,
                campaign
            );
            res.json({ discountedPrice });
        } catch (error) {
            res.status(500).json({
                error: "Kunde inte beräkna rabatterat pris",
            });
        }
    };

    private isValidCampaign = (campaign: API.Stored_Campaign): boolean => {
        return !!(
            campaign.id &&
            campaign.name &&
            campaign.type &&
            Array.isArray(campaign.rules)
        );
    };

    private convertToCampaign = (
        apiCampaign: API.Stored_Campaign
    ): Campaign => {
        return {
            id: apiCampaign.id!,
            name: apiCampaign.name,
            type: apiCampaign.type,
            rules: apiCampaign.rules.map((rule) => ({
                quantity: rule.quantity,
                products: rule.products,
                labels: (rule.labels || []).map(String), // Konvertera number[] till string[]
            })),
            "discount-rate": apiCampaign["discount-rate"],
            amount: apiCampaign.amount,
        };
    };

    private findProductCampaigns(
        campaigns: Campaign[],
        productId: number
    ): ProductCampaign[] {
        return campaigns
            .filter((campaign) =>
                campaign.rules.some((rule) => rule.products.includes(productId))
            )
            .map((campaign) => {
                const rule = campaign.rules.find((r) =>
                    r.products.includes(productId)
                );

                if (!campaign.id) {
                    return null;
                }

                const productCampaign: ProductCampaign = {
                    id: campaign.id,
                    name: campaign.name,
                    type: campaign.type,
                    discountRate: campaign["discount-rate"],
                    amount: campaign.amount,
                    quantity: rule?.quantity,
                };

                return productCampaign;
            })
            .filter(
                (campaign): campaign is ProductCampaign => campaign !== null
            );
    }

    findBestCampaign = async (req: Request, res: Response) => {
        try {
            const id = Number(req.body.id);
            const campaign = await this.onslipService.findBestCampaign(id);
            res.json(campaign);
        } catch (error) {
            console.error("Error in findBestCampaign:", error);
            res.status(500).json({
                error: "Kunde inte beräkna rabatterat pris",
            });
        }
    };

    private calculateDiscount(
        originalPrice: number,
        campaign: ProductCampaign
    ): number {
        switch (campaign.type) {
            case "percentage":
                if (campaign.discountRate) {
                    return originalPrice * (1 - campaign.discountRate / 100);
                }
                return originalPrice;

            case "fixed-amount":
                if (campaign.amount) {
                    return Math.max(0, originalPrice - campaign.amount);
                }
                return originalPrice;

            case "cheapest-free":
                if (campaign.quantity && campaign.quantity > 1) {
                    return (
                        originalPrice *
                        ((campaign.quantity - 1) / campaign.quantity)
                    );
                }
                return originalPrice;

            case "fixed-price":
                if (campaign.amount) {
                    return campaign.amount;
                }
                return originalPrice;

            default:
                return originalPrice;
        }
    }
}
