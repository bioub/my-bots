export async function close(browser) {
  try {
    await browser.close();
  }
  catch(err) {
    console.log(err.message);
  }
};
