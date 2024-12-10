import { Router } from "express";
import { CampaignController } from "../controllers/campaign.controller";

const router = Router();
const campaignController = new CampaignController();

router.get("/", campaignController.getCampaigns);
router.post("/product-campaigns", campaignController.findCampaignsForProduct);
router.post("/calculate-discount", campaignController.calculateDiscountedPrice);
router.post("/find-best", campaignController.findBestCampaign);

export default router;
