# Configuration Template

Copy this into austin-golf-bot.js at the CONFIG section:

```javascript
const CONFIG = {
  // ==========================================
  // YOUR CREDENTIALS (Required)
  // ==========================================
  USERNAME: 'your_username_here',  // ← CHANGE THIS
  PASSWORD: 'your_password_here',  // ← CHANGE THIS
  
  // ==========================================
  // BOOKING TIME (Required)
  // ==========================================
  // When do tee times open? (24-hour format)
  TARGET_HOUR: 7,      // ← CHANGE THIS (e.g., 7 = 7 AM, 18 = 6 PM)
  TARGET_MINUTE: 0,    // ← Usually 0
  TARGET_SECOND: 0,    // ← Usually 0
  
  // ==========================================
  // BOOKING URL (Usually stays the same)
  // ==========================================
  BOOKING_URL: 'https://txaustinweb.myvscloud.com/webtrac/web/search.html?display=detail&module=GR&secondarycode=3',
  LOGIN_URL: 'https://txaustinweb.myvscloud.com/webtrac/web/login.html',
  
  // ==========================================
  // ADVANCED SETTINGS (Optional - can leave as-is)
  // ==========================================
  
  // Booking preferences (leave null for defaults)
  DATE: null,          // null = use default, or 'YYYY-MM-DD'
  PLAYERS: null,       // null = use default, or set number
  
  // Timing settings
  PRE_POSITION_SECONDS: 45,  // How early to log in (45 = 45 seconds)
  
  // Speed optimizations
  DISABLE_IMAGES: true,      // true = faster loading
  DISABLE_CSS: false,        // false = keep CSS (needed for visibility)
  MAX_WAIT_FOR_SLOTS: 10000, // Max time to wait (milliseconds)
  
  // ==========================================
  // SELECTORS (Advanced - only change if needed)
  // ==========================================
  SELECTORS: {
    // Login page
    usernameInput: 'input[name="loginName"]',
    passwordInput: 'input[name="loginPassword"]',
    loginButton: 'input[type="submit"][value="Log In"]',
    
    // Search page
    searchButton: 'input[type="submit"][value="Search"]',
    
    // Time slots
    timeSlotContainer: 'table.grid tbody tr',
    addToCartIcon: 'a[onclick*="addtocart"]',
    availableSlots: 'td.available',
    plusIcon: 'img[alt="+"]',
    
    // Cart
    cartLink: 'a[href*="cart"]',
    checkoutButton: 'input[value="Checkout"]',
  },
};
```

## Examples

### Morning Booking (7:00 AM)
```javascript
TARGET_HOUR: 7,
TARGET_MINUTE: 0,
TARGET_SECOND: 0,
```

### Evening Booking (6:00 PM)
```javascript
TARGET_HOUR: 18,  // 6 PM in 24-hour format
TARGET_MINUTE: 0,
TARGET_SECOND: 0,
```

### Noon Booking
```javascript
TARGET_HOUR: 12,
TARGET_MINUTE: 0,
TARGET_SECOND: 0,
```

### Non-standard Time (7:30 AM)
```javascript
TARGET_HOUR: 7,
TARGET_MINUTE: 30,
TARGET_SECOND: 0,
```

## Common Golf Courses

If you're booking different courses, change secondarycode in BOOKING_URL:

- **Morris Williams**: secondarycode=1
- **Lions Municipal**: secondarycode=2
- **Jimmy Clay**: secondarycode=3
- **Hancock**: secondarycode=4
- **Roy Kizer**: secondarycode=5

Example for Morris Williams:
```javascript
BOOKING_URL: 'https://txaustinweb.myvscloud.com/webtrac/web/search.html?display=detail&module=GR&secondarycode=1',
```
