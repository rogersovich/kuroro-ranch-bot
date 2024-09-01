import { Kuroro } from "./kuroro.js";
import { Helper } from "../utils/helper.js";

export class CronJob {
  constructor() {
   
  }

  async sleepAfterCron(account, kuroro) {
    await Helper.delay(
      5000,
      account,
      "Sleep for 5 seconds",
      kuroro
    );
  }

  async setupMiningCron(kuroro = new Kuroro()) {

    const account = kuroro.account ?? null
    const user = kuroro.user ?? {};
    const energy = user.energy ?? 0;

    if(energy == 0){
      await Helper.delay(
        5000,
        account,
        "Already Mined Crystal...",
        kuroro
      );
      return
    }
    
    const modEnergy = energy % 10
    if (modEnergy == 0 && energy != 0) {
      const energyForCount = energy / 10
      for (let i = 0; i < energyForCount; i++) {
        await kuroro.miningCrystal(10);

        await this.sleepAfterCron(account, kuroro);
      }
    } else if(modEnergy != 0 && energy != 0) {
      await kuroro.miningCrystal(modEnergy);
      await this.sleepAfterCron(account, kuroro);
    }

    await this.setupMiningCron(kuroro);
  }

  async setupFeedingCron(kuroro = new Kuroro()) {

    const account = kuroro.account ?? null
    const user = kuroro.user ?? {};
    const crystal = user.shards ?? 0;

    if(crystal == 0){
      await Helper.delay(
        5000,
        account,
        "Already Feeded Pet...",
        kuroro
      );
      return
    }
    
    const modCrystal = crystal % 10
    if (modCrystal == 0 && crystal != 0) {
      const crystalForCount = crystal / 10
      for (let i = 0; i < crystalForCount; i++) {
        await kuroro.feedingPet(10);

        await this.sleepAfterCron(account, kuroro);
      }
    } else if (modCrystal != 0 && crystal != 0) {
      await kuroro.feedingPet(modCrystal);
      await this.sleepAfterCron(account, kuroro);
    }

    await this.setupFeedingCron(kuroro);
  }
}