import HomePage from '../pageobjects/homepage.js';
import AppsPage from '../pageobjects/apps.js';

describe('To test Byte XL website', () => {

    async function getAppDataFromApi(dataType,category) {
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
        console.log(apiData)
        const filteredTitles = apiData
          .filter(app => Array.isArray(app[dataType])? app[dataType].includes(category): app[dataType] === category)
          .map(app => app.title);
console.log(filteredTitles)
        clearTimeout(timeout);
        resolve(filteredTitles);
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });
  });
}



    //   it('Verify home page', async () => {
    //     await HomePage.open();
    //     await HomePage.verifyHomePage();
    //   });

    //   it('Verify app page', async () => {
    //     await HomePage.open();
    //     await HomePage.goToAppsPage();
    //     await expect(AppsPage.searchInput).toBeDisplayed();
    //   });

    //   it('Verify search functionality', async () => {
    //     await HomePage.open();
    //     await HomePage.goToAppsPage();

    //     const keyword = 'calculator';
    //     await AppsPage.searchInput.setValue(keyword);
    //     await browser.pause(2000);

    //     await AppsPage.verifySearchResultsContain(keyword);
    //   });

      it('Verify recent sort functionality', async () => {
        const category = "";
        await browser.cdp('Network', 'enable');

        const apiDataPromise = getAppDataFromApi('updated',category);

        await HomePage.open();
        await HomePage.goToAppsPage();

        await AppsPage.sortButton('Recent').click();
        await browser.pause(2000);
        await AppsPage.verifySortingDifference();
      });

//     it('Verify Tech stack filter works correctly', async ()=>{
//         const category = "React";
//         await browser.cdp('Network', 'enable');

//         const apiDataPromise = getAppDataFromApi('techStack',category);

//         await HomePage.open();
//         await HomePage.goToAppsPage();

//         const expectedTitles = await apiDataPromise;

//         await AppsPage.verifyCategoryFilterWithApi(category, expectedTitles);
        

//     })

//     it('Verify category filter works correctly', async () => {
//   const category = "All games";

//   await browser.cdp('Network', 'enable');
//   await browser.cdp('Network', 'setCacheDisabled', { cacheDisabled: true });

//   const apiDataPromise = getAppDataFromApi('category',category);

//   await HomePage.open();
//   await HomePage.goToAppsPage();

//   const expectedTitles = await apiDataPromise;

//   await AppsPage.verifyCategoryFilterWithApi(category, expectedTitles);
// });




});

