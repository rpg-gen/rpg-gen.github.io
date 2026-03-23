import TtrpgCampaign from "../../types/ttrpg/TtrpgCampaign"
import { DEMO_CAMPAIGN_SEED } from "../../data/demo_campaign"

const DEMO_LS_KEY = "demo_campaign_data"

export function readDemoCampaign(): TtrpgCampaign {
    const raw = localStorage.getItem(DEMO_LS_KEY)
    if (raw) {
        return JSON.parse(raw) as TtrpgCampaign
    }
    // First visit — seed from bundled data
    const seed = structuredClone(DEMO_CAMPAIGN_SEED)
    localStorage.setItem(DEMO_LS_KEY, JSON.stringify(seed))
    return seed
}

export function writeDemoCampaign(campaign: TtrpgCampaign): void {
    localStorage.setItem(DEMO_LS_KEY, JSON.stringify(campaign))
}

export function resetDemoCampaign(): void {
    localStorage.removeItem(DEMO_LS_KEY)
}

export function isDemoInitialized(): boolean {
    return localStorage.getItem(DEMO_LS_KEY) !== null
}
