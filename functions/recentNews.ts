import axios from 'axios';
import * as cheerio from 'cheerio';

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

const articles: Array<Object> = [];

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

async function getArticleContent(url: string) {

    let bodyContent: string = "";

    await axios.get(url)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            $(".meat > p", html).each(function () {
                bodyContent += $(this).text();
            })

        })

    return bodyContent;
}

const getLatestNews = async (sourceId: string, numArticles: number) => {

    const sourceAddress = newsSources.filter(source => source.name == sourceId)[0].address;
    const sourceBase = newsSources.filter(source => source.name == sourceId)[0].base;

    let singleArticles: Array<Object> = [];

    try {
        await axios.get(sourceAddress)
            .then(async response => {
                const html = response.data;
                const $ = cheerio.load(html);
                var articleTitleSelector: string;

                articleTitleSelector = ChooseTitles(sourceId);

                // NEW new way to push to article object
                for (let i = 0; i < numArticles; i++) {

                    // '.eq()' is used to select specific index | https://cheerio.js.org/docs/basics/traversing#eq
                    const title = $(articleTitleSelector, html).eq(i).text();
                    const endpoint = $(articleTitleSelector, html).eq(i).attr('href');

                    const content: string = await getArticleContent(sourceBase + endpoint);

                    singleArticles.push({
                        title,
                        url: sourceBase + endpoint,
                        source: sourceId,
                        body: content
                    })
                }

                // NEW way to push to article object
                // for (const article of $(articleTitleSelector, html)) {
                //     const title = $(article).text();
                //     const endpoint = $(article).attr('href');

                //     const content: string = await getArticleContent(sourceBase + endpoint);

                //     singleArticles.push({
                //         title,
                //         url: sourceBase + endpoint,
                //         source: sourceId,
                //         body: content
                //     })
                // }

                // OLD way to push to article object
                // $(articleTitleSelector, html).each(function () {
                //     const title = $(this).text();
                //     const endpoint = $(this).attr('href');

                //     // TODO: need to figure out how to populate this var
                //     const content: string = await getArticleContent(sourceBase + endpoint);

                //     singleArticles.push({
                //         title,
                //         url: sourceBase + endpoint,
                //         source: sourceId,
                //         body: content
                //     })
                // });

            })
    }
    catch (err) {
        console.error(err);
    }
    finally {

        return singleArticles;
    }
}

interface ConsolidateNewsParams {
    source: string;
    numArticles: number;
}

// This function will organize full articles for Chat GPT to summarize
export const consolidateNews = async (params: ConsolidateNewsParams) => {

    const recentNews: Array<Object> = await getLatestNews(params.source, params.numArticles);

    return recentNews;
};

const main = async () => {
    const body: string = await getArticleContent("https://www.animenewsnetwork.com//news/2024-01-13/sanrio-wanpaku-touken-ranbu-project-has-anime-in-the-works/.206437");

    console.log(body === undefined ? "\'body\' is undefined" : body);
}