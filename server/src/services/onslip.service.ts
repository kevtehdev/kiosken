import { API, webRequestHandler } from '@onslip/onslip-360-web-api';
import { onslipConfig } from '../config/onslip.config';
import { Resource } from '../types';

export class OnslipService {
    private api: API;

    constructor() {
        API.initialize(webRequestHandler({}));
        this.api = new API(
            onslipConfig.baseUrl,
            onslipConfig.realm,
            onslipConfig.hawkId,
            onslipConfig.apiKey
        );
    }

    async listButtonMaps() {
        return this.api.listButtonMaps();
    }

    async listProducts() {
        return this.api.listProducts();
    }

    async listCampaigns() {
        return this.api.listCampaigns();
    }

    async listCustomers() {
        return this.api.listCustomers();
    }

    async getCustomer(id: number) {
        return this.api.getCustomer(id);
    }

    async listResources() {
        return this.api.listResources();
    }

    async addResource(resource: Resource) {
        const { id, ...resourceData } = resource;
        return this.api.addResource(resourceData as API.Resource);
    }

    async doCommand(command: API.Command) {
        return this.api.doCommand(command);
    }
}