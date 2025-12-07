const { chromium } = require('playwright');
const fs = require('fs');

async function inspectLoginPage() {
  console.log('🔍 Launching browser to inspect LOGIN page...\n');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });
  
  const page = await browser.newPage();
  
  console.log('📄 Navigating to LOGIN page...');
  await page.goto('https://txaustinweb.myvscloud.com/webtrac/web/login.html', {
    waitUntil: 'networkidle'
  });
  
  console.log('⏳ Waiting 3 seconds for page to fully load...\n');
  await page.waitForTimeout(3000);
  
  // Capture page HTML
  const html = await page.content();
  fs.writeFileSync('login-page-structure.html', html);
  console.log('✅ Saved full HTML to: login-page-structure.html');
  
  // Try to identify key elements
  console.log('\n🔎 ANALYZING LOGIN PAGE STRUCTURE...\n');
  
  // Check for login elements
  console.log('LOGIN ELEMENTS:');
  const loginSelectors = [
    'input[name="loginName"]',
    'input[name="userName"]', 
    'input[name="user"]',
    'input[type="text"]',
    'input[name="username"]',
    'input#username',
    'input#userName',
    'input#loginName',
    'input[type="email"]',
  ];
  
  for (const selector of loginSelectors) {
    const exists = await page.locator(selector).count() > 0;
    if (exists) {
      const attrs = await page.locator(selector).first().evaluate(el => ({
        id: el.id,
        name: el.name,
        type: el.type,
        class: el.className,
        placeholder: el.placeholder
      }));
      console.log(`  ✓ Found: ${selector}`, attrs);
    }
  }
  
  const passwordSelectors = [
    'input[name="password"]',
    'input[name="loginPassword"]',
    'input[name="pass"]',
    'input[type="password"]',
    'input#password',
    'input#loginPassword',
  ];
  
  console.log('\nPASSWORD ELEMENTS:');
  for (const selector of passwordSelectors) {
    const exists = await page.locator(selector).count() > 0;
    if (exists) {
      const attrs = await page.locator(selector).first().evaluate(el => ({
        id: el.id,
        name: el.name,
        type: el.type,
        class: el.className,
        placeholder: el.placeholder
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
      name: el.name,
      type: el.type
    }));
    console.log(`  Input Button: "${value}"`, attrs);
  }
  
  // Check for forms
  console.log('\nFORMS FOUND:');
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
  
  console.log(JSON.stringify(forms, null, 2));
  fs.writeFileSync('login-forms-structure.json', JSON.stringify(forms, null, 2));
  console.log('✅ Saved to: login-forms-structure.json');
  
  // Take screenshot
  await page.screenshot({ path: 'login-page-screenshot.png', fullPage: true });
  console.log('\n✅ Saved screenshot to: login-page-screenshot.png');
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 NEXT STEPS:');
  console.log('='.repeat(60));
  console.log('1. Check login-page-structure.html for full HTML');
  console.log('2. Check login-page-screenshot.png to see the page');
  console.log('3. In the browser window, right-click and Inspect elements');
  console.log('4. Use developer tools to find exact selectors');
  console.log('5. Press Enter here when done inspecting...');
  console.log('='.repeat(60) + '\n');
  
  // Wait for user to inspect
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  console.log('\n✅ Inspection complete! Browser will close in 2 seconds...');
  await page.waitForTimeout(2000);
  
  await browser.close();
}

inspectLoginPage().catch(console.error);

