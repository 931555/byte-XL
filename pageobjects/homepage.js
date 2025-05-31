class HomePage {
  get heroTitle() { return $('#hero > h1'); }
  get appsNavLink() { return $('a[href="/apps"]'); }

  async open() {
    await browser.url('https://bytexl.live/');
  }

  async verifyHomePage() {
    const text = await this.heroTitle.getText();
    await expect(text).toContain('ByteXL');
  }

  async goToAppsPage() {
    await this.appsNavLink.click();
  }
}

export default new HomePage();
