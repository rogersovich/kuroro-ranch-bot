import { API } from "../api/api.js";
import { Helper } from "../utils/helper.js";

export class Kuroro extends API {
  constructor(acc, query, queryObj, proxy) {
    super(proxy);
    this.account = acc;
    this.query = query;
    this.queryObj = queryObj;
    this.base_url = 'https://ranch-api.kuroro.com/api'
  }

  async getUser(msg = false) {
    return new Promise(async (resolve, reject) => {
      if (msg)
        await Helper.delay(1000, this.account, `Getting User Info...`, this);
      await this.fetch(
        `${this.base_url}/Game/GetPlayerState`,
        "GET",
        this.queryObj
      )
        .then(async (data) => {
          this.user = Helper.populateGetUser(data);
          if (msg)
            await Helper.delay(1000, this.account, `Succesfully Login...`, this);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async updateCoins(msg = false) {
    return new Promise(async (resolve, reject) => {
      if (msg)
        await Helper.delay(500, this.account, `Updating Coins...`, this);
      await this.fetch(
        `${this.base_url}/Game/UpdateCoinsSnapshot`,
        "POST",
        this.queryObj
      )
        .then(async () => {
          if (msg)
            await Helper.delay(500, this.account, `Succesfully Updating Coins...`, this);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async clickToSave(type) {
    return new Promise(async (resolve, reject) => {
      const payload = Helper.getPositionCursor(type)
      await this.fetch(
        `${this.base_url}/Bf/Save`,
        "POST",
        this.queryObj,
        payload
      )
        .then(async () => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async miningCrystal(mine_amount = 10) {
    return new Promise(async (resolve, reject) => {
      await this.clickToSave("mining")

      await Helper.delay(
        1000,
        this.account,
        `Try To Mining ${mine_amount} Crystal...`,
        this
      );

      const body = {
        feedAmount: 0,
        mineAmount: mine_amount
      }

      await this.fetch(
        `${this.base_url}/Clicks/MiningAndFeeding`,
        "POST",
        this.queryObj,
        body
      )
        .then(async () => {
          await Helper.delay(1000, this.account, `Claimed ${mine_amount} Crystal`, this);
          await this.updateCoins()
          await this.getUser()
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async feedingPet(feed_amount = 10) {
    return new Promise(async (resolve, reject) => {
      await this.clickToSave("feeding")

      await Helper.delay(
        1000,
        this.account,
        `Try To Feeding ${feed_amount} Pet...`,
        this
      );

      const body = {
        feedAmount: feed_amount,
        mineAmount: 0
      }

      await this.fetch(
        `${this.base_url}/Clicks/MiningAndFeeding`,
        "POST",
        this.queryObj,
        body
      )
        .then(async () => {
          await Helper.delay(1000, this.account, `Feeding ${feed_amount} Pet`, this);
          await this.updateCoins()
          await this.getUser()
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getDailyStreak() {
    return new Promise(async (resolve, reject) => {
      await this.clickToSave("random")
      await Helper.delay(
        1000,
        this.account,
        `Get Daily Streak...`,
        this
      );

      await this.fetch(
        `${this.base_url}/DailyStreak/GetState`,
        "GET",
        this.queryObj
      )
        .then(async (data) => {
          this.daily_streak = {
            currentStreak: data.currentStreak,
            isTodayClaimed: data.isTodayClaimed,
            lastClaimDate: data.lastClaimDate,
          }
          await Helper.delay(1000, this.account, `Succesfully Get Daily Streak`, this);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async claimDailyBonus() {
    return new Promise(async (resolve, reject) => {
      await this.clickToSave("random")
      await Helper.delay(
        1000,
        this.account,
        `Claim Daily Bonus...`,
        this
      );

      await this.fetch(
        `${this.base_url}/DailyStreak/ClaimDailyBonus`,
        "POST",
        this.queryObj
      )
        .then(async () => {
          await Helper.delay(1000, this.account, `Succesfully Claim Daily Bonus`, this);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async getOnboarding() {
    return new Promise(async (resolve, reject) => {

      await this.fetch(
        `${this.base_url}/Onboarding/GetOnboardingState`,
        "GET",
        this.queryObj
      )
        .then(async () => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async getCoinsEarnedAway() {
    return new Promise(async (resolve, reject) => {

      await Helper.delay(
        1000,
        this.account,
        `Claim Earned Coins...`,
        this
      );

      await this.fetch(
        `${this.base_url}/Game/CoinsEarnedAway`,
        "GET",
        this.queryObj
      )
        .then(async (value) => {
          await Helper.delay(1000, this.account, `Earned Coins ${value}`, this);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async mining() {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(500, this.account, `Try to Start Farm...`, this);
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/farming/start",
        "POST",
        this.token
      )
        .then(async (data) => {
          this.balance.farming = {
            startTime: 0,
            endTime: 0,
            earningsRate: 0,
            balance: 0,
          };
          this.balance.farming.startTime = data.startTime;
          this.balance.farming.endTime = data.endTime;
          this.balance.farming.earningsRate = data.earningsRate;
          this.balance.farming.balance = data.balance;

          await Helper.delay(500, this.account, `Farming Started...`, this);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getTasks() {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(500, this.account, `Getting Available Task...`, this);
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/tasks",
        "GET",
        this.token
      )
        .then(async (data) => {
          this.tasks = [];
          for (const item of data) {
            this.tasks.push(...item.tasks);
          }
          await Helper.delay(
            3000,
            this.account,
            `Successfully Get Tasks`,
            this
          );
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async startAndCompleteTask(taskId) {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(
        500,
        this.account,
        `Try To Complete Mission with id ${taskId}...`,
        this
      );
      await this.fetch(
        `https://game-domain.blum.codes/api/v1/tasks/${taskId}/start`,
        "POST",
        this.token
      )
        .then(async (data) => {
          if (data.status == "STARTED" || data.status == "READY_FOR_CLAIM") {
            await this.completeTask(taskId)
              .then(resolve)
              .catch((err) => reject(err));
          } else {
            resolve();
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async completeTask(taskId) {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(
        500,
        this.account,
        `Mission Completion for Task ${taskId} Started`,
        this
      );
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/tasks/" + taskId + "/claim",
        "POST",
        this.token
      )
        .then(async (data) => {
          if (data.status == "FINISHED") {
            await Helper.delay(
              500,
              this.account,
              `Mission Completion for Task ${taskId} ${data.title} ${data.status}`,
              this
            );
            resolve();
          } else {
            resolve();
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async play() {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(
        500,
        this.account,
        `Trying to play a game using play pass...`,
        this
      );
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/game/play",
        "POST",
        this.token
      )
        .then(async (data) => {
          await this.getBalance();
          const max = 250;
          const min = 100;
          await Helper.delay(
            500,
            this.account,
            `Got Game ID ${data.gameId},  Start playing`,
            this
          );
          await Helper.delay(
            30000,
            this.account,
            `Game ID ${data.gameId}, Playing for 30 Second`,
            this
          );
          await this.claimGame(
            data.gameId,
            Math.floor(Math.random() * (max - min + 1)) + min
          );

          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async claimGame(gameId, score) {
    await Helper.delay(
      500,
      this.account,
      `Claiming game ${gameId} With Score ${score}`,
      this
    );
    return new Promise(async (resolve, reject) => {
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/game/claim",
        "POST",
        this.token,
        {
          gameId: gameId,
          points: score,
        }
      )
        .then(async (data) => {
          await Helper.delay(
            10000,
            this.account,
            `Game ${gameId} Claimed with Score ${score}. Delaying For 10 Second`,
            this
          );
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async checkIn() {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(500, this.account, `Try to Check In...`, this);
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/daily-reward?offset=-420",
        "GET",
        this.token
      )
        .then(async () => {
          await this.fetch(
            "https://game-domain.blum.codes/api/v1/daily-reward?offset=-420",
            "POST",
            this.token
          )
            .then(async () => {
              await Helper.delay(
                1000,
                this.account,
                `Successfully Check In`,
                this
              );
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch(async (err) => {
          if (err.message.includes("Not Found")) {
            await Helper.delay(
              1000,
              this.account,
              `User Already Checked In`,
              this
            );
            resolve();
          } else {
            reject(err);
          }
        });
    });
  }
}
