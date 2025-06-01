import HomePage from '../pageobjects/homepage.js';
import AppsPage from '../pageobjects/apps.js';

describe('To test Byte XL website', () => {

  async function getAppDataFromApi() {
    await browser.cdp('Network', 'enable');
    await browser.cdp('Network', 'setCacheDisabled', { cacheDisabled: true });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timed out waiting for /api/apps response'));
      }, 7000);

      let requestIdToUse = null;

      browser.on('Network.responseReceived', ({ response, requestId }) => {
        if (response.url.includes('/api/apps') && response.status === 200) {
          requestIdToUse = requestId;
        }
      });

      browser.on('Network.loadingFinished', async ({ requestId }) => {
        if (requestId !== requestIdToUse) return;

        try {
          const { body } = await browser.cdp('Network', 'getResponseBody', { requestId });
          const apiData = JSON.parse(body);

          clearTimeout(timeout);
          resolve(apiData);
        } catch (err) {
          clearTimeout(timeout);
          reject(err);
        }
      });
    });
  }

  async function getFilteredData(dataType, category) {
    const data = await getAppDataFromApi();
    const filteredTitles = data
      .filter(app => Array.isArray(app[dataType]) ? app[dataType].includes(category) : app[dataType] === category)
      .map(app => app.title);
    return filteredTitles;
  }

  async function getSortedData(sortBy) {
    const data = await getAppDataFromApi();
    if (sortBy === "recent") {
      const sortedByRecent = [...data].sort((a, b) => new Date(b.created) - new Date(a.created));
      return sortedByRecent.map(app => app.title);
    }
    else if (sortBy === "top") {
      const sortedByTop = [...data].sort((a, b) => (b.upvoteCount) - (a.upvoteCount));
      return sortedByTop.map(app => app.title);
    }


  }
  it('Verify home page', async () => {
    await HomePage.open();
    browser.pause(1000);
    await HomePage.verifyHomePage();
  });

  it('Verify app page', async () => {
    await HomePage.open();
    await HomePage.goToAppsPage();
    browser.pause(1000)
    await expect(AppsPage.searchInput).toBeExisting();
  });

  it('Verify search functionality', async () => {
    await HomePage.open();
    await HomePage.goToAppsPage();

    const keyword = 'calculator';
    await AppsPage.searchInput.setValue(keyword);
    await browser.pause(1000);

    await AppsPage.verifySearchResultsContain(keyword);
  });


  it('Verify Tech stack filter works correctly', async () => {
    const category = "React";
    await browser.cdp('Network', 'enable');

    const apiDataPromise = getFilteredData('techStack', category);

    await HomePage.open();
    await HomePage.goToAppsPage();

    const expectedTitles = await apiDataPromise;

    await AppsPage.verifyCategoryFilterWithApi(category, expectedTitles);


  })

  it('Verify category filter works correctly', async () => {
    const category = "All games";

    await browser.cdp('Network', 'enable');
    await browser.cdp('Network', 'setCacheDisabled', { cacheDisabled: true });

    const apiDataPromise = getFilteredData('category', category);

    await HomePage.open();
    await HomePage.goToAppsPage();

    const expectedTitles = await apiDataPromise;

    await AppsPage.verifyCategoryFilterWithApi(category, expectedTitles);
  });


  it('verify apps are sorted by Recent', async () => {


    await browser.url('https://bytexl.live/apps');

    const sortedData = await getSortedData("recent");

    const recentButton = await $(`//button[text()="Recent"]`);
    await recentButton.click();


    await browser.pause(2000);


    const appTitleElems = await $$('div.space-y-1 > h3');
    let appTitlesOnPage = [];
    for (const el of appTitleElems) {
      const text = await el.getText();
      appTitlesOnPage.push(text);
    }

    for (let i = 0; i < sortedData.length && i < appTitlesOnPage.length; i++) {
      expect(appTitlesOnPage[i]).toEqual(sortedData[i]);
    }
  });

  it('verify apps are sorted by Top', async () => {


    await browser.url('https://bytexl.live/apps');

    const sortedData = await getSortedData("top");

    const recentButton = await $(`//button[text()="Top"]`);
    await recentButton.click();


    await browser.pause(2000);


    const appTitleElems = await $$('div.space-y-1 > h3');
    let appTitlesOnPage = [];
    for (const el of appTitleElems) {
      const text = await el.getText();
      appTitlesOnPage.push(text);
    }

    for (let i = 0; i < sortedData.length && i < appTitlesOnPage.length; i++) {
      expect(appTitlesOnPage[i]).toEqual(sortedData[i]);
    }
  });
});


