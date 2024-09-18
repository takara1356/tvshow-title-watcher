import { Hono } from "hono";
import * as cheerio from "cheerio";

const app = new Hono();

// 作成したSlackワークフローのWebhook URLを設定する
const SLACK_WORKFLOW_URL = "";

// 検索キーワードを設定する
const KEYWORD = "テクノロジー";

const formatStartTime = (startTime: string): string => {
  const year = startTime.slice(0, 4);
  const month = startTime.slice(4, 6);
  const day = startTime.slice(6, 8);
  const hour = startTime.slice(8, 10);
  const minute = startTime.slice(10, 12);
  return `${year}/${month}/${day} ${hour}:${minute}`;
};

const sendSlackNotification = async (message: string) => {
  try {
    await fetch(SLACK_WORKFLOW_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ detail: message }),
    });
  } catch (error) {
    console.error("Slackへのリクエスト送信に失敗しました:", error);
  }
};

const scrapeTVProgram = async (keyword: string): Promise<string[]> => {
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const URL = `https://bangumi.org/epg/td?broad_cast_date=${today}&ggm_group_id=42`;

  try {
    const response = await fetch(URL);
    const html = await response.text();
    const $ = cheerio.load(html);

    const matchedPrograms: string[] = [];
    $("li").each((_, el) => {
      const title = $(el).find(".program_title").text();
      const detail = $(el).find(".program_detail").text();
      const startTimeRaw = $(el).attr("s");

      if (startTimeRaw) {
        const startTime = formatStartTime(startTimeRaw);

        if (title.includes(keyword) || detail.includes(keyword)) {
          matchedPrograms.push(
            `🕒 開始時間: ${startTime} 🕒\n🎬 タイトル: ${title} 🎬\n📄 内容: ${detail} 📄\n`
          );
        }
      }
    });
    return matchedPrograms;
  } catch (error) {
    console.error("番組表のスクレイピングに失敗しました:", error);
    return [];
  }
};

// サーバーとして起動する場合はこちらを有効化する
// app.fire();

export default {
  async scheduled(event: ScheduledEvent) {
    const matchedPrograms = await scrapeTVProgram(KEYWORD);

    if (matchedPrograms.length > 0) {
      const message = `🔥 本日、${KEYWORD}に関連する番組が放送されます！ 🔥\n\n${matchedPrograms.join(
        "\n"
      )}\nお見逃しなく！🚀`;
      await sendSlackNotification(message);
    } else {
      const message = `😞 本日は「${KEYWORD}」に関連する番組が見つかりませんでした。`;
      await sendSlackNotification(message);
    }
  },
};
