import axios from 'axios';
import * as cheerio from 'cheerio';

interface NewsObject {
    title: string,
    url: string,
    source: string,
    body: string
}

interface ConsolidateNewsParams {
    source: string;
    numArticles: number;
}

// Currently 'ann' is the only source being used
const newsSources = [
    {
        name: 'mal',
        address: 'https://myanimelist.net/news',
        base: ''
    },
    {
        name: 'ann',
        address: 'https://www.animenewsnetwork.com/news/',
        base: 'https://www.animenewsnetwork.com/'
    }
]

// returns the css selector used for article titles on the respective websites
function ChooseTitles(source: string) {

    switch (source) {

        case "mal":
            return '.news-list .news-unit p.title > a';

        case "ann":
            return '.mainfeed-section .wrap h3 > a';

        default:
            console.log("No unique title selection for this source in ChooseTitles():\n" + source);
            return 'INVALID';

    }

}

// Fetches the body content of the article based on its url
async function getArticleContent(url: string) {

    let bodyContent: string = "";

    await axios.get(url)
        .then(response => {
            const html: string = response.data;
            const $: cheerio.CheerioAPI = cheerio.load(html);

            // Get each paragraph in the respective article
            $(".meat > p", html).each(function () {
                bodyContent += $(this).text();
            })

        })

    return bodyContent;
}

const getLatestNews = async (sourceId: string, numArticles: number) => {

    // Filter newsSources object to get URL for news and base URL for alternate use
    const sourceAddress = newsSources.filter(source => source.name == sourceId)[0].address;
    const sourceBase = newsSources.filter(source => source.name == sourceId)[0].base;

    let articles: Array<NewsObject> = [];

    try {
        await axios.get(sourceAddress)
            .then(async response => {
                const html: string = response.data;
                const $: cheerio.CheerioAPI = cheerio.load(html);
                var articleTitleSelector: string;

                // Get CSS selector for selecting <a> tag used for article title
                articleTitleSelector = ChooseTitles(sourceId);

                console.log("fetching...");

                // Populate obj array w/ data on each article
                for (let i = 0; i < numArticles; i++) {

                    console.log('.');

                    // '.eq()' is used to select specific index | https://cheerio.js.org/docs/basics/traversing#eq
                    const title: string = $(articleTitleSelector, html).eq(i).text();
                    const endpoint: string | undefined = $(articleTitleSelector, html).eq(i).attr('href');

                    const content: string = (
                        endpoint === undefined ?
                            "[article endpoint undefined]"
                            :
                            await getArticleContent(sourceBase + endpoint)
                    );

                    // If article content is insufficient, use the next article
                    if (content.length <= 100) {
                        numArticles++;
                        continue;
                    }

                    articles.push({
                        title,
                        url: sourceBase + endpoint,
                        source: sourceId,
                        body: content
                    })
                }

            })
    }
    catch (err) {
        console.error(err);
    }
    finally {
        return articles;
    }
}

// This function will organize full articles for Chat GPT to summarize
export const consolidateNews = async (params: ConsolidateNewsParams) => {

    const recentNews: Array<NewsObject> = await getLatestNews(params.source, params.numArticles);
    const consolidatedNews: string = (function (newsArray: Array<NewsObject>) {
        let totalNews: string = "";

        newsArray.forEach((newsItem: NewsObject) => {
            totalNews += newsItem.body + "\n---\n";
        });

        return totalNews;
    })(recentNews);

    return consolidatedNews;
};