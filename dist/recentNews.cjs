"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const cheerio = require("cheerio");
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
];
const articles = [];
function ChooseTitles(source) {
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
const getLatestNews = (sourceId, numArticles) => {
    const sourceAddress = newsSources.filter(source => source.name == sourceId)[0].address;
    const sourceBase = newsSources.filter(source => source.name == sourceId)[0].base;
    try {
        axios_1.default.get(sourceAddress)
            .then(response => {
                const html = response.data;
                const $ = cheerio.load(html);
                const singleArticles = [];
                var articleTitleHTML, title, url;
                // console.log("HTML is:\n" + html);
                articleTitleHTML = ChooseTitles('ann');
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
                    });
                });

                console.log(singleArticles);

                return singleArticles;
            });
    }
    catch (err) {
        console.error(err);
        return null;
    }
};
// This function will organize full articles for Chat GPT to summarize
const consolidateNews = (params) => {
    const topNews = getLatestNews(params.source, params.numArticles);
    console.log(JSON.stringify(topNews));
    return 1;
};
consolidateNews({
    source: 'ann',
    numArticles: 3
});
