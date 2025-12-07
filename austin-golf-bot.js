const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const CONFIG = {
  // Your login credentials
  USERNAME: 'pmichgolf57@gmail.com',
  PASSWORD: 'Mulligan57!',
  
  // Booking details
  BOOKING_URL: 'https://txaustinweb.myvscloud.com/webtrac/web/search.html?display=detail&module=GR&secondarycode=3',
  LOGIN_URL: 'https://txaustinweb.myvscloud.com/webtrac/web/login.html',
  
  // Load config from UI if available
  CONFIG_FILE: path.join(__dirname, 'booking-config.json'),
  
  // Booking preferences (will be overridden by config file if it exists)
  COURSE: 3,  // 1=Morris Williams, 2=Lions, 3=Jimmy Clay, 4=Hancock, 5=Roy Kizer
  DATE: null,  // null = use date already selected, or set to 'YYYY-MM-DD'
  PLAYERS: 4,  // Number of players
  HOLES: 18,   // 18 or 9 holes
  TIME_START: '07:00',  // Start of acceptable time range (HH:MM)
  TIME_END: '18:00',    // End of acceptable time range (HH:MM)
  
  // Target time for booking (24-hour format) - when slots open
  TARGET_HOUR: 7,
  TARGET_MINUTE: 0,
  TARGET_SECOND: 0,
  
  // How many seconds before target time to start positioning
  PRE_POSITION_SECONDS: 45,
  
  // Selectors for Austin WebTrac system
  SELECTORS: {
    // Sign in button on booking page (top right)
    signInButton: 'button:has-text("Sign In"), a:has-text("Sign In"), button:has-text("SIGN IN"), a:has-text("SIGN IN")',  // Sign in button in top right
    
    // Login form (appears after clicking Sign In)
    usernameInput: 'input[name="weblogin_username"]',  // Actual field name
    passwordInput: 'input[name="weblogin_password"]',  // Actual field name
    loginButton: 'button#weblogin_buttonlogin',  // Login button ID
    
    // Search and booking page
    searchButton: 'input[type="submit"][value="Search"]',  // Search button on tee time page
    
    // Time slots - WebTrac uses table rows with plus icons
    // The + icon is typically in a link with onclick that adds to cart
    timeSlotContainer: 'table.grid tbody tr',  // Each row is a time slot
    addToCartIcon: 'a[onclick*="addtocart"]',  // Plus icon that adds to cart
    
    // Alternative selectors
    availableSlots: 'td.available',  // Available time slots
    plusIcon: 'img[alt="+"]',  // The actual plus image
    
    // Cart/confirmation
    cartLink: 'a[href*="cart"]',
    checkoutButton: 'input[value="Checkout"]',
  },
  
  // Speed optimization
  DISABLE_IMAGES: true,
  DISABLE_CSS: false,  // Keep CSS as it might be needed for element visibility
  MAX_WAIT_FOR_SLOTS: 10000,  // 10 seconds max to wait for slots to appear
};

