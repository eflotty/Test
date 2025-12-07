const { chromium } = require('playwright');
const fs = require('fs');

async function inspectPage() {
  console.log('🔍 Launching browser to inspect Austin golf booking page...\n');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });
  
  const page = await browser.newPage();
  
  console.log('📄 Navigating to booking page...');
  await page.goto('https://txaustinweb.myvscloud.com/webtrac/web/search.html?display=detail&module=GR&secondarycode=3', {
    waitUntil: 'networkidle'
  });
  
  console.log('⏳ Waiting 3 seconds for page to fully load...\n');
  await page.waitForTimeout(3000);
  
  // Capture page HTML
  const html = await page.content();
  fs.writeFileSync('page-structure.html', html);
  console.log('✅ Saved full HTML to: page-structure.html');
  
  // Try to identify key elements
  console.log('\n🔎 ANALYZING PAGE STRUCTURE...\n');
  
  // Check for login elements
  console.log('LOGIN ELEMENTS:');
  const loginSelectors = [
    'input[name="username"]',
    'input[name="userName"]', 
    'input[name="user"]',
    'input[type="text"]',
    'input[name="loginName"]',
    'input#username',
    'input#userName'
  ];
  
  for (const selector of loginSelectors) {
    const exists = await page.locator(selector).count() > 0;
    if (exists) {
      const attrs = await page.locator(selector).first().evaluate(el => ({
        id: el.id,
        name: el.name,
        type: el.type,
        class: el.className
      }));
      console.log(`  ✓ Found: ${selector}`, attrs);
    }
  }
  
  const passwordSelectors = [
    'input[name="password"]',
    'input[name="pass"]',
    'input[type="password"]',
    'input#password'
  ];
  
  for (const selector of passwordSelectors) {
    const exists = await page.locator(selector).count() > 0;
    if (exists) {
      const attrs = await page.locator(selector).first().evaluate(el => ({
        id: el.id,
        name: el.name,
        type: el.type,
        class: el.className
      }));
      console.log(`  ✓ Found: ${selector}`, attrs);
    }
  }
  
  // Check for buttons
  console.log('\nBUTTONS FOUND:');
  const buttons = await page.locator('button').all();
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const text = await buttons[i].textContent();
    const attrs = await buttons[i].evaluate(el => ({
      id: el.id,
      class: el.className,
      type: el.type
    }));
    console.log(`  Button ${i+1}: "${text?.trim()}"`, attrs);
  }
  
  // Check for input buttons
  const inputButtons = await page.locator('input[type="button"], input[type="submit"]').all();
  for (let i = 0; i < inputButtons.length; i++) {
    const value = await inputButtons[i].getAttribute('value');
    const attrs = await inputButtons[i].evaluate(el => ({
      id: el.id,
      class: el.className,
      name: el.name
    }));
    console.log(`  Input Button: "${value}"`, attrs);
  }
  
  // Check for links that might be buttons
  console.log('\nLINKS (first 10):');
  const links = await page.locator('a').all();
  for (let i = 0; i < Math.min(links.length, 10); i++) {
    const text = await links[i].textContent();
    const href = await links[i].getAttribute('href');
    console.log(`  Link ${i+1}: "${text?.trim()}" -> ${href}`);
  }
  
  // Look for time-related elements
  console.log('\nTIME/BOOKING ELEMENTS:');
  const timeSelectors = [
    '[class*="time"]',
    '[class*="slot"]',
    '[class*="booking"]',
    '[class*="available"]',
    'td',
    '.result',
    '[data-time]'
  ];
  
  for (const selector of timeSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0 && count < 50) {
      console.log(`  Found ${count} elements matching: ${selector}`);
      // Show first element's structure
      const first = page.locator(selector).first();
      const text = await first.textContent().catch(() => '');
      const attrs = await first.evaluate(el => ({
        tag: el.tagName,
        id: el.id,
        class: el.className
      })).catch(() => ({}));
      console.log(`    First one: "${text?.trim().substring(0, 50)}"`, attrs);
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: 'page-screenshot.png', fullPage: true });
  console.log('\n✅ Saved screenshot to: page-screenshot.png');
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 NEXT STEPS:');
  console.log('='.repeat(60));
  console.log('1. Check page-structure.html for full HTML');
  console.log('2. Check page-screenshot.png to see the page');
  console.log('3. In the browser window, right-click and Inspect elements');
  console.log('4. Use developer tools to find exact selectors');
  console.log('5. Press Enter here when done inspecting...');
  console.log('='.repeat(60) + '\n');
  
  // Wait for user to inspect
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  console.log('\n💡 Extracting all form fields...');
  
  const forms = await page.evaluate(() => {
    const allForms = [];
    document.querySelectorAll('form').forEach((form, idx) => {
      const formData = {
        formIndex: idx,
        action: form.action,
        method: form.method,
        fields: []
      };
      
      form.querySelectorAll('input, select, textarea').forEach(field => {
        formData.fields.push({
          tag: field.tagName,
          type: field.type,
          name: field.name,
          id: field.id,
          class: field.className,
          placeholder: field.placeholder
        });
      });
      
      allForms.push(formData);
    });
    return allForms;
  });
  
  console.log('\nFORMS FOUND:');
  console.log(JSON.stringify(forms, null, 2));
  fs.writeFileSync('forms-structure.json', JSON.stringify(forms, null, 2));
  console.log('✅ Saved to: forms-structure.json');
  
  console.log('\n✅ Inspection complete! Browser will close in 5 seconds...');
  await page.waitForTimeout(5000);
  
  await browser.close();
}

inspectPage().catch(console.error);
