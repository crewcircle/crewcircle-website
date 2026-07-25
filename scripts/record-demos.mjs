import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = 'public/demos';
mkdirSync(OUTPUT_DIR, { recursive: true });

async function recordTaxFlowAI() {
  console.log('Recording TaxFlowAI demo...');
  const videoDir = `tmp/taxflowai-video`;
  if (existsSync(videoDir)) rmSync(videoDir, { recursive: true });
  mkdirSync(videoDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  try {
    await page.goto('https://taxflow.crewcircle.com.au/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Click the demo button
    const demoBtn = page.locator('button:has-text("Try the live demo - no signup")');
    await demoBtn.waitFor({ state: 'visible' });
    await demoBtn.click();

    // Wait for dashboard load
    await page.waitForURL('**/dashboard', { timeout: 20000 });
    await page.waitForTimeout(2500);

    // Wait a moment for any onboarding modal, then dismiss by pressing Escape if present
    await page.waitForTimeout(1500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Type a question in the chat input
    const input = page.locator('textarea, input[placeholder*="Ask"], input[placeholder*="question"], input[placeholder*="ATO"]').first();
    if (await input.count() > 0) {
      await input.fill('What are the GST rules for a tradie?');
      await page.waitForTimeout(600);
      await input.press('Enter');
      await page.waitForTimeout(3000);
    }
  } catch (e) {
    console.error('TaxFlowAI demo error:', e.message);
  }

  await context.close();
  await browser.close();

  const videoPath = (await import('fs/promises')).readdir(videoDir).then(files => join(videoDir, files[0]));
  return videoPath;
}

async function recordLocalMate() {
  console.log('Recording LocalMate demo...');
  const videoDir = `tmp/localmate-video`;
  if (existsSync(videoDir)) rmSync(videoDir, { recursive: true });
  mkdirSync(videoDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  try {
    await page.goto('https://localmate.crewcircle.com.au/demo', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Scroll to review cards
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(800);

    // Click approve on first review card if present
    const approveBtn = page.locator('button:has-text("Approve")').first();
    if (await approveBtn.count() > 0) {
      await approveBtn.click();
      await page.waitForTimeout(1200);
    }

    // Scroll further
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(1000);
  } catch (e) {
    console.error('LocalMate demo error:', e.message);
  }

  await context.close();
  await browser.close();

  const files = await (await import('fs/promises')).readdir(videoDir);
  return join(videoDir, files[0]);
}

async function recordCrewRoster() {
  console.log('Recording CrewRoster demo...');
  const videoDir = `tmp/crewroster-video`;
  if (existsSync(videoDir)) rmSync(videoDir, { recursive: true });
  mkdirSync(videoDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  try {
    await page.goto('https://roster.crewcircle.com.au/demo', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Set up demo organization
    const setupBtn = page.locator('button:has-text("Set Up Demo Organization")');
    if (await setupBtn.count() > 0) {
      await setupBtn.click();
      await page.waitForTimeout(3000);
    }

    // Login as owner
    const ownerBtn = page.locator('button:has-text("Owner")');
    if (await ownerBtn.count() > 0) {
      await ownerBtn.click();
      await page.waitForTimeout(3000);
    }

    // Wait for roster page
    await page.waitForURL('**/roster', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2500);

    // Scroll to show roster/timesheet
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(1000);
  } catch (e) {
    console.error('CrewRoster demo error:', e.message);
  }

  await context.close();
  await browser.close();

  const files = await (await import('fs/promises')).readdir(videoDir);
  return join(videoDir, files[0]);
}

function convertToGif(videoPath, outputName) {
  const outPath = join(OUTPUT_DIR, outputName);
  // Trim to last 7 seconds, scale width to 640, 12fps, 128 colors
  const cmd = `ffmpeg -y -sseof -7 -i "${videoPath}" -vf "fps=12,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse" -loop 0 "${outPath}"`;
  console.log(`Converting ${outputName}...`);
  execSync(cmd, { stdio: 'inherit' });
  return outPath;
}

(async () => {
  mkdirSync('tmp', { recursive: true });

  const taxflowVideo = await recordTaxFlowAI();
  convertToGif(taxflowVideo, 'taxflowai-demo.gif');

  const localmateVideo = await recordLocalMate();
  convertToGif(localmateVideo, 'localmate-demo.gif');

  const crewrosterVideo = await recordCrewRoster();
  convertToGif(crewrosterVideo, 'crewroster-demo.gif');

  console.log('Done. GIFs saved to', OUTPUT_DIR);
})();
