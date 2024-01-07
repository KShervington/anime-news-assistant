import axios from 'axios';
import * as cheerio from 'cheerio';

const PORT = process.env.PORT || 8000;
const express = require('express');
const app = express();

const newsSources = [
    {
        name: 'cr',
        address: 'https://www.crunchyroll.com/news',
        base: 'https://www.crunchyroll.com'
    },
    {
        name: 'mal',
        address: 'https://myanimelist.net/news',
        base: ''
    },
    {
        name: 'red',
        address: 'https://www.reddit.com/r/anime/new/?f=flair_name%3A%22News%22',
        base: 'https://www.reddit.com'
    },
    {
        name: 'ann',
        address: 'https://www.animenewsnetwork.com/news/',
        base: 'https://www.animenewsnetwork.com/'
    }
]

const articles: Array<Object> = [];

newsSources.forEach(source => {

    axios.get(source.address)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            var articleTitles;

            // Select titles based on news source
            articleTitles = ChooseTitles(source.name);

            $(articleTitles, html).each(function () {
                const title: string = $(this).text();
                const url: string | undefined = $(this).attr('href');

                articles.push({
                    title,
                    url: source.base + url,
                    source: source.name
                })
            });

        }).catch((err) => console.log(err));

});

app.get('/', (req, res) => {
    res.json('Welcome to my anime news API.');
})

app.get('/news', (req, res) => {

    res.json(articles);

})

app.get('/news/:sourceId', (req, res) => {
    const sourceId = req.params.sourceId;

    const sourceAddress = newsSources.filter(source => source.name == sourceId)[0].address;
    const sourceBase = newsSources.filter(source => source.name == sourceId)[0].base;

    axios.get(sourceAddress)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            const singleArticles: Array<Object> = [];
            var articleTitles;

            articleTitles = ChooseTitles(sourceId);

            $(articleTitles, html).each(function () {
                const title = $(this).text();
                const url = $(this).attr('href');

                singleArticles.push({
                    title,
                    url: sourceBase + url,
                    source: sourceId
                })
            });

            res.json(singleArticles);

        }).catch((err) => console.log(err));
})

function ChooseTitles(source) {

    switch (source) {
        case "cr":
            return '.news-left .news h2 > a';

        case "mal":
            return '.news-list .news-unit p.title > a';

        case "red":
            // TODO:
            // Find a way to to get more posts included in response 
            return 'a.SQnoC3ObvgnGjWt90zD9Z';

        case "ann":
            return '.mainfeed-section .wrap h3 > a';

        default:
            console.log("No unique title selection for this source in ChooseTitles():\n" + source);
            return 'INVALID';

    }

}

app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));