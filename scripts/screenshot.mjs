import puppeteer from 'puppeteer';
import path from 'path';

async function takeScreenshot() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // ウィンドウサイズを設定
  await page.setViewport({
    width: 1280,
    height: 800,
    deviceScaleFactor: 2
  });
  
  // ローカルサーバーのURLを指定
  await page.goto('http://localhost:3000/quiz', {
    waitUntil: 'networkidle0'
  });
  
  // 画面全体のスクリーンショットを撮影
  const screenshotPath = path.join(process.cwd(), 'screenshots', `quiz-${Date.now()}.png`);
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });
  
  console.log(`スクリーンショットを保存しました: ${screenshotPath}`);
  
  await browser.close();
}

takeScreenshot().catch(console.error); 