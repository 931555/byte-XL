class AppsPage {
  get searchInput() { return $('input[placeholder="Search apps..."]'); }
  get appTitles() { return $$('div.space-y-1>h3'); }
  get appDescriptions() { return $$('div.space-y-1>div>p'); }

  sortButton(label) {
    return $(`//button[text()="${label}"]`);
  }

  categoryFilter(label) {
    return $(`//label[text()="${label}"]`);
  }

  async verifySearchResultsContain(keyword) {
    const results = await this.appDescriptions;
    if (results.length > 0) {
      for (const result of results) {
        const text = await result.getText();
        expect(text.toLowerCase()).toContain(keyword.toLowerCase());
      }
    } else {
      console.log("No search results found.");
    }
  }

  async verifySortingDifference() {
    const recentList = this.appTitles;
    const recentTitles = await Promise.all(recentList.map(el => el.getText()));

    await this.sortButton('Top').click();
    await browser.pause(2000);

    const topList = this.appTitles;
    const topTitles = await Promise.all(topList.map(el => el.getText()));
    expect(recentTitles).not.toEqual(topTitles);
  }

  async verifyCategoryFilterWithApi(category, expectedTitles) {
  await this.categoryFilter(category).click();
  await browser.pause(2000)

  const uiTitles = await this.appTitles;
  for (const el of uiTitles) {
    const title = await el.getText();
    expect(expectedTitles).toContain(title);
  }
}
  
    
    
    
  
}

export default new AppsPage();
