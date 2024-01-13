import OpenAI from "openai";
import dotenv from "dotenv";
import { consolidateNews } from "./functions/recentNews"

dotenv.config();

const openai = new OpenAI({
    organization: 'org-poO0RFtzdp5bFNMdsdDTefbV',
    apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
    // AI stuff
    // const stream = await openai.chat.completions.create({
    //     model: "gpt-3.5-turbo",
    //     messages: [{ role: "user", content: "Say this is a test" }],
    //     stream: true,
    // });
    // for await (const chunk of stream) {
    //     process.stdout.write(chunk.choices[0]?.delta?.content || "");
    // }

    const recentNews: Array<Object> = await consolidateNews(
        {
            source: 'ann',
            numArticles: 4
        }
    );

    console.log(JSON.stringify(recentNews, null, 4));
}

main();