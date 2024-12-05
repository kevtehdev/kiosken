import {
    API,
    nodeRequestHandler,
    AbortController,
} from "@onslip/onslip-360-node-api";
import pkg from "../../package.json";
import { onslipConfig } from "../config/onslip.config";
import { Resource } from "../types";
import { env } from "../config/enviroment";

export class OnslipService {
    private api: API;

    constructor() {
        API.initialize(
            nodeRequestHandler({ userAgent: `${pkg.name}/${pkg.version}` })
        );
        this.api = new API(
            env.onslip.apiUrl,
            env.onslip.realm,
            env.onslip.hawkId,
            env.onslip.apiKey
        );
    }

    async listButtonMaps() {
        return await this.api.listButtonMaps();
    }

    async listProducts() {
        return await this.api.listProducts();
    }

    async listCampaigns() {
        return await this.api.listCampaigns();
    }

    async listCustomers() {
        return await this.api.listCustomers();
    }

    async getCustomer(id: number) {
        return await this.api.getCustomer(id);
    }

    async listResources() {
        return await this.api.listResources();
    }

    async addResource(resource: Resource) {
        const { id, ...resourceData } = resource;
        return await this.api.addResource(resourceData as API.Resource);
    }

    async doCommand(command: API.Command) {
        return await this.api.doCommand(command);
    }
}
