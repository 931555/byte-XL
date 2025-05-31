
export async function getAppTitlesFromApi(category) {
  await browser.cdp('Network', 'enable');

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject('API timeout'), 7000);

    browser.on('Network.responseReceived', async ({ response, requestId }) => {
      if (response.url.includes('/api/apps') && response.status === 200) {
        try {
          const { body } = await browser.cdp('Network', 'getResponseBody', { requestId });
          const titles = JSON.parse(body)
            .filter(app => app.category === category)
            .map(app => app.title);
          clearTimeout(timeout);
          resolve(titles);
        } catch (err) {
          clearTimeout(timeout);
          reject(err);
        }
      }
    });
  });
}
