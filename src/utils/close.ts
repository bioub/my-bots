import { Browser } from 'puppeteer';

export async function close(browser: Browser) {
  try {
    await browser.close();
  }
  catch(err) {
    console.log(err.message);
  }
}
