
import "colors";
import { Helper } from "../utils/helper.js";
import input from "input";
import { Api, TelegramClient } from "telegram";
import { StoreSession } from "telegram/sessions/StoreSession.js";
import logger from "../utils/logger.js";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ACCOUNT_CONFIG, setAccountConfig } from "../config/global.js";
import { Config } from "../config/config.js";

export class Telegram {
  storeSession;

  constructor() {
    this.sessionName = "sessions";
    this.url = "https://ranch-api.kuroro.com/";
  }

  async init() {
    try {
      await this.onBoarding();
    } catch (error) {
      logger.error(`${JSON.stringify(error)}`);
      throw error;
    }
  }
  async onBoarding() {
    try {

      console.log()

      const choice = await input.text(
        `Welcome to Kuroro Ranch Bot.
        \n${'By : Rogersovich'.yellow} \n${'Account: '.yellow} ${ACCOUNT_CONFIG.TELEGRAM_NAME.yellow}
        \nLets getting started. \n${'1.'.yellow} Create Session. \n${'2.'.yellow} Reset Sessions \n${'3.'.yellow} Start Bot \n \nInput your choice :`
      );

      if (choice == 1) {
        await this.sessionCreation();
      } else if (choice == 2) {
        Helper.resetSession(this.sessionName);
        await this.onBeforeBoarding();
      } else if (choice == 3) {
        if (Helper.getSession(this.sessionName)?.length == 0) {
          console.info("You don't have any sessions, please create first");
          await this.onBoarding();
        }
      } else {
        console.error("Invalid input, Please try again");
        await this.onBoarding();
      }
    } catch (error) {
      throw error;
    }
  }

  async onBeforeBoarding() {
    try {

      let accountChoices = "Choose your Accounts\n \n";
      for (let i = 0; i < Config.ACCOUNTS.length; i++) {
        const acc = Config.ACCOUNTS[i];
        accountChoices += `${i + 1}. ${acc.TELEGRAM_NAME} (${acc.TELEGRAM_APP_ID})\n`;
      }
      accountChoices += "\n \nInput your choice:";

      const choice = await input.text(accountChoices);

      setAccountConfig(Config.ACCOUNTS[choice - 1]);

      if (
        ACCOUNT_CONFIG.TELEGRAM_APP_ID == undefined ||
        ACCOUNT_CONFIG.TELEGRAM_APP_HASH == undefined
      ) {
        throw new Error(
          "Please configure your TELEGRAM_APP_ID and TELEGRAM_APP_HASH first"
        );
      }

    } catch (error) {
      throw error;
    }
  }

  async sessionCreation() {
    try {
      const sessionList = Helper.getSession("sessions");
      let ctx = "Your session List :\n \n";

      for (const sess of sessionList) {
        ctx += `${sessionList.indexOf(sess) + 1}. ${sess}\n`;
      }

      console.log(ctx)

      const sessionName = `${ACCOUNT_CONFIG.TELEGRAM_NAME} - (${ACCOUNT_CONFIG.TELEGRAM_APP_ID})`

      const findSession = sessionList.find((item) => item == sessionName);
      if (!findSession) {
        this.sessionName = Helper.createDir(sessionName);
        logger.info(`New Session Created - ${sessionName}`);
        await this.useSession("sessions/" + sessionName);
        await this.disconnect();
        logger.info(`Session ${sessionName} - Created`);
        this.storeSession.save();
        await Helper.delay(2000);
        logger.info(`Stopping the application...`);
        process.exit(0);
      }else{
        logger.info(`Session ${sessionName} - Already Created`);
        this.sessionName = sessionName;
        await Helper.delay(2000);
        await this.init();
      }

    } catch (error) {
      throw error;
    }
  }

  async useSession(sessionName, proxy) {
    this.proxy = proxy;
    try {
      const clientOptions = {
        connectionRetries: 5,
      };

      if (this.proxy) {
        clientOptions.agent = new HttpsProxyAgent(this.proxy);
      }

      this.storeSession = new StoreSession(sessionName);
      this.client = new TelegramClient(
        this.storeSession,
        ACCOUNT_CONFIG.TELEGRAM_APP_ID,
        ACCOUNT_CONFIG.TELEGRAM_APP_HASH,
        clientOptions
      );
      this.storeSession.save();

      await this.client.start({
        phoneNumber: async () =>
          await input.text(
            "Enter your Telegram Phone Number starting with country code ex: +628xxxxxxx ?"
          ),
        password: async () => await input.text("Enter your Telegram Password?"),
        phoneCode: async () =>
          await input.text("Enter your Telegram Verification Code ?"),
        onError: (err) => {
          console.log(err.message);
        },
      });
      console.log();
    } catch (error) {
      throw error;
    }
  }

  async resolvePeer() {
    try {
      logger.info(`Session ${this.session} - Resolving Peer`);
      while (this.peer == undefined) {
        try {
          this.peer = await this.client.getEntity("KuroroRanchBot");
          break;
        } catch (error) {
          if (error instanceof FloodWaitError) {
            const fls = error.seconds;

            logger.warn(
              `${this.client.session.serverAddress} | FloodWait ${error}`
            );
            logger.info(`${this.client.session.serverAddress} | Sleep ${fls}s`);

            await Helper.delay((fls + 3) * 1000);
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async disconnect() {
    await this.client.disconnect();
    await this.client.destroy();
    this.peer = undefined;
    this.sessionName = undefined;
  }

  async initWebView(proxy) {
    try {
      const webView = await this.client.invoke(
        new Api.messages.RequestWebView({
          peer: this.peer,
          bot: this.peer,
          fromBotMenu: true,
          url: this.url,
          platform: "android",
        })
      );
      logger.info(`Session ${this.session} - Webview Connected`);

      const authUrl = webView.url;
      return Helper.getTelegramQuery(authUrl, 2);
    } catch (error) {
      throw error;
    }
  }
}
