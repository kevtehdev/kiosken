import { Request, Response } from 'express';
import { OnslipService } from '../services/onslip.service';
import { Resource } from '../types';

export class ResourceController {
    private onslipService: OnslipService;

    constructor() {
        this.onslipService = new OnslipService();
    }

    getResources = async (req: Request, res: Response) => {
        try {
            const resources = await this.onslipService.listResources();
            res.json(resources);
        } catch (error) {
            res.status(500).json({ error: 'Kunde inte hämta resurser' });
        }
    };

    createResource = async (req: Request, res: Response) => {
        try {
            const resourceData: Omit<Resource, 'id'> = req.body;
            const newResource = await this.onslipService.addResource(resourceData);
            res.status(201).json(newResource);
        } catch (error) {
            res.status(500).json({ error: 'Kunde inte skapa resurs' });
        }
    };
}