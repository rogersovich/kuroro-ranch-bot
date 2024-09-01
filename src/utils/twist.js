import { Twisters } from "twisters";
import logger from "./logger.js";
import { Kuroro } from "../bot/kuroro.js";
import { Helper } from "./helper.js";

class Twist {
  constructor() {
    /** @type  {Twisters}*/
    this.twisters = new Twisters();
  }

  /**
   * @param {string} acc
   * @param {Kuroro} kuroro
   * @param {string} msg
   * @param {string} delay
   */
  log(msg = "", acc = "", kuroro = new Kuroro(), delay) {
    if (delay == undefined) {
      logger.info(`${acc.id} - ${msg}`);
      delay = "-";
    }

    const user = kuroro.user ?? {};
    const energy = user.energy ?? 0;
    const crystal = user.shards ?? 0;
    const lastName = `${kuroro.lastTask?.name ?? ""}`;

    //     const farm = balance.farming
    //       ? `${Helper.readTime(balance.farming.startTime)} - ${Helper.readTime(
    //           balance.farming.endTime
    //         )} Rate: ${balance.farming.earningsRate} Balance : ${
    //           balance.farming.balance
    //         }  ${
    //           Helper.isFutureTime(balance.farming.endTime)
    //             ? "(Claimable)"
    //             : "(Unclaimable)"
    //         }`
    //       : "-";

    //     const task = blum.tasks ?? [];
    //     const completedTask = task.length != 0 ? task.length : "-";
    //     const uncompletableTaskIds = [
    //       "a90d8b81-0974-47f1-bb00-807463433bde",
    //       "03e4a46f-7588-4950-8289-f42787e3eca2",
    //     ];
    //     const uncompletedTask =
    //       task.length > 0
    //         ? task.filter(
    //             (item) =>
    //               item.status !== "FINISHED" &&
    //               item.type !== "WALLET_CONNECTION" &&
    //               item.type !== "PROGRESS_TARGET" &&
    //               !uncompletableTaskIds.includes(item.id) &&
    //               item.subtask != undefined
    //           ).length
    //         : "-";

    this.twisters.put(acc.id, {
      text: `
      ================= Account ${acc.id} =============
      Name      : ${acc.firstName} ${lastName}
      Energy    : ${energy}
      Crystal   : ${crystal}

      Status : ${msg}
      Delay : ${delay}
      ==============================================`,
    });

    // this.twisters.put(acc.id, {
    //   text: `
    // ================= Account ${acc.id} =============
    // Name      : ${acc.firstName} ${acc.lastName}
    // Energy    : ${energy}
    // Crystal   : ${crystal}
    // Farm      : ${farm}
    // Task      : ${completedTask} Completed | ${uncompletedTask} Uncompleted

    // Status : ${msg}
    // Delay : ${delay}
    // ==============================================`,
    // });
  }

  /**
   * @param {string} msg
   */
  info(msg = "") {
    this.twisters.put(2, {
      text: `
==============================================
Info : ${msg}
==============================================`,
    });
    return;
  }

  clearInfo() {
    this.twisters.remove(2);
  }

  clear(acc) {
    this.twisters.remove(acc);
  }
}

export default new Twist();
