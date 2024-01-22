import OpenAI from "openai";
import dotenv from "dotenv";
import { consolidateNews } from "./functions/recentNews"

dotenv.config();

const openai = new OpenAI({
    organization: 'org-poO0RFtzdp5bFNMdsdDTefbV',
    apiKey: process.env.OPENAI_API_KEY,
});

async function main() {

    const recentNews: string = await consolidateNews(
        {
            source: 'ann',
            numArticles: 3
        }
    );

    // AI stuff
    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: "Summarize the following news articles. Each summary should be 2 to 3 sentences and separated into its own paragraph:\n" + recentNews
            }
        ],
        stream: true,
    });
    for await (const chunk of stream) {
        process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
}

main();