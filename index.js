import { Kuroro } from "./src/bot/kuroro.js";
import { Config } from "./src/config/config.js";
import { proxyList } from "./src/config/proxy_list.js";
import { Telegram } from "./src/core/telegram.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";
import { CronJob } from "./src/bot/cron.js";
import input from "input";
import { ACCOUNT_CONFIG, setAccountConfig } from "./src/config/global.js";

let init = false;
async function startBot() {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`BOT STARTED`);

      if (Config.ACCOUNTS.length == 0) {
        throw new Error("Please configure your ACCOUNTS first");
      }

      
      const tele = await new Telegram();

      await tele.onBeforeBoarding()

      if (init == false) {
        await tele.init();
        init = true;
      }

      const sessionList = Helper.getSession("sessions");

      const paramList = [];

      //? USING PROXY
      if (proxyList.length > 0) {
        if (sessionList.length != proxyList.length) {
          reject(
            `You have ${sessionList.length} Session but you provide ${proxyList.length} Proxy`
          );
        }
      }

      const sessionName = `${ACCOUNT_CONFIG.TELEGRAM_NAME} - (${ACCOUNT_CONFIG.TELEGRAM_APP_ID})`

      const sessionIdx = sessionList.findIndex((item) => item == sessionName);

      if (sessionIdx == -1) {
        reject(`Session ${sessionName} - Not Found`);
        console.info("Your Session not found, please create first");
        await tele.onBoarding();
      }

      const acc = sessionList[sessionIdx];

      const proxy = proxyList.length > 0 ? proxyList[sessionIdx] : undefined;

      await tele.useSession("sessions/" + acc, proxy);
      tele.session = acc;
      const user = await tele.client.getMe();
      const query = await tele
        .resolvePeer()
        .then(async () => {
          return await tele.initWebView();
        })
        .catch((err) => {
          throw err;
        });
      
      const queryObj = Helper.queryToJSON(query);
      await tele.disconnect();
      paramList.push([user, query, queryObj, proxy]);

      const promiseList = paramList.map(async (data) => {
        const account = data[0];
        const query = data[1];
        const queryObj = data[2];
        const proxy = data[3];
        await runOperation(account, query, queryObj, proxy);
      });

      await Promise.all(promiseList);
      resolve();
    } catch (error) {
      logger.info(`BOT STOPPED`);
      logger.error(JSON.stringify(error));
      reject(error);
    }
  });
}

async function runOperation(acc, query, queryObj, proxy) {
  logger.clear();
  try {
    const kuroro = new Kuroro(acc, query, queryObj, proxy);
    const cronJob = new CronJob();

    await kuroro.getUser(true);
    await kuroro.clickToSave("random")
    await kuroro.getOnboarding()
    await kuroro.getCoinsEarnedAway()
    await kuroro.updateCoins()
    await kuroro.getDailyStreak()

    if(!kuroro.daily_streak.isTodayClaimed){
      await kuroro.claimDailyBonus();
    }else{
      await Helper.delay(1000, kuroro.account, `Already Claimed Daily Bonus`, kuroro);
    }

    await cronJob.setupMiningCron(kuroro);
    await cronJob.setupFeedingCron(kuroro);

    // await blum.getUser(true);
    // await blum.getBalance(true);
    // await blum.getTasks();
    // await blum.checkIn();
    // if (blum.balance.farming) {
    //   if (Helper.isFutureTime(blum.balance.farming.endTime)) {
    //     await blum.claim();
    //   }
    // }
    // await blum.mining();
    // const uncompletableTaskIds = [
    //   "a90d8b81-0974-47f1-bb00-807463433bde",
    //   "03e4a46f-7588-4950-8289-f42787e3eca2",
    // ];

    // const uncompletedTasks = blum.tasks.filter(
    //   (task) =>
    //     task.status !== "FINISHED" &&
    //     task.type !== "WALLET_CONNECTION" &&
    //     task.type !== "PROGRESS_TARGET" &&
    //     !uncompletableTaskIds.includes(task.id) &&
    //     task.subtask != undefined
    // );
    // for (const task of uncompletedTasks) {
    //   if (task.status === "NOT_STARTED") {
    //     await blum.startAndCompleteTask(task.id);
    //   } else {
    //     await blum.completeTask(task.id);
    //   }
    // }

    // while (blum.balance.playPasses > 0) {
    //   var err = false;
    //   await blum.play().catch(() => {
    //     err = true;
    //   });
    //   if (err) {
    //     await Helper.delay(
    //       3000,
    //       acc,
    //       "Failed to play game something wen't wrong",
    //       blum
    //     );
    //     logger.error(err);
    //     break;
    //   }
    // }

    await Helper.delay(
      10 * 60 * 1000,
      acc,
      "Account Processing Complete, Delaying for 10 minutes",
      kuroro
    );
    await runOperation(acc, query, queryObj, proxy);
  } catch (error) {
    await Helper.delay(
      10000,
      acc,
      `Error : ${error}, Retrying after 10 Second`
    );
    await runOperation(acc, query, queryObj, proxy);
  }
}

(async () => {
  try {
    logger.info("");
    logger.clear();
    logger.info("Application Started");
    await startBot();
  } catch (error) {
    console.error("Error in main process:", error);
    logger.info(`Application Error : ${error}`);
    throw error;
  }
})();
