const puppeteer = require('puppeteer');

const xpath = require('./content/xpath');
const { downloadImage } = require('./util/file');

const term = process.argv[2].replace("_", " ");

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--window-size=1000,1000'],
    });

    const page = await browser.newPage();
    await page.goto('https://google.com/');

    const searchField = await page.waitForXPath(xpath.search);
    await searchField.type(`${term}${String.fromCharCode(13)}`);

    const imageButton = await page.waitForXPath(xpath.images);
    await imageButton.click();
    await page.waitForNavigation();

    let data = await page.evaluate(() => {
        const images = [];
        const len = document.getElementsByTagName("img").length - 2;

        for (let i = 1; i <= len; i++) {
            let image = new XPathEvaluator()
                .createExpression(`html[1]/body[1]/div[2]/c-wiz[1]/div[3]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[${i}]/a[1]/div[1]/img[1]`)
                .evaluate(document, XPathResult.FIRST_ORDERED_NODE_TYPE)
                .singleNodeValue;

            if (image !== null && image !== undefined) {
                if (image.dataset && image.dataset.src) {
                    images.push(image.dataset.src);
                } else {
                    images.push(image.src);
                }
            }
        }

        //window.scrollBy(0, 7000);
        return images;
    });

    await browser.close();
    downloadImage(data, term);
})();
