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

const getLatestNews = async (sourceId: string, numArticles: number) => {

    const sourceAddress = newsSources.filter(source => source.name == sourceId)[0].address;
    const sourceBase = newsSources.filter(source => source.name == sourceId)[0].base;

    let singleArticles: Array<Object> = [];

    try {
        await axios.get(sourceAddress)
            .then(response => {
                const html = response.data;
                const $ = cheerio.load(html);
                var articleTitleHTML: string, title: string, url: string | undefined;

                articleTitleHTML = ChooseTitles(sourceId);

                // for (let i = 0; i < numArticles; i++) {
                //     let currArticle = $(articleTitleHTML).next();

                //     title = currArticle.text();
                //     url = currArticle.attr('href');

                //     singleArticles.push({
                //         title,
                //         url: sourceBase + url,
                //         source: sourceId
                //     })
                // }

                $(articleTitleHTML, html).each(function () {
                    const title = $(this).text();
                    const url = $(this).attr('href');

                    singleArticles.push({
                        title,
                        url: sourceBase + url,
                        source: sourceId
                    })
                });

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
const consolidateNews = async (params: ConsolidateNewsParams) => {

    const topNews: Array<Object> = await getLatestNews(params.source, params.numArticles);

    console.log(topNews === null ? "singleArticles is empty" : JSON.stringify(topNews, null, 4));

    return 1;
};

consolidateNews(
    {
        source: 'ann',
        numArticles: 3
    }
);