import { Request, Response } from 'express';
import { OnslipService } from '../services/onslip.service';
import { CustomButtonMap, CustomProduct } from '../types';

export class ButtonController {
    private onslipService: OnslipService;

    constructor() {
        this.onslipService = new OnslipService();
    }

    getButtonMaps = async (req: Request, res: Response) => {
        try {
            const buttonMaps = await this.onslipService.listButtonMaps();
            const tabletButtons = buttonMaps.filter(
                (map: CustomButtonMap) =>
                    map.type === 'tablet-buttons' &&
                    map.buttons &&
                    map.buttons.length > 0
            );
            res.json(tabletButtons);
        } catch (error) {
            res.status(500).json({ error: 'Kunde inte hämta knappar' });
        }
    };

    getApiData = async (req: Request, res: Response) => {
        try {
            const [buttonMapsResponse, productsResponse] = await Promise.all([
                this.onslipService.listButtonMaps(),
                this.onslipService.listProducts()
            ]);

            const tabletButtons = buttonMapsResponse.filter(
                (map: CustomButtonMap) =>
                    map.type === 'tablet-buttons' &&
                    map.buttons &&
                    map.buttons.length > 0
            );

            const productsMap = productsResponse.reduce((acc: { [key: number]: CustomProduct }, product: CustomProduct) => {
                if (product.id) {
                    acc[product.id] = product;
                }
                return acc;
            }, {});

            res.json({
                buttonMaps: tabletButtons,
                products: productsMap
            });
        } catch (error) {
            res.status(500).json({ error: 'Kunde inte hämta API-data' });
        }
    };
}