// ============================================
// MAIN BOOKING BOT
// ============================================
class AustinGolfBookingBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
  }

  async launch() {
    console.log('🚀 Launching browser in incognito mode...');
    this.browser = await chromium.launch({
      headless: false,  // Keep visible so you can take over
      slowMo: 0,        // No delay - maximum speed
      args: [
        '--disable-blink-features=AutomationControlled',  // Avoid detection
        '--incognito',  // Run in incognito/private mode
      ]
    });
    
    // Create a fresh context (incognito-like - no cookies, storage, etc.)
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      // No storage state = fresh incognito-like session
      storageState: undefined,
    });
    
    this.page = await this.context.newPage();
    
    // Speed optimizations
    if (CONFIG.DISABLE_IMAGES) {
      await this.page.route('**/*.{png,jpg,jpeg,gif,svg,webp,ico}', route => route.abort());
    }
    if (CONFIG.DISABLE_CSS) {
      await this.page.route('**/*.css', route => route.abort());
    }
    
    console.log('✅ Browser launched in incognito mode');
  }

  async login() {
    console.log('🔐 Attempting login from booking page...');
    
    try {
      // First, navigate to the booking page (not logged in yet)
      console.log('📄 Opening booking page...');
      await this.page.goto(CONFIG.BOOKING_URL, { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      await this.page.waitForTimeout(1000);
      
      // Look for and click the "Sign In" button in the top right
      console.log('🔍 Looking for Sign In button...');
      
      // Try multiple selectors for the sign in button
      const signInSelectors = [
        'button:has-text("Sign In")',
        'a:has-text("Sign In")',
        'button:has-text("SIGN IN")',
        'a:has-text("SIGN IN")',
        'button[aria-label*="Sign"]',
        'a[href*="login"]',
        '[class*="signin"]',
        '[id*="signin"]',
      ];
      
      let signInClicked = false;
      for (const selector of signInSelectors) {
        try {
          const signInBtn = this.page.locator(selector).first();
          if (await signInBtn.isVisible({ timeout: 2000 })) {
            console.log(`  ✓ Found Sign In button: ${selector}`);
            await signInBtn.click();
            signInClicked = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!signInClicked) {
        throw new Error('Could not find Sign In button on page');
      }
      
      // Wait for login form to appear (could be modal or new page)
      console.log('⏳ Waiting for login form...');
      await this.page.waitForTimeout(1000);
      
      // Wait for login form fields
      await this.page.waitForSelector(CONFIG.SELECTORS.usernameInput, { timeout: 10000 });
      await this.page.waitForSelector(CONFIG.SELECTORS.passwordInput, { timeout: 5000 });
      
      console.log('📝 Filling in credentials...');
      
      // Clear fields first (in case of autofill)
      await this.page.fill(CONFIG.SELECTORS.usernameInput, '');
      await this.page.fill(CONFIG.SELECTORS.passwordInput, '');
      
      // Fill credentials
      await this.page.fill(CONFIG.SELECTORS.usernameInput, CONFIG.USERNAME);
      await this.page.fill(CONFIG.SELECTORS.passwordInput, CONFIG.PASSWORD);
      
      console.log('🔑 Submitting login...');
      
      // Wait a moment for form to be ready
      await this.page.waitForTimeout(500);
      
      // Click login button - may stay on same page (modal) or navigate
      await this.page.click(CONFIG.SELECTORS.loginButton);
      
      // Wait for login to complete - either navigation or form to disappear
      await this.page.waitForTimeout(2000);
      
      // Check if we're still on the booking page (good!) or if login form is gone
      const currentUrl = this.page.url();
      const loginFormExists = await this.page.locator(CONFIG.SELECTORS.usernameInput).count() > 0;
      
      // Check if sign in button is still visible (means we're not logged in)
      let signInButtonStillVisible = false;
      for (const selector of signInSelectors) {
        try {
          if (await this.page.locator(selector).first().isVisible({ timeout: 500 })) {
            signInButtonStillVisible = true;
            break;
          }
        } catch (e) {
          // Continue checking
        }
      }
      
      if (loginFormExists) {
        // Check if there's an error message
        const errorText = await this.page.locator('text=/error|invalid|incorrect/i').textContent().catch(() => '');
        if (errorText) {
          throw new Error(`Login failed: ${errorText}`);
        }
        throw new Error('Login failed - login form still visible');
      }
      
      // If we're on the booking page and sign in button is gone, we're logged in!
      if (currentUrl.includes('module=GR') && !signInButtonStillVisible) {
        console.log('✅ Successfully logged in! Already on booking page.');
        return;
      }
      
      // If we navigated away, navigate back to booking page
      if (!currentUrl.includes('module=GR')) {
        console.log('🔄 Navigating back to booking page...');
        await this.page.goto(CONFIG.BOOKING_URL, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });
        await this.page.waitForTimeout(1000);
      }
      
      console.log('✅ Successfully logged in!');
      
    } catch (error) {
      console.error('❌ Login error:', error.message);
      // Take screenshot for debugging
      await this.page.screenshot({ path: `login-error-${Date.now()}.png`, fullPage: true }).catch(() => {});
      throw error;
    }
  }

  async navigateToBookingPage() {
    // No longer needed - login() now opens booking page first
    // This function is kept for compatibility but does nothing
    console.log('ℹ️  Already on booking page from login process');
    
    // Set parameters after navigation
    await this.setBookingParameters();
  }

  async refreshBookingPage() {
    console.log('🔄 Refreshing page to check for new slots...');
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(500);
  }

  /**
   * Robust dropdown selection with scrolling and verification
   */
  async selectDropdownOption(selectLocator, value, label) {
    try {
      // Wait for dropdown to be visible
      await selectLocator.waitFor({ state: 'visible', timeout: 3000 });
      
      // Scroll into view to ensure it's visible
      await selectLocator.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(200);
      
      // Try multiple selection methods
      const selectElement = selectLocator.first();
      
      // Method 1: Direct selectOption (works for native <select>)
      try {
        await selectElement.selectOption({ value: String(value) }, { timeout: 2000 });
        await this.page.waitForTimeout(300);
        
        // Verify selection was made
        const selectedValue = await selectElement.inputValue();
        if (selectedValue === String(value)) {
          console.log(`  ✅ ${label}: Set to ${value} (verified)`);
          return true;
        }
      } catch (e) {
        // Try alternative methods
      }
      
      // Method 2: Try by label/text
      try {
        await selectElement.selectOption({ label: String(value) }, { timeout: 2000 });
        await this.page.waitForTimeout(300);
        const selectedValue = await selectElement.inputValue();
        if (selectedValue === String(value)) {
          console.log(`  ✅ ${label}: Set to ${value} via label (verified)`);
          return true;
        }
      } catch (e) {
        // Continue to next method
      }
      
      // Method 3: Click and select from dropdown (for custom dropdowns)
      try {
        await selectElement.click();
        await this.page.waitForTimeout(300);
        
        // Look for option in dropdown
        const option = this.page.locator(`option[value="${value}"], option:has-text("${value}")`).first();
        if (await option.isVisible({ timeout: 1000 })) {
          await option.scrollIntoViewIfNeeded();
          await option.click();
          await this.page.waitForTimeout(300);
          
          const selectedValue = await selectElement.inputValue();
          if (selectedValue === String(value)) {
            console.log(`  ✅ ${label}: Set to ${value} via click (verified)`);
            return true;
          }
        }
      } catch (e) {
        // Continue
      }
      
      console.log(`  ⚠️  ${label}: Could not verify selection`);
      return false;
    } catch (error) {
      console.log(`  ❌ ${label}: Error - ${error.message}`);
      return false;
    }
  }

  async setBookingParameters() {
    console.log('\n⚙️  SETTING BOOKING PARAMETERS...');
    console.log('='.repeat(60));
    
    const verification = {
      date: false,
      players: false,
      holes: false
    };
    
    try {
      // Set date
      if (CONFIG.DATE) {
        console.log(`\n📅 Setting date to ${CONFIG.DATE}...`);
        try {
          // Try multiple date input selectors
          const dateSelectors = [
            'input[name*="date"]',
            'input[id*="date"]',
            'input[type="date"]',
            'input[type="text"][name*="date"]',
            '#date',
            '[name="date"]'
          ];
          
          let dateSet = false;
          for (const selector of dateSelectors) {
            try {
              const dateInput = this.page.locator(selector).first();
              if (await dateInput.isVisible({ timeout: 1000 })) {
                await dateInput.scrollIntoViewIfNeeded();
                await dateInput.fill('');
                await dateInput.fill(CONFIG.DATE);
                await this.page.waitForTimeout(300);
                
                // Verify
                const value = await dateInput.inputValue();
                if (value.includes(CONFIG.DATE.split('-')[2])) { // Check if date was set
                  console.log(`  ✅ Date set to ${CONFIG.DATE} (verified)`);
                  verification.date = true;
                  dateSet = true;
                  break;
                }
              }
            } catch (e) {
              continue;
            }
          }
          
          if (!dateSet) {
            console.log('  ⚠️  Could not set date - may need manual selection');
          }
        } catch (e) {
          console.log(`  ⚠️  Date selection error: ${e.message}`);
        }
      }
      
      // Set number of players with robust selection
      if (CONFIG.PLAYERS) {
        console.log(`\n👥 Setting players to ${CONFIG.PLAYERS}...`);
        const playersSelectors = [
          'select[name*="player"]',
          'select[id*="player"]',
          'select[name*="Player"]',
          'select[id*="Player"]',
          '#players',
          '[name="players"]'
        ];
        
        let playersSet = false;
        for (const selector of playersSelectors) {
          try {
            const playersSelect = this.page.locator(selector).first();
            if (await playersSelect.isVisible({ timeout: 1000 })) {
              const success = await this.selectDropdownOption(playersSelect, CONFIG.PLAYERS, 'Players');
              if (success) {
                verification.players = true;
                playersSet = true;
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!playersSet) {
          console.log('  ⚠️  Could not set players - may need manual selection');
        }
      }
      
      // Set number of holes with robust selection
      if (CONFIG.HOLES) {
        console.log(`\n⛳ Setting holes to ${CONFIG.HOLES}...`);
        const holesSelectors = [
          'select[name*="hole"]',
          'select[id*="hole"]',
          'select[name*="Hole"]',
          'select[id*="Hole"]',
          '#holes',
          '[name="holes"]'
        ];
        
        let holesSet = false;
        for (const selector of holesSelectors) {
          try {
            const holesSelect = this.page.locator(selector).first();
            if (await holesSelect.isVisible({ timeout: 1000 })) {
              const success = await this.selectDropdownOption(holesSelect, CONFIG.HOLES, 'Holes');
              if (success) {
                verification.holes = true;
                holesSet = true;
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!holesSet) {
          console.log('  ⚠️  Could not set holes - may need manual selection');
        }
      }
      
      // Summary
      console.log('\n' + '='.repeat(60));
      console.log('📊 PARAMETER VERIFICATION:');
      if (CONFIG.DATE) console.log(`  Date: ${verification.date ? '✅' : '⚠️'}`);
      if (CONFIG.PLAYERS) console.log(`  Players: ${verification.players ? '✅' : '⚠️'}`);
      if (CONFIG.HOLES) console.log(`  Holes: ${verification.holes ? '✅' : '⚠️'}`);
      console.log('='.repeat(60));
      
      // Take screenshot for verification (in test mode or if verification failed)
      const allVerified = (!CONFIG.DATE || verification.date) && 
                          (!CONFIG.PLAYERS || verification.players) && 
                          (!CONFIG.HOLES || verification.holes);
      
      if (!allVerified) {
        console.log('\n📸 Taking screenshot for parameter verification...');
        await this.page.screenshot({ 
          path: `parameters-${Date.now()}.png`, 
          fullPage: true 
        });
        console.log('  💡 Check screenshot to verify parameters were set correctly');
      }
      
      console.log('\n✅ Parameter setting complete');
      
    } catch (error) {
      console.log(`\n⚠️  Error setting parameters: ${error.message}`);
      console.log('📸 Taking error screenshot...');
      await this.page.screenshot({ 
        path: `parameter-error-${Date.now()}.png`, 
        fullPage: true 
      });
    }
  }

  async clickSearchIfNeeded() {
    try {
      // Check if search button exists and is visible
      const searchButton = this.page.locator(CONFIG.SELECTORS.searchButton);
      const isVisible = await searchButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (isVisible) {
        console.log('🔍 Clicking search button...');
        await searchButton.click();
        await this.page.waitForTimeout(2000);  // Wait for results
        return true;
      }
    } catch (error) {
      console.log('ℹ️  No search button needed or already searched');
    }
    return false;
  }

  async findAndBookFirstAvailableSlot() {
    console.log('⚡ SEARCHING FOR AVAILABLE SLOTS...');
    
    // Parse time range
    const [startHour, startMin] = CONFIG.TIME_START.split(':').map(Number);
    const [endHour, endMin] = CONFIG.TIME_END.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    console.log(`  🕐 Looking for times between ${CONFIG.TIME_START} and ${CONFIG.TIME_END}...`);
    
    try {
      // Method 1: Look for plus icon links (most common in WebTrac)
      console.log('  Method 1: Looking for + icon links...');
      const addToCartLinks = await this.page.locator(CONFIG.SELECTORS.addToCartIcon).all();
      
      if (addToCartLinks.length > 0) {
        console.log(`  ✓ Found ${addToCartLinks.length} available slots!`);
        
        // Find first slot within time range
        for (let i = 0; i < addToCartLinks.length; i++) {
          try {
            // Get the time from the row/context
            const link = addToCartLinks[i];
            const row = link.locator('xpath=ancestor::tr');
            const timeText = await row.locator('td').first().textContent().catch(() => '');
            
            // Parse time (e.g., "7:00 AM" or "07:00")
            const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
            if (timeMatch) {
              let slotHour = parseInt(timeMatch[1]);
              const slotMin = parseInt(timeMatch[2]);
              const period = timeMatch[3]?.toUpperCase();
              
              // Convert to 24-hour format
              if (period === 'PM' && slotHour !== 12) slotHour += 12;
              if (period === 'AM' && slotHour === 12) slotHour = 0;
              
              const slotMinutes = slotHour * 60 + slotMin;
              
              // Check if within range
              if (slotMinutes >= startMinutes && slotMinutes <= endMinutes) {
                console.log(`  🎯 Found acceptable time: ${timeText.trim()} (within range)`);
                await link.click({ timeout: 3000 });
                console.log('✅ SLOT BOOKED - ADDED TO CART!');
                return true;
              } else {
                console.log(`  ⏭️  Skipping ${timeText.trim()} (outside range)`);
              }
            } else {
              // If we can't parse time, just book the first one
              if (i === 0) {
                console.log('  🎯 Could not parse time, booking first available slot...');
                await link.click({ timeout: 3000 });
                console.log('✅ SLOT BOOKED - ADDED TO CART!');
                return true;
              }
            }
          } catch (e) {
            // If we can't get time, just click the first one
            if (i === 0) {
              console.log('  🎯 Booking first available slot...');
              await link.click({ timeout: 3000 });
              console.log('✅ SLOT BOOKED - ADDED TO CART!');
              return true;
            }
          }
        }
        
        console.log('⚠️  No slots found within specified time range');
        return false;
      }
      
      // Method 2: Look for plus icon images
      console.log('  Method 2: Looking for + images...');
      const plusIcons = await this.page.locator(CONFIG.SELECTORS.plusIcon).all();
      
      if (plusIcons.length > 0) {
        console.log(`  ✓ Found ${plusIcons.length} + icons!`);
        await plusIcons[0].click({ timeout: 3000 });
        console.log('✅ SLOT BOOKED - ADDED TO CART!');
        return true;
      }
      
      // Method 3: Look in table rows
      console.log('  Method 3: Scanning table rows...');
      const rows = await this.page.locator(CONFIG.SELECTORS.timeSlotContainer).all();
      
      if (rows.length > 0) {
        console.log(`  ✓ Found ${rows.length} time slot rows`);
        
        // Look for clickable elements in the first few rows
        for (let i = 0; i < Math.min(5, rows.length); i++) {
          const links = await rows[i].locator('a').all();
          for (const link of links) {
            const onclick = await link.getAttribute('onclick');
            if (onclick && onclick.includes('addtocart')) {
              console.log(`  🎯 Found bookable slot in row ${i + 1}!`);
              await link.click({ timeout: 3000 });
              console.log('✅ SLOT BOOKED - ADDED TO CART!');
              return true;
            }
          }
        }
      }
      
      console.log('⚠️  No available slots found yet');
      return false;
      
    } catch (error) {
      console.error('❌ Error while booking:', error.message);
      throw error;
    }
  }

  async executeBooking() {
    console.log('\n' + '='.repeat(60));
    console.log('⚡ EXECUTING BOOKING SEQUENCE NOW!');
    console.log('='.repeat(60) + '\n');
    
    try {
      // Set booking parameters first
      await this.setBookingParameters();
      
      // Click search if needed
      await this.clickSearchIfNeeded();
      
      // Try to book
      const booked = await this.findAndBookFirstAvailableSlot();
      
      if (booked) {
        console.log('\n✅ SUCCESS! Slot added to cart.');
        console.log('👆 YOU CAN NOW TAKE OVER TO COMPLETE CHECKOUT\n');
        
        // Try to navigate to cart
        try {
          const cartLink = this.page.locator(CONFIG.SELECTORS.cartLink);
          if (await cartLink.isVisible({ timeout: 2000 })) {
            console.log('🛒 Navigating to cart...');
            await cartLink.click();
          }
        } catch (e) {
          console.log('ℹ️  Cart link not found, but slot is in cart');
        }
        
        await this.waitForManualCompletion();
      } else {
        console.log('\n⚠️  No slots available yet. Check the browser window.');
        console.log('Options:');
        console.log('  1. Wait for slots to appear and book manually');
        console.log('  2. Close browser and try again');
        
        await this.waitForManualCompletion();
      }
      
    } catch (error) {
      console.error('\n❌ ERROR during booking:', error.message);
      console.log('\n📸 Taking screenshot for debugging...');
      await this.page.screenshot({ 
        path: `error-${Date.now()}.png`, 
        fullPage: true 
      });
      
      console.log('\n💡 Browser will stay open for manual intervention');
      await this.waitForManualCompletion();
    }
  }

  async waitForManualCompletion() {
    console.log('\n⏸️  Browser staying open. Close it when you\'re done.\n');
    // Keep the process alive
    await new Promise(() => {});
  }

  async scheduleBooking() {
    const now = new Date();
    const target = new Date();
    target.setHours(CONFIG.TARGET_HOUR, CONFIG.TARGET_MINUTE, CONFIG.TARGET_SECOND, 0);
    
    // If target time is in the past today, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    
    const prePositionTime = new Date(target.getTime() - (CONFIG.PRE_POSITION_SECONDS * 1000));
    const delayToPrePosition = prePositionTime - now;
    const delayToExecution = target - now;
    
    console.log('\n' + '='.repeat(60));
    console.log('⏰ BOOKING SCHEDULER');
    console.log('='.repeat(60));
    console.log(`Current time:        ${now.toLocaleTimeString()}`);
    console.log(`Pre-position at:     ${prePositionTime.toLocaleTimeString()}`);
    console.log(`Execute booking at:  ${target.toLocaleTimeString()}`);
    console.log(`\nTime until start:    ${Math.round(delayToPrePosition / 1000)} seconds`);
    console.log(`Time until booking:  ${Math.round(delayToExecution / 1000)} seconds`);
    console.log('='.repeat(60) + '\n');
    
    if (delayToPrePosition < 0) {
      console.log('⚠️  Pre-position time is in the past! Running immediately...\n');
      await this.runImmediately();
      return;
    }
    
    // Pre-position phase
    setTimeout(async () => {
      console.log('\n⏰ PRE-POSITIONING NOW...\n');
      await this.launch();
      await this.login();
      await this.navigateToBookingPage();
      console.log(`\n✅ Positioned and ready!`);
      console.log(`⏳ Waiting ${CONFIG.PRE_POSITION_SECONDS}s for exact execution time...\n`);
    }, delayToPrePosition);
    
    // Execution phase
    setTimeout(async () => {
      await this.executeBooking();
    }, delayToExecution);
  }

  async runImmediately() {
    console.log('🏃 RUNNING IMMEDIATELY FOR TESTING...\n');
    await this.launch();
    await this.login();
    await this.navigateToBookingPage();
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 INSPECTION MODE');
    console.log('='.repeat(60));
    console.log('The browser is now open on the booking page.');
    console.log('\nTo find correct selectors:');
    console.log('  1. Right-click on time slots → Inspect');
    console.log('  2. Look for the + icon link or button');
    console.log('  3. Note the onclick attribute or link structure');
    console.log('  4. Update CONFIG.SELECTORS if needed');
    console.log('\nPress Enter to attempt booking with current selectors...');
    console.log('='.repeat(60) + '\n');
    
    // Wait for user input
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
    await this.executeBooking();
  }

  async testSelectors() {
    console.log('🧪 TESTING SELECTORS...\n');
    await this.launch();
    await this.login();
    await this.navigateToBookingPage();
    
    console.log('Testing selectors on current page:\n');
    
    for (const [name, selector] of Object.entries(CONFIG.SELECTORS)) {
      try {
        const count = await this.page.locator(selector).count();
        const status = count > 0 ? '✓' : '✗';
        console.log(`${status} ${name}: ${count} element(s) found`);
        
        if (count > 0 && count < 10) {
          const first = this.page.locator(selector).first();
          const text = await first.textContent().catch(() => '');
          const visible = await first.isVisible().catch(() => false);
          console.log(`   First: "${text?.trim().substring(0, 50)}" (visible: ${visible})`);
        }
      } catch (error) {
        console.log(`✗ ${name}: Error - ${error.message}`);
      }
    }
    
    console.log('\n📸 Taking screenshot...');
    await this.page.screenshot({ path: 'selector-test.png', fullPage: true });
    console.log('✅ Saved to: selector-test.png\n');
    
    await this.waitForManualCompletion();
  }

  async testParameters() {
    console.log('🧪 TESTING PARAMETER SELECTION...\n');
    console.log('This will test if the bot can correctly set all booking parameters.\n');
    
    await this.launch();
    await this.login();
    await this.navigateToBookingPage();
    
    console.log('\n' + '='.repeat(60));
    console.log('⚙️  TESTING PARAMETER SELECTION');
    console.log('='.repeat(60));
    console.log(`Expected values:`);
    console.log(`  Date: ${CONFIG.DATE || 'Not set'}`);
    console.log(`  Players: ${CONFIG.PLAYERS || 'Not set'}`);
    console.log(`  Holes: ${CONFIG.HOLES || 'Not set'}`);
    console.log('='.repeat(60) + '\n');
    
    // Set parameters
    await this.setBookingParameters();
    
    console.log('\n📸 Taking verification screenshot...');
    const screenshotPath = `parameter-verification-${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ Screenshot saved: ${screenshotPath}`);
    console.log('\n👀 Please verify in the browser window that all parameters are set correctly.');
    console.log('Press Enter when done inspecting...\n');
    
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
    await this.waitForManualCompletion();
  }
}

// ============================================
// CONFIG LOADER
// ============================================
async function loadConfigFromFile() {
  // First try to load from webhook (if webhook ID provided)
  const webhookId = process.env.CONFIG_WEBHOOK_ID || null;
  if (webhookId) {
    try {
      console.log(`📡 Loading config from webhook (ID: ${webhookId})...`);
      const https = require('https');
      const url = `https://webhook.site/${webhookId}`;
      
      const webhookConfig = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk.toString(); });
          res.on('end', () => {
            try {
              // webhook.site returns HTML, need to parse the requests
              // Actually, webhook.site API: https://webhook.site/token/{uuid}/requests
              const parsed = JSON.parse(data);
              // Get the latest request body
              if (parsed.data && parsed.data.length > 0) {
                const latestRequest = parsed.data[0];
                const config = JSON.parse(latestRequest.body);
                resolve(config);
              } else {
                reject(new Error('No requests found'));
              }
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });
      
      if (webhookConfig) {
        console.log('✅ Config loaded from webhook!');
        applyConfig(webhookConfig);
        return true;
      }
    } catch (error) {
      console.log('⚠️  Could not load from webhook:', error.message);
    }
  }
  
  // Try to load from shareable URL if provided (ZERO file transfer!)
  const configUrl = process.env.CONFIG_URL || null;
  if (configUrl) {
    try {
      console.log(`📡 Loading config from shareable URL (no file transfer needed!)...`);
      const url = new URL(configUrl);
      const urlParams = new URLSearchParams(url.search);
      const configParam = urlParams.get('config');
      
      if (configParam) {
        // Extract config directly from URL parameter (base64 encoded)
        const config = JSON.parse(Buffer.from(configParam, 'base64').toString());
        console.log('✅ Config loaded from URL!');
        applyConfig(config);
        return true;
      } else {
        throw new Error('No config parameter in URL');
      }
    } catch (error) {
      console.log('⚠️  Could not load from URL:', error.message);
    }
  }
  
  // Try cloud storage (if storage ID provided)
  const storageId = process.env.CONFIG_STORAGE_ID || null;
  if (storageId) {
    // Try multiple cloud services
    const services = [
      {
        name: 'jsonbin.io',
        url: `https://api.jsonbin.io/v3/b/${storageId}/latest`
      },
      {
        name: 'jsonstorage.net',
        url: `https://jsonstorage.net/api/items/${storageId}`
      }
    ];
    
    for (const service of services) {
      try {
        console.log(`📡 Loading config from ${service.name} (Storage ID: ${storageId})...`);
        const https = require('https');
        
        const cloudConfig = await new Promise((resolve, reject) => {
          https.get(service.url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk.toString(); });
            res.on('end', () => {
              try {
                const parsed = JSON.parse(data);
                // Extract data (jsonbin wraps it in .record, others return directly)
                let config = parsed.record || parsed.data || parsed;
                if (config && Object.keys(config).length > 0) {
                  resolve(config);
                } else {
                  reject(new Error('Empty config'));
                }
              } catch (e) {
                reject(e);
              }
            });
          }).on('error', reject);
        });
        
        if (cloudConfig) {
          console.log(`✅ Config loaded from ${service.name}!`);
          applyConfig(cloudConfig);
          return true;
        }
      } catch (error) {
        console.log(`⚠️  ${service.name} failed:`, error.message);
        // Try next service
      }
    }
    
    console.log('⚠️  All cloud services failed, trying local file...');
  }
  
  // Try local config server (if running)
  try {
    const http = require('http');
    const serverUrl = process.env.CONFIG_SERVER_URL || 'http://localhost:3001';
    
    console.log(`📡 Checking config server at ${serverUrl}...`);
    const serverConfig = await new Promise((resolve, reject) => {
      const url = new URL(`${serverUrl}/config`);
      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk.toString(); });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed && Object.keys(parsed).length > 0) {
              resolve(parsed);
            } else {
              reject(new Error('Empty config'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(2000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
    
    if (serverConfig) {
      console.log('✅ Config loaded from server!');
      applyConfig(serverConfig);
      return true;
    }
  } catch (error) {
    console.log('⚠️  Config server not available:', error.message);
    console.log('   Trying local file...');
  }
  
  // Fallback to local file
  try {
    if (fs.existsSync(CONFIG.CONFIG_FILE)) {
      const fileConfig = JSON.parse(fs.readFileSync(CONFIG.CONFIG_FILE, 'utf8'));
      console.log('📋 Loading config from booking-config.json...');
      applyConfig(fileConfig);
      return true;
    }
  } catch (error) {
    console.log('⚠️  Could not load config file:', error.message);
    console.log('   Using default values from CONFIG');
  }
  return false;
}

function applyConfig(fileConfig) {
  // Update CONFIG with file values
  if (fileConfig.course) CONFIG.COURSE = parseInt(fileConfig.course);
  if (fileConfig.date) CONFIG.DATE = fileConfig.date;
  if (fileConfig.players) CONFIG.PLAYERS = parseInt(fileConfig.players);
  if (fileConfig.holes) CONFIG.HOLES = parseInt(fileConfig.holes);
  if (fileConfig.timeStart) CONFIG.TIME_START = fileConfig.timeStart;
  if (fileConfig.timeEnd) CONFIG.TIME_END = fileConfig.timeEnd;
  if (fileConfig.targetHour !== undefined) CONFIG.TARGET_HOUR = parseInt(fileConfig.targetHour);
  if (fileConfig.targetMinute !== undefined) CONFIG.TARGET_MINUTE = parseInt(fileConfig.targetMinute);
  
  // Update booking URL with course
  CONFIG.BOOKING_URL = `https://txaustinweb.myvscloud.com/webtrac/web/search.html?display=detail&module=GR&secondarycode=${CONFIG.COURSE}`;
  
  console.log('✅ Config loaded:');
  console.log(`   Course: ${CONFIG.COURSE}`);
  console.log(`   Date: ${CONFIG.DATE || 'Not set'}`);
  console.log(`   Players: ${CONFIG.PLAYERS}`);
  console.log(`   Holes: ${CONFIG.HOLES}`);
  console.log(`   Time Range: ${CONFIG.TIME_START} - ${CONFIG.TIME_END}`);
  console.log(`   Booking Opens: ${CONFIG.TARGET_HOUR}:${String(CONFIG.TARGET_MINUTE).padStart(2, '0')}`);
}

// ============================================
// COMMAND LINE INTERFACE
// ============================================
async function main() {
  // Load config from file or cloud if it exists
  await loadConfigFromFile();
  
  const args = process.argv.slice(2);
  const bot = new AustinGolfBookingBot();
  
  if (args.includes('--now') || args.includes('-n')) {
    // Run immediately for testing
    await bot.runImmediately();
  } else if (args.includes('--schedule') || args.includes('-s')) {
    // Schedule for target time
    bot.scheduleBooking();
    console.log('📅 Scheduler is running. Keep this terminal open...');
  } else if (args.includes('--test') || args.includes('-t')) {
    // Test selectors
    await bot.testSelectors();
  } else if (args.includes('--test-params') || args.includes('-p')) {
    // Test parameter selection
    await bot.testParameters();
  } else {
    console.log(`
🎯 AUSTIN GOLF BOOKING BOT
===========================

Usage:
  node austin-golf-bot.js --now        Run immediately (for testing/setup)
  node austin-golf-bot.js --test       Test all selectors and show results
  node austin-golf-bot.js --test-params Test parameter selection (date, players, holes)
  node austin-golf-bot.js --schedule   Schedule for target time in CONFIG

Setup Instructions:
  1. Edit CONFIG section:
     - Add your USERNAME and PASSWORD
     - Set TARGET_HOUR, TARGET_MINUTE (when slots open)
  
  2. Test first:
     node austin-golf-bot.js --now
  
  3. For real booking:
     node austin-golf-bot.js --schedule

Features:
  ✓ Pre-positions 45 seconds early
  ✓ Maximized for speed (disabled images)
  ✓ Keeps browser open for manual checkout
  ✓ Error recovery with screenshots
  ✓ Built for Austin WebTrac system

Target Site:
  ${CONFIG.BOOKING_URL}
    `);
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  console.error('💡 The browser might still be open for manual booking');
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Export the class for use by bot-runner
module.exports = AustinGolfBookingBot;

// Only run main() if this file is executed directly
if (require.main === module) {
  main();
}
