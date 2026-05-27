// Nabhik Matrimonial App Routing & Core Logic

document.addEventListener('DOMContentLoaded', () => {
  // Initialize App
  initRouter();
  
  // Listen for hash changes
  window.addEventListener('hashchange', initRouter);
  
  // Update header auth visual state
  updateHeaderAuth();
  
  // Bind global clicks
  document.body.addEventListener('click', handleGlobalClicks);
});

// Update auth buttons in header based on active session
function updateHeaderAuth() {
  const authContainer = document.getElementById('header-auth-container');
  if (!authContainer) return;
  
  if (state.currentUser) {
    const isPremium = state.currentUser.membership && state.currentUser.membership !== 'Free';
    authContainer.innerHTML = `
      <span style="color: var(--color-gold); font-size: 0.85rem; font-weight: 600; background: rgba(212,175,55,0.1); padding: 4px 10px; border-radius: 20px;">
        👤 ${state.currentUser.name} ${isPremium ? `👑 ${state.currentUser.membership}` : ''}
      </span>
      <a href="#/dashboard" class="btn-login" style="padding: 6px 14px; font-size: 0.8rem;">Dashboard</a>
      <button onclick="handleLogout()" class="btn-register" style="padding: 6px 14px; font-size: 0.8rem; background: #c62828; color: #fff;">Logout</button>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="#/login" class="btn-login">Login</a>
      <a href="#/register" class="btn-register">Register Free</a>
    `;
  }
  
  // Update header navigation links dynamically based on session
  updateNavigation();
}

// Dynamically render navbar links based on login state
function updateNavigation() {
  const navContainer = document.getElementById('nav-links-container');
  if (!navContainer) return;
  
  const hash = window.location.hash || '#/';
  
  const makeLink = (href, text) => {
    const isActive = (hash === href || (hash === '#/' && href === '#/'));
    return `<li><a href="${href}" class="${isActive ? 'active' : ''}">${text}</a></li>`;
  };
  
  if (state.currentUser) {
    // Show full menu when logged in
    navContainer.innerHTML = `
      ${makeLink('#/', 'Home')}
      ${makeLink('#/about', 'About Us')}
      ${makeLink('#/search', 'Search Profiles')}
      ${makeLink('#/membership', 'Membership')}
      ${makeLink('#/stories', 'Success Stories')}
      ${makeLink('#/events', 'Events')}
      ${makeLink('#/blogs', 'Blog')}
      ${makeLink('#/contact', 'Contact')}
      ${makeLink('#/help', 'Help')}
      <li><a href="#/admin" style="color: var(--color-gold-light); font-weight: 600;">Admin</a></li>
    `;
  } else {
    // Show only About Us and Help when not logged in
    navContainer.innerHTML = `
      ${makeLink('#/about', 'About Us')}
      ${makeLink('#/help', 'Help')}
    `;
  }
}

// Global click event dispatcher (e.g. for closing modals)
function handleGlobalClicks(e) {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal();
  }
}

// Close active modal
function closeModal() {
  const modal = document.querySelector('.modal-overlay.active');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Hash Router
function initRouter() {
  const hash = window.location.hash || '#/';
  const appView = document.getElementById('app-view');
  if (!appView) return;
  
  // Reset scroll
  window.scrollTo(0, 0);
  
  // Close modals
  closeModal();
  
  // Match path
  let path = hash;
  let params = null;
  
  if (hash.startsWith('#/profile/')) {
    path = '#/profile/:id';
    params = hash.split('#/profile/')[1];
  }
  
  // Active nav highlighting
  document.querySelectorAll('.nav-links a').forEach(a => {
    const aHash = a.getAttribute('href');
    if (hash === aHash || (hash === '#/' && aHash === '#') || (hash.startsWith('#/profile') && aHash === '#/search')) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });

  // Render view
  switch (path) {
    case '#/':
      renderHome(appView);
      break;
    case '#/about':
      renderAbout(appView);
      break;
    case '#/search':
      renderSearch(appView);
      break;
    case '#/profile/:id':
      renderProfileDetails(appView, params);
      break;
    case '#/register':
      renderRegister(appView);
      break;
    case '#/login':
      renderLogin(appView);
      break;
    case '#/dashboard':
      renderDashboard(appView);
      break;
    case '#/membership':
      renderMembership(appView);
      break;
    case '#/stories':
      renderStories(appView);
      break;
    case '#/events':
      renderEvents(appView);
      break;
    case '#/blogs':
      renderBlogs(appView);
      break;
    case '#/contact':
      renderContact(appView);
      break;
    case '#/policy':
      renderPrivacyPolicy(appView);
      break;
    case '#/terms':
      renderTerms(appView);
      break;
    case '#/admin':
      renderAdmin(appView);
      break;
    case '#/help':
      renderHelp(appView);
      break;
    default:
      renderHome(appView);
  }
  
  updateHeaderAuth();
}

/* ==========================================================================
   VIEW RENDERERS
   ========================================================================== */

// 1. HOME VIEW
function renderHome(container) {
  // Grab featured profiles
  const featured = state.profiles.filter(p => p.featured && p.verified).slice(0, 5);
  let featuredHtml = featured.map(p => makeProfileCard(p)).join('');
  
  // Grab success stories
  const stories = state.stories.slice(0, 3);
  let storiesHtml = stories.map(s => makeSuccessCard(s)).join('');
  
  // Grab events
  const events = state.events.slice(0, 4);
  let eventsHtml = events.map(e => makeEventCard(e)).join('');

  container.innerHTML = `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="bell-container bell-left"><svg class="bell-svg" viewBox="0 0 24 24"><path d="M12,2A2,2,0,0,0,10,4V5.09A7,7,0,0,0,5,12v4H3v2H21V16H19V12a7,7,0,0,0,5-6.91V4a2,2,0,0,0-2-2H12m0,20a3,3,0,0,0,3-3H9a3,3,0,0,0,3,3Z"/></svg></div>
      <div class="bell-container bell-right"><svg class="bell-svg" viewBox="0 0 24 24"><path d="M12,2A2,2,0,0,0,10,4V5.09A7,7,0,0,0,5,12v4H3v2H21V16H19V12a7,7,0,0,0,5-6.91V4a2,2,0,0,0-2-2H12m0,20a3,3,0,0,0,3-3H9a3,3,0,0,0,3,3Z"/></svg></div>
      
      <div class="container hero-grid">
        <div class="hero-content">
          <h1>Where Tradition<br>Meets <span class="text-gold">Perfect Match</span></h1>
          <p>Nabhik Matrimonial – trusted by thousands of Nabhik families for genuine, secure, and compatible relationships built on understanding.</p>


        </div>
        <div class="hero-image-container">
          <div class="hero-image-frame">
            <!-- Reference the generated hero image -->
            <img src="images/hero.png" alt="Nabhik Wedding Couple Logo">
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Search Section -->
    <div class="container quick-search-wrapper">
      <div class="quick-search-panel">
        <h3>✦ Find Your Life Partner ✦</h3>
        <form class="quick-search-form" onsubmit="handleQuickSearch(event)">
          <div class="search-field">
            <label>Looking For</label>
            <select id="qs-gender">
              <option value="Female">Bride</option>
              <option value="Male">Groom</option>
            </select>
          </div>
          
          <div class="search-field">
            <label>Age</label>
            <div class="search-field-range">
              <select id="qs-age-from">
                <option value="18">18</option>
                <option value="21">21</option>
                <option value="25">25</option>
              </select>
              <span>to</span>
              <select id="qs-age-to">
                <option value="40" selected>40</option>
                <option value="30">30</option>
                <option value="35">35</option>
              </select>
            </div>
          </div>
          
          <div class="search-field">
            <label>State / City</label>
            <select id="qs-city">
              <option value="">Select City</option>
              <option value="Pune">Pune</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Nashik">Nashik</option>
              <option value="Aurangabad">Aurangabad</option>
            </select>
          </div>
          
          <div class="search-field">
            <label>Education</label>
            <select id="qs-education">
              <option value="">Select</option>
              <option value="B.Tech">B.Tech</option>
              <option value="MBA">MBA</option>
              <option value="MCA">MCA</option>
              <option value="B.Com">B.Com</option>
            </select>
          </div>
          
          <div class="search-field">
            <label>Profession</label>
            <select id="qs-profession">
              <option value="">Select</option>
              <option value="Engineer">Engineer / Developer</option>
              <option value="Manager">Manager</option>
              <option value="Accountant">Accountant</option>
              <option value="Business">Business</option>
            </select>
          </div>
          
          <button type="submit" class="btn-search-match">🔍 Search Match</button>
        </form>
      </div>
    </div>

    <!-- Why Choose Us -->
    <section class="section-padding container">
      <div class="traditional-header">
        <h2>Why Choose Nabhik Matrimonial?</h2>
        <div class="traditional-divider"><span class="icon">✦</span></div>
      </div>
      
      <div class="why-choose-grid">
        <div class="why-card">
          <div class="why-icon-container">🛡️</div>
          <h3>Verified Profiles</h3>
          <p>Every profile is manually verified with contact checks for your safety and security.</p>
        </div>
        <div class="why-card">
          <div class="why-icon-container">👥</div>
          <h3>Trusted Community</h3>
          <p>Dedicated exclusive platform matching values, custom for Nabhik society families.</p>
        </div>
        <div class="why-card">
          <div class="why-icon-container">🔒</div>
          <h3>Privacy Protection</h3>
          <p>Your details and photos are protected. Control who views your contact information.</p>
        </div>
        <div class="why-card">
          <div class="why-icon-container">❤️</div>
          <h3>Smart Matchmaking</h3>
          <p>Advanced filters let you narrow matches by height, education, location, and habits.</p>
        </div>
      </div>
    </section>

    <!-- Featured Profiles Section -->
    <section class="section-padding bg-maroon-section">
      <div class="container">
        <div class="featured-header-row">
          <div class="traditional-header">
            <h2>Featured Profiles</h2>
            <div class="traditional-divider"><span class="icon">✦</span></div>
          </div>
          <a href="#/search" class="btn btn-outline">View All</a>
        </div>
        
        <div class="featured-slider-container">
          <button class="slider-arrow slider-arrow-left" onclick="showToast('Slider scrolled left')">◀</button>
          <div class="featured-slider">
            ${featuredHtml}
          </div>
          <button class="slider-arrow slider-arrow-right" onclick="showToast('Slider scrolled right')">▶</button>
        </div>
      </div>
    </section>

    <!-- Membership Plans Section -->
    <section class="section-padding container">
      <div class="traditional-header">
        <h2>Membership Plans</h2>
        <div class="traditional-divider"><span class="icon">✦</span></div>
      </div>
      
      <div class="membership-grid">
        <!-- Silver Plan -->
        <div class="membership-card">
          <div class="plan-badge silver-badge">🥈</div>
          <h3>Silver Plan</h3>
          <div class="plan-price">₹999 <span>/ 3 Months</span></div>
          <ul class="plan-features">
            <li>View 50 Profiles</li>
            <li>Send Unlimited Interests</li>
            <li>Basic Search Filters</li>
            <li>Email Support</li>
          </ul>
          <button onclick="handleSelectPlan('Silver', 999)" class="plan-btn">Choose Plan</button>
        </div>
        
        <!-- Gold Plan -->
        <div class="membership-card featured-plan">
          <div class="plan-ribbon">Most Popular</div>
          <div class="plan-badge gold-badge">🥇</div>
          <h3>Gold Plan</h3>
          <div class="plan-price">₹1999 <span>/ 6 Months</span></div>
          <ul class="plan-features">
            <li>View Unlimited Profiles</li>
            <li>Direct Contact Access</li>
            <li>Chat Feature with Members</li>
            <li>Advanced Search Filters</li>
            <li>Priority Support</li>
          </ul>
          <button onclick="handleSelectPlan('Gold', 1999)" class="plan-btn btn-gold">Choose Plan</button>
        </div>
        
        <!-- Platinum Plan -->
        <div class="membership-card">
          <div class="plan-badge platinum-badge">💎</div>
          <h3>Platinum Plan</h3>
          <div class="plan-price">₹2999 <span>/ 12 Months</span></div>
          <ul class="plan-features">
            <li>All Gold Plan Features</li>
            <li>Priority Profile Highlight</li>
            <li>Profile Verification Badge</li>
            <li>Dedicated Kundali/Support</li>
          </ul>
          <button onclick="handleSelectPlan('Platinum', 2999)" class="plan-btn">Choose Plan</button>
        </div>
      </div>
    </section>

    <!-- Success Stories -->
    <section class="section-padding bg-maroon-section">
      <div class="container">
        <div class="featured-header-row">
          <div class="traditional-header">
            <h2>Success Stories</h2>
            <div class="traditional-divider"><span class="icon">✦</span></div>
          </div>
          <a href="#/stories" class="btn btn-outline">View All Stories</a>
        </div>
        
        <div class="success-slider-container">
          <div class="success-slider">
            ${storiesHtml}
          </div>
          <div class="slider-dots">
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    </section>

    <!-- Community Events & Announcements -->
    <section class="section-padding container">
      <div class="featured-header-row">
        <div class="traditional-header">
          <h2>Community Events & News</h2>
          <div class="traditional-divider"><span class="icon">✦</span></div>
        </div>
        <a href="#/events" class="btn btn-maroon">View All Events</a>
      </div>
      
      <div class="events-grid">
        ${eventsHtml}
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta-section">
      <div class="container">
        <h2>Ready to Find Your Life Partner?</h2>
        <p>Join Nabhik Matrimonial today to connect with matching verified profiles in our community. Registration is free and takes only a few minutes.</p>
        <a href="#/register" class="btn btn-primary" style="font-size: 1.1rem; padding: 16px 36px;">Register Free Now</a>
      </div>
    </section>

    <!-- App Promo Section -->
    <section class="app-promo-section">
      <div class="container app-promo-content">
        <h2>Matrimony App Coming Soon</h2>
        <p>Stay connected on the go. Mobile applications for Android and iOS devices are in development.</p>
        <div class="app-badges">
          <div class="app-badge-btn">
            <span class="icon">🤖</span>
            <div>
              <span>Get it on</span>
              <strong>Google Play</strong>
            </div>
          </div>
          <div class="app-badge-btn">
            <span class="icon">🍎</span>
            <div>
              <span>Download on the</span>
              <strong>App Store</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

// 2. ABOUT US VIEW
function renderAbout(container) {
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>About Us</h1>
        <p>HOME / ABOUT US</p>
      </div>
    </div>
    
    <div class="container section-padding">
      <div class="about-grid">
        <div class="about-text">
          <h2>About Nabhik Matrimonial</h2>
          <p>Nabhik Matrimonial is a dedicated matrimonial platform created specifically for the Nabhik community. Our mission is to help individuals and families find suitable, compatible life partners with trust, privacy, and simplicity.</p>
          <p>We believe marriage is a sacred bond built on understanding, tradition, and compatibility. Our platform makes matchmaking easier with advanced search filters, verified profiles, and secure communication tools, allowing families to connect seamlessly across different regions.</p>
        </div>
        <div class="about-image">
          <!-- Stylized Indian traditional mandala illustration -->
          <svg viewBox="0 0 400 300" style="background-color: var(--color-maroon-dark); width: 100%; height: auto; display: block;">
            <circle cx="200" cy="150" r="100" fill="none" stroke="var(--color-gold)" stroke-width="2" />
            <circle cx="200" cy="150" r="80" fill="none" stroke="var(--color-gold-trans)" stroke-width="2" stroke-dasharray="5 5" />
            <polygon points="200,60 230,120 290,150 230,180 200,240 170,180 110,150 170,120" fill="none" stroke="var(--color-gold)" stroke-width="1.5" />
            <circle cx="200" cy="150" r="10" fill="var(--color-gold)" />
          </svg>
        </div>
      </div>
      
      <div class="vision-mission-row">
        <div class="vm-card">
          <h3>Our Vision</h3>
          <p>To become the most trusted and preferred matrimonial platform for the Nabhik community across India, bringing families together while preserving our traditional social values and cultural heritage.</p>
        </div>
        <div class="vm-card">
          <h3>Our Mission</h3>
          <p>We aim to build trusted community connections, simplify the partner search process, maintain strict privacy and safety regulations, and support Nabhik families in finding genuine, verified matches.</p>
        </div>
      </div>
    </div>
  `;
}

// HELP & SUPPORT VIEW
function renderHelp(container) {
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Help & Support</h1>
        <p>HOME / HELP & SUPPORT</p>
      </div>
    </div>
    
    <div class="container section-padding">
      <div class="help-layout">
        
        <!-- FAQs Section -->
        <div class="faq-section">
          <div class="traditional-header" style="text-align: left; margin-bottom: 24px;">
            <h2>Frequently Asked Questions</h2>
            <div class="traditional-divider" style="margin-left: 0;"><span class="icon">✦</span></div>
          </div>
          
          <div class="faq-list" style="display: flex; flex-direction: column; gap: 16px;">
            <details class="faq-item" style="border: 1px solid var(--color-gold-trans); border-radius: var(--border-radius-sm); padding: 16px; background: rgba(255,255,255,0.02); transition: var(--transition-fast);">
              <summary style="font-weight: 600; cursor: pointer; color: var(--color-gold-light); list-style: none; display: flex; justify-content: space-between; align-items: center;">
                How do I register on Nabhik Matrimonial?
                <span class="faq-arrow" style="color: var(--color-gold);">▼</span>
              </summary>
              <p style="margin-top: 12px; font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6;">
                Click on the "Register Free" button on the top right. Fill out your details (Personal Info, Education, Location, etc.) and complete the registration. After registration, we will send an OTP via SMS to verify your mobile number. Once verified, you can log in and find matches.
              </p>
            </details>
            
            <details class="faq-item" style="border: 1px solid var(--color-gold-trans); border-radius: var(--border-radius-sm); padding: 16px; background: rgba(255,255,255,0.02); transition: var(--transition-fast);">
              <summary style="font-weight: 600; cursor: pointer; color: var(--color-gold-light); list-style: none; display: flex; justify-content: space-between; align-items: center;">
                How does the profile verification work?
                <span class="faq-arrow" style="color: var(--color-gold);">▼</span>
              </summary>
              <p style="margin-top: 12px; font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6;">
                To keep our community safe, every registered profile is reviewed by our administration team. You may be requested to upload an identity document. Approved profiles receive a gold "✔ Verified" badge.
              </p>
            </details>
            
            <details class="faq-item" style="border: 1px solid var(--color-gold-trans); border-radius: var(--border-radius-sm); padding: 16px; background: rgba(255,255,255,0.02); transition: var(--transition-fast);">
              <summary style="font-weight: 600; cursor: pointer; color: var(--color-gold-light); list-style: none; display: flex; justify-content: space-between; align-items: center;">
                Is my personal information and contact number secure?
                <span class="faq-arrow" style="color: var(--color-gold);">▼</span>
              </summary>
              <p style="margin-top: 12px; font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6;">
                Yes, absolutely. We prioritize your privacy. Your contact details are only shared with premium members if you choose to accept their interest, or you can manage this from your privacy settings in the dashboard.
              </p>
            </details>
            
            <details class="faq-item" style="border: 1px solid var(--color-gold-trans); border-radius: var(--border-radius-sm); padding: 16px; background: rgba(255,255,255,0.02); transition: var(--transition-fast);">
              <summary style="font-weight: 600; cursor: pointer; color: var(--color-gold-light); list-style: none; display: flex; justify-content: space-between; align-items: center;">
                What are the benefits of Membership Plans?
                <span class="faq-arrow" style="color: var(--color-gold);">▼</span>
              </summary>
              <p style="margin-top: 12px; font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6;">
                Premium members get benefits like viewing direct phone numbers, unlimited chat messages, sending highlighted interests, and getting higher priority in searches. Check out our Membership page for details.
              </p>
            </details>
          </div>
        </div>
        
        <!-- Support Ticket / Contact Sidebar -->
        <div class="support-sidebar">
          <div class="contact-card" style="border: 1.5px solid var(--color-gold); border-radius: var(--border-radius-md); padding: 24px; background: rgba(86,13,25,0.4); text-align: center; margin-bottom: 24px; position: relative; overflow: hidden;">
            <h3 style="color: var(--color-gold); font-family: var(--font-display); font-size: 1.3rem; margin-bottom: 8px;">Contact Support</h3>
            <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 16px;">We are available to help you find your perfect match.</p>
            <div style="font-size: 0.9rem; line-height: 1.8; margin-bottom: 16px;">
              <p>📧 <strong>support@nabhikmatrimonial.com</strong></p>
              <p>📞 <strong>+91 98765 43210</strong></p>
            </div>
            <p style="font-size: 0.8rem; color: var(--color-gold-light);">Nabhik Society Office, Pune, Maharashtra</p>
          </div>
          
          <div class="ticket-card" style="border: 1px solid var(--color-gold-trans); border-radius: var(--border-radius-md); padding: 20px; background: rgba(255,255,255,0.02);">
            <h4 style="margin-bottom: 12px; color: var(--color-gold-light);">Submit a Query</h4>
            <form onsubmit="event.preventDefault(); showToast('Your query has been submitted! Support team will reach out to you.'); this.reset();" style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <input type="text" placeholder="Full Name" required style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--color-gold-trans); border-radius: 4px; color: white; font-size: 0.85rem;" autocomplete="off">
              </div>
              <div>
                <input type="email" placeholder="Email Address" required style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--color-gold-trans); border-radius: 4px; color: white; font-size: 0.85rem;" autocomplete="off">
              </div>
              <div>
                <textarea placeholder="How can we help you?" rows="4" required style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--color-gold-trans); border-radius: 4px; color: white; font-size: 0.85rem; resize: none;"></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="padding: 8px; font-size: 0.85rem; width: 100%;">Send Message</button>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  `;
}

// 3. SEARCH VIEW WITH FILTERS
function renderSearch(container) {
  // Build sidebar filters HTML
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Search Profiles</h1>
        <p>HOME / SEARCH PROFILES</p>
      </div>
    </div>
    
    <div class="container search-view-layout">
      <!-- Sidebar Filters -->
      <aside class="sidebar-filters">
        <h3>Filter Profiles</h3>
        
        <div class="filter-group">
          <label>Looking For</label>
          <select id="filter-gender" onchange="runProfileSearch()">
            <option value="Female">Bride</option>
            <option value="Male">Groom</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Age Range</label>
          <div class="search-field-range">
            <select id="filter-age-from" onchange="runProfileSearch()">
              <option value="18">18</option>
              <option value="22">22</option>
              <option value="26">26</option>
            </select>
            <span>to</span>
            <select id="filter-age-to" onchange="runProfileSearch()">
              <option value="40" selected>40</option>
              <option value="30">30</option>
              <option value="35">35</option>
            </select>
          </div>
        </div>
        
        <div class="filter-group">
          <label>Location (City)</label>
          <select id="filter-city" onchange="runProfileSearch()">
            <option value="">All Cities</option>
            <option value="Pune">Pune</option>
            <option value="Nagpur">Nagpur</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Nashik">Nashik</option>
            <option value="Aurangabad">Aurangabad</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Education</label>
          <select id="filter-education" onchange="runProfileSearch()">
            <option value="">All Degrees</option>
            <option value="B.Tech">B.Tech</option>
            <option value="MBA">MBA</option>
            <option value="MCA">MCA</option>
            <option value="B.Com">B.Com</option>
            <option value="Doctor">Doctor</option>
            <option value="Business">Business</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Income</label>
          <select id="filter-income" onchange="runProfileSearch()">
            <option value="">All</option>
            <option value="high">Above ₹1,000,000 / Yr</option>
            <option value="mid">Above ₹500,000 / Yr</option>
          </select>
        </div>
        
        <button onclick="resetSearchFilters()" class="btn btn-outline" style="width: 100%; margin-top: 10px; font-size: 0.85rem; padding: 10px;">Reset Filters</button>
      </aside>
      
      <!-- Search Results Area -->
      <section>
        <div class="search-results-header">
          <div>
            <h2 id="search-count-title" style="font-size: 1.5rem; color: var(--color-maroon);">Showing Profiles</h2>
          </div>
          <div>
            <select id="sort-select" onchange="runProfileSearch()" style="padding: 6px 12px; font-size: 0.85rem; border: 1px solid var(--color-border); border-radius: 4px;">
              <option value="age-asc">Sort by: Age (Low to High)</option>
              <option value="age-desc">Sort by: Age (High to Low)</option>
            </select>
          </div>
        </div>
        
        <div id="search-results-grid" class="search-results-grid">
          <!-- Dynamically filled -->
        </div>
      </section>
    </div>
  `;
  
  // Run initial search
  runProfileSearch();
}

// 4. PROFILE DETAIL VIEW
function renderProfileDetails(container, profileId) {
  const idNum = parseInt(profileId);
  const profile = state.profiles.find(p => p.id === idNum);
  
  if (!profile) {
    container.innerHTML = `<div class="container section-padding text-center"><h2>Profile not found</h2><a href="#/search" class="btn btn-maroon" style="margin-top: 20px;">Back to Search</a></div>`;
    return;
  }
  
  const isShortlisted = state.shortlisted.includes(profile.id);
  const isInterestSent = state.interestsSent.includes(profile.id);
  const avatar = getSvgAvatar(profile.gender, profile.id, profile.name);
  
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Profile of ${profile.name}</h1>
        <p>HOME / PROFILE DETAILS</p>
      </div>
    </div>
    
    <div class="container profile-detail-grid">
      <!-- Left sidebar -->
      <div class="profile-detail-sidebar">
        <img src="${avatar}" alt="${profile.name}" class="profile-detail-avatar">
        
        <div class="profile-detail-actions">
          <button onclick="handleSendInterest(${profile.id}, true)" class="btn btn-primary" style="width: 100%;">
            ${isInterestSent ? '❤️ Interest Sent' : '✉ Send Interest'}
          </button>
          
          <button onclick="handleToggleShortlist(${profile.id}, true)" class="btn btn-outline" style="width: 100%; border-color: var(--color-maroon); color: var(--color-maroon);">
            ${isShortlisted ? '★ Shortlisted' : '☆ Shortlist Profile'}
          </button>
          
          <button onclick="handleStartChat(${profile.id})" class="btn btn-maroon" style="width: 100%; background-color: var(--color-maroon-dark);">
            💬 Chat Now
          </button>
          
          <button onclick="handleReportProfile(${profile.id})" style="font-size: 0.8rem; color: #c62828; margin-top: 8px;">
            ⚠️ Report Profile
          </button>
        </div>
      </div>
      
      <!-- Right main info -->
      <div class="profile-detail-main">
        <div class="profile-detail-header">
          <h2>${profile.name} ${profile.verified ? '<span class="text-gold" style="font-size: 1.4rem;" title="Verified Profile">✔</span>' : ''}</h2>
          <p>${profile.profession} | ${profile.location}</p>
        </div>
        
        <!-- Personal Details -->
        <div class="profile-info-section">
          <h3>Personal Information</h3>
          <div class="profile-info-grid">
            <div class="info-item"><span class="info-label">Age</span><span class="info-value">${profile.age} Years</span></div>
            <div class="info-item"><span class="info-label">Height</span><span class="info-value">${profile.height}</span></div>
            <div class="info-item"><span class="info-label">Religion</span><span class="info-value">${profile.religion}</span></div>
            <div class="info-item"><span class="info-label">Community</span><span class="info-value">${profile.community}</span></div>
            <div class="info-item"><span class="info-label">Education</span><span class="info-value">${profile.education}</span></div>
            <div class="info-item"><span class="info-label">Occupation</span><span class="info-value">${profile.profession}</span></div>
            <div class="info-item"><span class="info-label">Annual Income</span><span class="info-value">${profile.income}</span></div>
            <div class="info-item"><span class="info-label">Marital Status</span><span class="info-value">Never Married</span></div>
          </div>
        </div>
        
        <!-- Family Details -->
        <div class="profile-info-section">
          <h3>Family Details</h3>
          <div class="profile-info-grid">
            <div class="info-item"><span class="info-label">Father's Name</span><span class="info-value">${profile.fatherName || 'Rajesh Nabhik'}</span></div>
            <div class="info-item"><span class="info-label">Mother's Name</span><span class="info-value">${profile.motherName || 'Sunita Nabhik'}</span></div>
            <div class="info-item"><span class="info-label">Family Type</span><span class="info-value">${profile.familyType || 'Joint Family'}</span></div>
            <div class="info-item"><span class="info-label">Native Place</span><span class="info-value">${profile.nativePlace || 'Satara, Maharashtra'}</span></div>
          </div>
        </div>
        
        <!-- Lifestyle & Hobbies -->
        <div class="profile-info-section">
          <h3>Lifestyle & Preferences</h3>
          <div class="profile-info-grid">
            <div class="info-item"><span class="info-label">Diet</span><span class="info-value">${profile.foodPreference || 'Vegetarian'}</span></div>
            <div class="info-item"><span class="info-label">Smoke/Drink</span><span class="info-value">${profile.smokingDrinking || 'No Smoking / No Drinking'}</span></div>
            <div class="info-item"><span class="info-label">Hobbies</span><span class="info-value">${profile.hobbies || 'Reading, Traveling'}</span></div>
          </div>
        </div>
        
        <!-- Partner Preferences Lock (Premium Visual Lock) -->
        <div class="profile-info-section" style="background-color: var(--color-cream); border: 1.5px dashed var(--color-gold); border-radius: var(--border-radius-sm); padding: 24px; text-align: center;">
          <h4 style="color: var(--color-maroon); font-family: var(--font-serif); margin-bottom: 8px;">🔑 Partner Preferences & Contacts Locked</h4>
          <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 12px;">Contact numbers, biodata PDF download, and matching kundali options are exclusive for Gold & Platinum members.</p>
          <a href="#/membership" class="btn btn-primary" style="padding: 8px 20px; font-size: 0.85rem;">Upgrade to View Contact</a>
        </div>
      </div>
    </div>
  `;
}

// 5. REGISTRATION VIEW
function renderRegister(container) {
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Register Free</h1>
        <p>HOME / REGISTER</p>
      </div>
    </div>
    
    <div class="container" style="max-width: 720px; padding: 60px 24px;">
      <div class="page-container" style="margin-top: 0;">
        <div class="traditional-header" style="margin-bottom: 24px;">
          <h2>Join Nabhik Matrimonial</h2>
          <p style="font-size: 0.9rem; color: var(--color-text-muted);">Create your profile and start searching for life partner matches today.</p>
        </div>
        
        <form onsubmit="handleRegistrationSubmit(event)">
          <div class="form-row-2">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="reg-name" required placeholder="Enter full name">
            </div>
            <div class="form-group">
              <label>Gender</label>
              <select id="reg-gender">
                <option value="Female">Bride</option>
                <option value="Male">Groom</option>
              </select>
            </div>
          </div>
          
          <div class="form-row-2">
            <div class="form-group">
              <label>Date of Birth</label>
              <input type="date" id="reg-dob" required>
            </div>
            <div class="form-group">
              <label>Mobile Number</label>
              <input type="tel" id="reg-mobile" required placeholder="Enter 10-digit number">
            </div>
          </div>
          
          <div class="form-row-2">
            <div class="form-group">
              <label>Email ID</label>
              <input type="email" id="reg-email" required placeholder="info@example.com">
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="reg-pass" required placeholder="Password">
            </div>
          </div>
          
          <div class="form-row-2">
            <div class="form-group">
              <label>State</label>
              <select id="reg-state">
                <option value="Maharashtra">Maharashtra</option>
              </select>
            </div>
            <div class="form-group">
              <label>City</label>
              <input type="text" id="reg-city" required placeholder="e.g. Pune">
            </div>
          </div>
          
          <div class="form-row-2">
            <div class="form-group">
              <label>Education</label>
              <input type="text" id="reg-education" required placeholder="e.g. B.Tech / MBA">
            </div>
            <div class="form-group">
              <label>Profession / Job</label>
              <input type="text" id="reg-profession" required placeholder="e.g. Software Developer">
            </div>
          </div>
          
          <h3 style="font-size: 1.1rem; border-bottom: 1.5px solid var(--color-border); padding-bottom: 8px; margin: 24px 0 16px 0;">Upload Profiles & Biodata</h3>
          
          <div class="form-row-2">
            <div class="form-group">
              <label>Profile Photo</label>
              <input type="file" accept="image/*" id="reg-photo">
            </div>
            <div class="form-group">
              <label>Biodata PDF (Optional)</label>
              <input type="file" accept=".pdf" id="reg-biodata">
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px; font-size: 1.05rem; padding: 14px;">Register Account</button>
        </form>
      </div>
    </div>
  `;
}

// 6. LOGIN VIEW
function renderLogin(container) {
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Login to Account</h1>
        <p>HOME / LOGIN</p>
      </div>
    </div>
    
    <div class="container" style="max-width: 480px; padding: 60px 24px;">
      <div class="page-container" style="margin-top: 0;">
        <div class="traditional-header" style="margin-bottom: 24px;">
          <h2>Welcome Back</h2>
        </div>
        
        <!-- Toggle login options -->
        <div style="display: flex; gap: 10px; border-bottom: 1px solid var(--color-border); margin-bottom: 24px; padding-bottom: 8px;">
          <button id="tab-login-email" onclick="toggleLoginTabs('email')" style="font-weight: 600; color: var(--color-maroon);" class="text-gold">Email Login</button>
          <span style="color: var(--color-border);">|</span>
          <button id="tab-login-otp" onclick="toggleLoginTabs('otp')" style="font-weight: 500; color: var(--color-text-muted);">Mobile OTP Login</button>
        </div>
        
        <!-- Email Form -->
        <form id="login-email-form" onsubmit="handleEmailLogin(event)">
          <div class="form-group">
            <label>Email ID</label>
            <input type="email" id="login-email" required placeholder="Enter registered email">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="login-password" required placeholder="Enter password">
          </div>
          
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Login</button>
        </form>
        
        <!-- OTP Form (Hidden initially) -->
        <form id="login-otp-form" onsubmit="handleOtpLoginRequest(event)" style="display: none;">
          <div class="form-group">
            <label>Mobile Number</label>
            <input type="tel" id="login-mobile" required placeholder="Enter 10-digit mobile number">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Send OTP Code</button>
        </form>
        
        <div style="text-align: center; margin-top: 20px; font-size: 0.85rem;">
          <a href="javascript:showToast('Password reset link sent to email')" style="color: var(--color-text-muted);">Forgot Password?</a>
          <p style="margin-top: 12px;">Don't have an account? <a href="#/register" style="color: var(--color-maroon); font-weight: 600;">Register Free</a></p>
        </div>
      </div>
    </div>
  `;
}

// 7. MEMBER DASHBOARD VIEW
function renderDashboard(container) {
  if (!state.currentUser) {
    // If not logged in, redirect to login
    window.location.hash = '#/login';
    return;
  }
  
  // Quick dynamic recommendations (AI Suggestions Simulation)
  const isMale = state.currentUser.gender.toLowerCase() === 'male';
  const matches = state.profiles.filter(p => p.gender.toLowerCase() === (isMale ? 'female' : 'male') && p.verified);
  
  // Dashboard navigation and view layout
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Member Dashboard</h1>
        <p>HOME / DASHBOARD</p>
      </div>
    </div>
    
    <div class="container dashboard-layout">
      <!-- Dashboard Sidebar -->
      <aside class="dashboard-sidebar">
        <div class="dashboard-user-summary">
          <img src="${getSvgAvatar(state.currentUser.gender, state.currentUser.id, state.currentUser.name)}" alt="${state.currentUser.name}">
          <h4>${state.currentUser.name}</h4>
          <p>ID: #NB-${1000 + state.currentUser.id} • ${state.currentUser.membership || 'Free'} Member</p>
        </div>
        <ul class="dashboard-menu">
          <li><a href="javascript:switchDashboardTab('overview')" id="db-tab-overview" class="active">📊 Overview</a></li>
          <li><a href="javascript:switchDashboardTab('matches')" id="db-tab-matches">❤️ Matches</a></li>
          <li><a href="javascript:switchDashboardTab('interests')" id="db-tab-interests">✉ Received Interests</a></li>
          <li><a href="javascript:switchDashboardTab('shortlisted')" id="db-tab-shortlisted">⭐ Shortlisted Profiles</a></li>
          <li><a href="javascript:switchDashboardTab('messages')" id="db-tab-messages">💬 Chat Messages</a></li>
          <li><a href="javascript:switchDashboardTab('edit')" id="db-tab-edit">✏ Edit Profile</a></li>
        </ul>
      </aside>
      
      <!-- Dashboard Content Panel -->
      <main id="dashboard-content" class="dashboard-main">
        <!-- Render Overview Tab initially -->
      </main>
    </div>
  `;
  
  switchDashboardTab('overview');
}

// Switch dashboard tabs inside panel
function switchDashboardTab(tabName) {
  const panel = document.getElementById('dashboard-content');
  if (!panel) return;
  
  // Active links highlighting
  document.querySelectorAll('.dashboard-menu a').forEach(a => {
    if (a.getAttribute('href').includes(tabName)) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
  
  switch (tabName) {
    case 'overview':
      panel.innerHTML = `
        <h2>Account Overview</h2>
        
        <div class="stat-tiles">
          <div class="stat-tile">
            <h3>${state.profiles.filter(p => p.gender.toLowerCase() !== state.currentUser.gender.toLowerCase() && p.verified).length}</h3>
            <p>New Matches</p>
          </div>
          <div class="stat-tile">
            <h3>${state.interestsReceived.length}</h3>
            <p>Interests</p>
          </div>
          <div class="stat-tile">
            <h3>${state.shortlisted.length}</h3>
            <p>Shortlisted</p>
          </div>
          <div class="stat-tile">
            <h3>${Object.keys(state.activeChats).length}</h3>
            <p>Chats</p>
          </div>
        </div>
        
        <h3 style="font-size: 1.25rem; margin: 32px 0 16px 0;">🎯 Recommended Matches (AI Suggestions)</h3>
        <div class="search-results-grid">
          ${state.profiles.filter(p => p.gender.toLowerCase() !== state.currentUser.gender.toLowerCase() && p.verified).slice(0, 3).map(p => makeProfileCard(p)).join('')}
        </div>
      `;
      break;
      
    case 'matches':
      const matchesList = state.profiles.filter(p => p.gender.toLowerCase() !== state.currentUser.gender.toLowerCase() && p.verified);
      panel.innerHTML = `
        <h2>AI Suggestions & Compatible Matches</h2>
        <div class="search-results-grid">
          ${matchesList.map(p => makeProfileCard(p)).join('')}
        </div>
      `;
      break;
      
    case 'interests':
      const interestProfiles = state.profiles.filter(p => state.interestsReceived.includes(p.id));
      panel.innerHTML = `
        <h2>Received Interests</h2>
        ${interestProfiles.length ? `
          <div class="search-results-grid">${interestProfiles.map(p => makeProfileCard(p)).join('')}</div>
        ` : `
          <p style="color: var(--color-text-muted);">No interests received yet.</p>
        `}
      `;
      break;
      
    case 'shortlisted':
      const shortlistedProfiles = state.profiles.filter(p => state.shortlisted.includes(p.id));
      panel.innerHTML = `
        <h2>Shortlisted Profiles</h2>
        ${shortlistedProfiles.length ? `
          <div class="search-results-grid">${shortlistedProfiles.map(p => makeProfileCard(p)).join('')}</div>
        ` : `
          <p style="color: var(--color-text-muted);">Your shortlist is empty. Start exploring profiles!</p>
        `}
      `;
      break;
      
    case 'messages':
      // Get chat threads
      const threadIds = Object.keys(state.activeChats).map(id => parseInt(id));
      const threadProfiles = state.profiles.filter(p => threadIds.includes(p.id));
      
      let threadItemsHtml = threadProfiles.map((p, idx) => {
        const msgs = state.activeChats[p.id];
        const lastMsg = msgs[msgs.length - 1];
        return `
          <div class="thread-item ${idx === 0 ? 'active' : ''}" onclick="selectChatThread(event, ${p.id})">
            <img src="${getSvgAvatar(p.gender, p.id, p.name)}" alt="${p.name}">
            <div class="thread-details">
              <h4>${p.name}</h4>
              <p>${lastMsg ? lastMsg.text : 'Start talking...'}</p>
            </div>
          </div>
        `;
      }).join('');
      
      panel.innerHTML = `
        <h2>Chat Center</h2>
        
        ${threadProfiles.length ? `
          <div class="chat-container">
            <div class="chat-threads">
              ${threadItemsHtml}
            </div>
            
            <div class="chat-area" id="chat-conversation-area">
              <!-- Load first thread messages -->
              ${makeChatPanel(threadProfiles[0].id)}
            </div>
          </div>
        ` : `
          <p style="color: var(--color-text-muted);">No active chats yet. Open a profile and click "Chat Now" to start chatting.</p>
        `}
      `;
      break;
      
    case 'edit':
      panel.innerHTML = `
        <h2>Edit Profile Details</h2>
        <form onsubmit="handleEditProfileSubmit(event)">
          <div class="form-row-2">
            <div class="form-group">
              <label>Education</label>
              <input type="text" id="edit-education" value="${state.currentUser.education || ''}" required>
            </div>
            <div class="form-group">
              <label>Profession</label>
              <input type="text" id="edit-profession" value="${state.currentUser.profession || ''}" required>
            </div>
          </div>
          
          <div class="form-row-2">
            <div class="form-group">
              <label>City</label>
              <input type="text" id="edit-city" value="${state.currentUser.location ? state.currentUser.location.split(',')[0].trim() : ''}" required>
            </div>
            <div class="form-group">
              <label>Income</label>
              <input type="text" id="edit-income" value="${state.currentUser.income || '₹5,000,000 / Year'}" required>
            </div>
          </div>
          
          <div class="form-group">
            <label>Lifestyle & Food Preference</label>
            <select id="edit-food">
              <option value="Vegetarian" ${state.currentUser.foodPreference === 'Vegetarian' ? 'selected' : ''}>Vegetarian</option>
              <option value="Non-Vegetarian" ${state.currentUser.foodPreference === 'Non-Vegetarian' ? 'selected' : ''}>Non-Vegetarian</option>
            </select>
          </div>
          
          <button type="submit" class="btn btn-primary" style="margin-top: 10px;">Save Profile Changes</button>
        </form>
      `;
      break;
  }
}

// Helper to construct Chat Conversation Panel HTML
function makeChatPanel(profileId) {
  const profile = state.profiles.find(p => p.id === profileId);
  const messages = state.activeChats[profileId] || [];
  
  let msgsHtml = messages.map(m => `
    <div class="message-bubble ${m.sender === 'you' ? 'message-sent' : 'message-received'}">
      ${m.text}
    </div>
  `).join('');
  
  return `
    <div class="chat-header">
      Chatting with ${profile.name}
    </div>
    <div class="chat-messages-box" id="chat-messages-box-${profileId}">
      ${msgsHtml}
    </div>
    <form class="chat-input-box" onsubmit="handleSendChatMessage(event, ${profileId})">
      <input type="text" id="chat-input-field-${profileId}" placeholder="Type your message..." required autocomplete="off">
      <button type="submit" class="btn-send-message">➔</button>
    </form>
  `;
}

// Select a different chat thread in dashboard
function selectChatThread(event, id) {
  document.querySelectorAll('.thread-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');
  
  const conversationArea = document.getElementById('chat-conversation-area');
  if (conversationArea) {
    conversationArea.innerHTML = makeChatPanel(id);
    const box = document.getElementById(`chat-messages-box-${id}`);
    box.scrollTop = box.scrollHeight;
  }
}

// 8. MEMBERSHIP PLANS VIEW
function renderMembership(container) {
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Membership Plans</h1>
        <p>HOME / MEMBERSHIP PLANS</p>
      </div>
    </div>
    
    <div class="container section-padding">
      <div class="traditional-header">
        <h2>Premium Plans for Faster Connect</h2>
        <p style="font-size: 0.95rem; color: var(--color-text-muted);">Choose a plan that fits your search preference and starts direct chats.</p>
      </div>
      
      <div class="membership-grid" style="margin-top: 0;">
        <!-- Silver Plan -->
        <div class="membership-card">
          <div class="plan-badge silver-badge">🥈</div>
          <h3>Silver Plan</h3>
          <div class="plan-price">₹999 <span>/ 3 Months</span></div>
          <ul class="plan-features">
            <li>View 50 Profiles</li>
            <li>Send Unlimited Interests</li>
            <li>Basic Search Filters</li>
            <li>Email Support</li>
          </ul>
          <button onclick="handleSelectPlan('Silver', 999)" class="plan-btn">Choose Plan</button>
        </div>
        
        <!-- Gold Plan -->
        <div class="membership-card featured-plan">
          <div class="plan-ribbon">Most Popular</div>
          <div class="plan-badge gold-badge">🥇</div>
          <h3>Gold Plan</h3>
          <div class="plan-price">₹1999 <span>/ 6 Months</span></div>
          <ul class="plan-features">
            <li>View Unlimited Profiles</li>
            <li>Direct Contact Access</li>
            <li>Chat Feature with Members</li>
            <li>Advanced Search Filters</li>
            <li>Priority Support</li>
          </ul>
          <button onclick="handleSelectPlan('Gold', 1999)" class="plan-btn btn-gold">Choose Plan</button>
        </div>
        
        <!-- Platinum Plan -->
        <div class="membership-card">
          <div class="plan-badge platinum-badge">💎</div>
          <h3>Platinum Plan</h3>
          <div class="plan-price">₹2999 <span>/ 12 Months</span></div>
          <ul class="plan-features">
            <li>All Gold Plan Features</li>
            <li>Priority Profile Highlight</li>
            <li>Profile Verification Badge</li>
            <li>Dedicated Kundali/Support</li>
          </ul>
          <button onclick="handleSelectPlan('Platinum', 2999)" class="plan-btn">Choose Plan</button>
        </div>
      </div>
    </div>
  `;
}

// 9. SUCCESS STORIES VIEW
function renderStories(container) {
  let listHtml = state.stories.map(s => makeSuccessCard(s)).join('');
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Success Stories</h1>
        <p>HOME / SUCCESS STORIES</p>
      </div>
    </div>
    
    <div class="container section-padding">
      <div class="traditional-header">
        <h2>Happy Couples Connected by Nabhik Matrimonial</h2>
        <div class="traditional-divider"><span class="icon">✦</span></div>
      </div>
      
      <div class="success-slider" style="grid-template-columns: repeat(3, 1fr);">
        ${listHtml}
      </div>
    </div>
  `;
}

// 10. EVENTS VIEW
function renderEvents(container) {
  let listHtml = state.events.map(e => makeEventCard(e)).join('');
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Community Events</h1>
        <p>HOME / EVENTS</p>
      </div>
    </div>
    
    <div class="container section-padding">
      <div class="traditional-header">
        <h2>Nabhik Samaj Gatherings & Announcements</h2>
        <div class="traditional-divider"><span class="icon">✦</span></div>
      </div>
      
      <div class="events-grid">
        ${listHtml}
      </div>
    </div>
  `;
}

// 11. BLOG VIEW
function renderBlogs(container) {
  let listHtml = state.blogs.map(b => makeBlogCard(b)).join('');
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Blog Section</h1>
        <p>HOME / BLOGS</p>
      </div>
    </div>
    
    <div class="container section-padding">
      <div class="traditional-header">
        <h2>Marriage Tips, Values & Community Insights</h2>
        <div class="traditional-divider"><span class="icon">✦</span></div>
      </div>
      
      <div class="blog-grid">
        ${listHtml}
      </div>
    </div>
  `;
}

// 12. CONTACT US VIEW
function renderContact(container) {
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Contact Us</h1>
        <p>HOME / CONTACT US</p>
      </div>
    </div>
    
    <div class="container section-padding">
      <div class="page-container contact-grid" style="margin-top: 0;">
        <div class="contact-info">
          <h3>Get In Touch</h3>
          <p>Feel free to reach out to us regarding queries, membership details, offline registration centers, or support.</p>
          
          <ul class="contact-info-list">
            <li><span class="icon">📍</span> Nabhik Matrimonial Headquarters, Nagpur, Maharashtra, India</li>
            <li><span class="icon">📞</span> +91 12345 67890</li>
            <li><span class="icon">✉</span> info@nabhikmatrimonial.com</li>
            <li><span class="icon">🌐</span> www.nabhikmatrimonial.com</li>
          </ul>
        </div>
        
        <div>
          <form onsubmit="handleContactSubmit(event)">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" required placeholder="Your Name">
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" required placeholder="Your Email">
            </div>
            <div class="form-group">
              <label>Subject</label>
              <input type="text" required placeholder="Subject">
            </div>
            <div class="form-group">
              <label>Message</label>
              <textarea rows="4" required placeholder="Type your message here..."></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  `;
}

// 13. PRIVACY POLICY
function renderPrivacyPolicy(container) {
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Privacy Policy</h1>
        <p>HOME / PRIVACY POLICY</p>
      </div>
    </div>
    <div class="container section-padding">
      <div class="page-container" style="margin-top:0;">
        <h2 style="margin-bottom:16px;">User Data Protection Policy</h2>
        <p style="margin-bottom:12px;">At Nabhik Matrimonial, user privacy is our top priority. We protect your personal data through secure encryption protocols and strictly monitor all active profiles.</p>
        <p style="margin-bottom:12px;"><strong>1. Data Collection:</strong> We collect details such as Name, DOB, location, education, job details, and contact verification numbers during signup.</p>
        <p style="margin-bottom:12px;"><strong>2. Photo and PDF Security:</strong> Photos uploaded to Nabhik Matrimonial are protected against downloads by standard browsers. Only verified members can request contact numbers.</p>
        <p style="margin-bottom:12px;"><strong>3. No Unauthorized Sharing:</strong> We do not share your mobile numbers or personal data with any third-party marketing companies.</p>
      </div>
    </div>
  `;
}

// 14. TERMS & CONDITIONS
function renderTerms(container) {
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Terms & Conditions</h1>
        <p>HOME / TERMS & CONDITIONS</p>
      </div>
    </div>
    <div class="container section-padding">
      <div class="page-container" style="margin-top:0;">
        <h2 style="margin-bottom:16px;">Platform Rules & Regulations</h2>
        <p style="margin-bottom:12px;">Welcome to Nabhik Matrimonial. By registering, you agree to comply with the following regulations:</p>
        <p style="margin-bottom:12px;"><strong>1. Genuine Profiles Only:</strong> Users must provide accurate, verified information. Creation of fake profiles or inputting inaccurate information is strictly prohibited.</p>
        <p style="margin-bottom:12px;"><strong>2. Suspension of Account:</strong> Any misuse of communication tools, harassment of other members, or report filings from multiple profiles will result in direct account suspension without warning.</p>
        <p style="margin-bottom:12px;"><strong>3. Non-Refundable Plans:</strong> Once purchased, premium memberships are non-refundable and non-transferable under any circumstances.</p>
      </div>
    </div>
  `;
}

// 15. ADMIN PANEL VIEW
function renderAdmin(container) {
  const pending = state.profiles.filter(p => !p.verified);
  const approved = state.profiles.filter(p => p.verified);
  
  let pendingRows = pending.map(p => `
    <tr>
      <td>#NB-${1000 + p.id}</td>
      <td>${p.name}</td>
      <td>${p.gender}</td>
      <td>${p.location}</td>
      <td><span class="badge-status badge-pending">Pending</span></td>
      <td>
        <div class="action-btn-group">
          <button onclick="handleAdminApprove(${p.id})" class="admin-action-btn btn-approve">Approve</button>
          <button onclick="handleAdminReject(${p.id})" class="admin-action-btn btn-reject">Block</button>
        </div>
      </td>
    </tr>
  `).join('');
  
  let approvedRows = approved.map(p => `
    <tr>
      <td>#NB-${1000 + p.id}</td>
      <td>${p.name}</td>
      <td>${p.gender}</td>
      <td>${p.location}</td>
      <td><span class="badge-status badge-approved">Approved</span></td>
      <td>
        <button onclick="handleAdminReject(${p.id})" class="admin-action-btn btn-reject">Block</button>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Admin Control Panel</h1>
        <p>ADMIN / MANAGEMENT</p>
      </div>
    </div>
    
    <div class="container admin-layout">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar">
        <h3>Admin Tools</h3>
        <ul class="admin-menu">
          <li><a href="javascript:switchAdminTab('dashboard')" id="ad-tab-dashboard" class="active">📊 Analytics</a></li>
          <li><a href="javascript:switchAdminTab('approvals')" id="ad-tab-approvals">✓ Profile Approvals</a></li>
          <li><a href="javascript:switchAdminTab('users')" id="ad-tab-users">👥 User Management</a></li>
        </ul>
      </aside>
      
      <!-- Admin Content -->
      <main id="admin-content-panel" class="admin-main">
        <!-- Inside tab switcher -->
      </main>
    </div>
  `;
  
  switchAdminTab('dashboard');
}

// Switch admin views
function switchAdminTab(tabName) {
  const panel = document.getElementById('admin-content-panel');
  if (!panel) return;
  
  document.querySelectorAll('.admin-menu a').forEach(a => {
    if (a.getAttribute('href').includes(tabName)) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
  
  switch (tabName) {
    case 'dashboard':
      panel.innerHTML = `
        <h2>Analytics Dashboard</h2>
        <div class="admin-stats-grid">
          <div class="admin-stat-card">
            <h4>Total Users</h4>
            <p>${state.profiles.length}</p>
          </div>
          <div class="admin-stat-card">
            <h4>Active Profiles</h4>
            <p>${state.profiles.filter(p => p.verified).length}</p>
          </div>
          <div class="admin-stat-card">
            <h4>Pending Verification</h4>
            <p>${state.profiles.filter(p => !p.verified).length}</p>
          </div>
          <div class="admin-stat-card">
            <h4>Mock Revenue</h4>
            <p>₹${state.revenueReport.totalRevenue}</p>
          </div>
        </div>
        
        <h3 style="font-size: 1.2rem; margin: 32px 0 16px 0;">Membership Distribution</h3>
        <table class="admin-table">
          <thead>
            <tr><th>Plan Type</th><th>Active Subscriptions</th></tr>
          </thead>
          <tbody>
            <tr><td>Silver (₹999)</td><td>${state.revenueReport.activePlans.Silver}</td></tr>
            <tr><td>Gold (₹1999)</td><td>${state.revenueReport.activePlans.Gold}</td></tr>
            <tr><td>Platinum (₹2999)</td><td>${state.revenueReport.activePlans.Platinum}</td></tr>
          </tbody>
        </table>
      `;
      break;
      
    case 'approvals':
      const pending = state.profiles.filter(p => !p.verified);
      panel.innerHTML = `
        <h2>Pending Profile Approvals</h2>
        ${pending.length ? `
          <table class="admin-table">
            <thead>
              <tr>
                <th>Profile ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${pending.map(p => `
                <tr>
                  <td>#NB-${1000 + p.id}</td>
                  <td>${p.name}</td>
                  <td>${p.gender}</td>
                  <td>${p.location}</td>
                  <td><span class="badge-status badge-pending">Pending Verification</span></td>
                  <td>
                    <div class="action-btn-group">
                      <button onclick="handleAdminApprove(${p.id})" class="admin-action-btn btn-approve">Approve</button>
                      <button onclick="handleAdminReject(${p.id})" class="admin-action-btn btn-reject">Block</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <p>No profiles pending verification.</p>
        `}
      `;
      break;
      
    case 'users':
      panel.innerHTML = `
        <h2>User Management</h2>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Profile ID</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.profiles.map(p => `
              <tr>
                <td>#NB-${1000 + p.id}</td>
                <td>${p.name}</td>
                <td>${p.gender}</td>
                <td>${p.location}</td>
                <td><span class="badge-status ${p.verified ? 'badge-approved' : 'badge-pending'}">${p.verified ? 'Verified' : 'Pending'}</span></td>
                <td>
                  <button onclick="handleAdminReject(${p.id})" class="admin-action-btn btn-reject">Block</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      break;
  }
}

/* ==========================================================================
   INTERACTIVE HANDLERS & MOCK SIMULATIONS
   ========================================================================== */

// Handle search form query execution
function runProfileSearch() {
  const gender = document.getElementById('filter-gender').value;
  const ageFrom = parseInt(document.getElementById('filter-age-from').value);
  const ageTo = parseInt(document.getElementById('filter-age-to').value);
  const city = document.getElementById('filter-city').value;
  const education = document.getElementById('filter-education').value;
  const income = document.getElementById('filter-income').value;
  const sortBy = document.getElementById('sort-select').value;
  
  // Filter core
  let results = state.profiles.filter(p => {
    if (p.gender !== gender) return false;
    if (p.age < ageFrom || p.age > ageTo) return false;
    if (city && !p.location.includes(city)) return false;
    if (education && !p.education.includes(education)) return false;
    if (income === 'high') {
      const val = parseInt(p.income.replace(/[^\d]/g, ''));
      if (val < 10000000) return false; // less than 1Cr
    } else if (income === 'mid') {
      const val = parseInt(p.income.replace(/[^\d]/g, ''));
      if (val < 5000000) return false; // less than 50L
    }
    return p.verified; // Show approved only
  });
  
  // Sort
  if (sortBy === 'age-asc') {
    results.sort((a,b) => a.age - b.age);
  } else if (sortBy === 'age-desc') {
    results.sort((a,b) => b.age - a.age);
  }
  
  // Inject HTML
  const grid = document.getElementById('search-results-grid');
  const countTitle = document.getElementById('search-count-title');
  if (grid) {
    if (results.length) {
      grid.innerHTML = results.map(p => makeProfileCard(p)).join('');
    } else {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);">No matching profiles found. Try resetting filters.</div>`;
    }
  }
  if (countTitle) {
    countTitle.innerText = `Showing Verified ${gender}s (${results.length} Matches Found)`;
  }
}

// Reset filters in search view
function resetSearchFilters() {
  document.getElementById('filter-city').value = "";
  document.getElementById('filter-education').value = "";
  document.getElementById('filter-income').value = "";
  document.getElementById('filter-age-from').value = "18";
  document.getElementById('filter-age-to').value = "40";
  runProfileSearch();
}

// Home Quick Search handler (saves filters and routes to search page)
function handleQuickSearch(e) {
  e.preventDefault();
  
  const gender = document.getElementById('qs-gender').value;
  const ageFrom = document.getElementById('qs-age-from').value;
  const ageTo = document.getElementById('qs-age-to').value;
  const city = document.getElementById('qs-city').value;
  const education = document.getElementById('qs-education').value;
  
  window.location.hash = '#/search';
  
  // Wait for DOM routing load to apply quick search parameters
  setTimeout(() => {
    const fGender = document.getElementById('filter-gender');
    const fAgeFrom = document.getElementById('filter-age-from');
    const fAgeTo = document.getElementById('filter-age-to');
    const fCity = document.getElementById('filter-city');
    const fEdu = document.getElementById('filter-education');
    
    if (fGender) fGender.value = gender;
    if (fAgeFrom) fAgeFrom.value = ageFrom;
    if (fAgeTo) fAgeTo.value = ageTo;
    if (fCity) fCity.value = city;
    if (fEdu) fEdu.value = education;
    
    runProfileSearch();
  }, 100);
}

// Shortlist toggle
function handleToggleShortlist(id, updateDetailsPage = false) {
  stateActions.toggleShortlist(id);
  const isShortlisted = state.shortlisted.includes(id);
  showToast(isShortlisted ? 'Profile added to shortlist' : 'Profile removed from shortlist');
  
  if (updateDetailsPage) {
    renderProfileDetails(document.getElementById('app-view'), id);
  } else {
    // Refresh card shortlist icon styling manually without re-render
    const cardBtn = document.querySelector(`.profile-card[data-id="${id}"] .btn-shortlist-icon`);
    if (cardBtn) {
      cardBtn.style.color = isShortlisted ? '#d4af37' : 'rgba(255,255,255,0.4)';
    }
  }
}

// Interest send simulation
function handleSendInterest(id, updateDetailsPage = false) {
  stateActions.sendInterest(id);
  showToast('Interest Request sent successfully!');
  
  if (updateDetailsPage) {
    renderProfileDetails(document.getElementById('app-view'), id);
  } else {
    const btn = document.querySelector(`.profile-card[data-id="${id}"] .btn-interest-small`);
    if (btn) {
      btn.innerText = 'Interest Sent';
      btn.style.borderColor = '#2e7d32';
      btn.style.background = 'rgba(46,125,50,0.1)';
      btn.style.color = '#81c784';
    }
  }
}

// Start chat simulator
function handleStartChat(id) {
  if (!state.currentUser) {
    window.location.hash = '#/login';
    return;
  }
  
  // Add to active threads if not present
  if (!state.activeChats[id]) {
    state.activeChats[id] = [
      { sender: 'them', text: `Namaskar, thank you for connecting. I am checking your profile details.` }
    ];
    stateActions.saveAll();
  }
  
  window.location.hash = '#/dashboard';
  setTimeout(() => {
    switchDashboardTab('messages');
    setTimeout(() => {
      // Find thread and click
      const threadBtn = document.querySelector(`.thread-item[onclick*="${id}"]`);
      if (threadBtn) threadBtn.click();
    }, 100);
  }, 100);
}

// Send chat message and trigger automatic response simulation
function handleSendChatMessage(e, profileId) {
  e.preventDefault();
  const input = document.getElementById(`chat-input-field-${profileId}`);
  if (!input) return;
  
  const text = input.value.trim();
  if (!text) return;
  
  // Send user message
  stateActions.sendChatMessage(profileId, text);
  input.value = '';
  
  // Re-render conversation box
  const area = document.getElementById('chat-conversation-area');
  if (area) {
    area.innerHTML = makeChatPanel(profileId);
    const box = document.getElementById(`chat-messages-box-${profileId}`);
    box.scrollTop = box.scrollHeight;
  }
  
  // Trigger partner automatic reply
  const partner = state.profiles.find(p => p.id === profileId);
  const replies = [
    `Namaskar! Thank you for the message. I would love to connect. I will speak to my parents about your profile and let you know.`,
    `Thank you for reaching out! Your profile looks compatibility matching. Can we share biodatas on WhatsApp?`,
    `Hello! Good to hear from you. I am currently working as ${partner.profession}. Yes, let's discuss details.`
  ];
  
  setTimeout(() => {
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    state.activeChats[profileId].push({ sender: 'them', text: randomReply });
    stateActions.saveAll();
    
    // Re-render chat list again if we are still viewing this chat
    const currentBox = document.getElementById(`chat-messages-box-${profileId}`);
    if (currentBox) {
      currentBox.innerHTML += `
        <div class="message-bubble message-received">
          ${randomReply}
        </div>
      `;
      currentBox.scrollTop = currentBox.scrollHeight;
    }
    showToast(`New message from ${partner.name}`);
  }, 1500);
}

// Profile report submission
function handleReportProfile(id) {
  const profile = state.profiles.find(p => p.id === id);
  if (confirm(`Are you sure you want to report ${profile.name}'s profile? The Admin will inspect the profile for fake data.`)) {
    showToast('Report submitted. Admin will review the profile.');
  }
}

// Contact form submission
function handleContactSubmit(e) {
  e.preventDefault();
  showToast('Thank you! Your message has been sent. We will reply within 24 hours.');
  e.target.reset();
}

// Registration Submit and OTP visual Modal simulation
function handleRegistrationSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('reg-name').value;
  const gender = document.getElementById('reg-gender').value;
  const dob = document.getElementById('reg-dob').value;
  const mobile = document.getElementById('reg-mobile').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-pass').value;
  const city = document.getElementById('reg-city').value;
  const stateVal = document.getElementById('reg-state').value;
  const education = document.getElementById('reg-education').value;
  const profession = document.getElementById('reg-profession').value;
  
  // Store form temp data inside window to load after OTP
  window.tempRegData = {
    name, gender, dob, mobile, emailId: email, password, location: `${city}, ${stateVal}`, education, profession
  };
  
  // Open OTP device mockup Modal
  openOtpVerificationModal(mobile);
}

// Email Login submit
function handleEmailLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;
  
  const user = stateActions.loginUser(email, pass);
  if (user) {
    showToast(`Successfully logged in as ${user.name}`);
    window.location.hash = '#/dashboard';
  } else {
    showToast('Error logging in. Try again.');
  }
}

// OTP Login Request (Opens modal)
function handleOtpLoginRequest(e) {
  e.preventDefault();
  const mobile = document.getElementById('login-mobile').value;
  window.tempRegData = {
    emailId: `${mobile}@nabhik.com`,
    name: `User-${mobile.slice(-4)}`
  };
  openOtpVerificationModal(mobile);
}

// Toggle Login page forms (email vs otp)
function toggleLoginTabs(type) {
  const eTab = document.getElementById('tab-login-email');
  const oTab = document.getElementById('tab-login-otp');
  const eForm = document.getElementById('login-email-form');
  const oForm = document.getElementById('login-otp-form');
  
  if (type === 'email') {
    eTab.classList.add('text-gold');
    oTab.classList.remove('text-gold');
    eForm.style.display = 'block';
    oForm.style.display = 'none';
  } else {
    oTab.classList.add('text-gold');
    eTab.classList.remove('text-gold');
    oForm.style.display = 'block';
    eForm.style.display = 'none';
  }
}

// Open OTP validation Modal with phone SMS mockup
function openOtpVerificationModal(mobile) {
  const overlay = document.getElementById('modal-system-overlay');
  if (!overlay) return;
  
  // Generate random 4 digit code
  const code = Math.floor(1000 + Math.random() * 9000);
  window.otpVerificationCode = code;
  
  overlay.innerHTML = `
    <div class="modal-content otp-container">
      <button class="modal-close-btn" onclick="closeModal()">×</button>
      <h3 style="font-size: 1.4rem; color: var(--color-maroon); font-family: var(--font-serif);">Mobile Verification</h3>
      <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-top: 4px;">An OTP verification code was sent to +91 ${mobile}</p>
      
      <!-- Simulated Phone SMS Device -->
      <div class="sms-mock-device">
        <div class="sms-bubble">
          <strong>Nabhik OTP:</strong> Your security verification code for registration is: <strong>${code}</strong>. Do not share.
        </div>
      </div>
      
      <p style="font-size: 0.88rem; font-weight: 500; margin-bottom: 8px;">Enter 4-Digit Code</p>
      <div class="otp-inputs">
        <input type="text" maxlength="1" class="otp-digit" oninput="moveOtpFocus(this, 1)">
        <input type="text" maxlength="1" class="otp-digit" oninput="moveOtpFocus(this, 2)">
        <input type="text" maxlength="1" class="otp-digit" oninput="moveOtpFocus(this, 3)">
        <input type="text" maxlength="1" class="otp-digit" oninput="moveOtpFocus(this, 4)">
      </div>
      
      <button onclick="confirmOtpCodeSubmit()" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Verify & Complete</button>
    </div>
  `;
  
  overlay.classList.add('active');
}

// Auto focus on next digit during OTP input
function moveOtpFocus(input, index) {
  if (input.value && index < 4) {
    document.querySelectorAll('.otp-digit')[index].focus();
  }
}

// Confirm OTP code and login user
function confirmOtpCodeSubmit() {
  const digits = Array.from(document.querySelectorAll('.otp-digit')).map(i => i.value).join('');
  if (digits == window.otpVerificationCode) {
    closeModal();
    // Complete registration
    const user = stateActions.registerUser(window.tempRegData);
    showToast(`Verification Successful! Logged in as ${user.name}`);
    window.location.hash = '#/dashboard';
  } else {
    alert('Invalid verification code. Please check the SMS mockup box and try again.');
  }
}

// Membership plan select (opens card simulator modal)
function handleSelectPlan(planName, price) {
  if (!state.currentUser) {
    window.location.hash = '#/login';
    return;
  }
  
  const overlay = document.getElementById('modal-system-overlay');
  if (!overlay) return;
  
  overlay.innerHTML = `
    <div class="modal-content" style="max-width: 440px;">
      <button class="modal-close-btn" onclick="closeModal()">×</button>
      <h3 style="font-size: 1.4rem; color: var(--color-maroon); font-family: var(--font-serif); text-align: center; margin-bottom: 4px;">Premium Checkout</h3>
      <p style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; margin-bottom: 20px;">Upgrading to ${planName} Plan for ₹${price}</p>
      
      <!-- Credit Card Mockup -->
      <div class="payment-card-visual">
        <div class="card-chip"></div>
        <div class="card-number-preview" id="cc-num-preview">XXXX XXXX XXXX XXXX</div>
        <div class="card-bottom-row">
          <div>
            <span style="font-size: 0.6rem; display: block; opacity: 0.7;">Card Holder</span>
            <span id="cc-name-preview" style="font-weight: 600;">${state.currentUser.name}</span>
          </div>
          <div>
            <span style="font-size: 0.6rem; display: block; opacity: 0.7;">Expires</span>
            <span id="cc-exp-preview" style="font-weight: 600;">12/28</span>
          </div>
        </div>
      </div>
      
      <form onsubmit="handleCreditCardPaySubmit(event, '${planName}', ${price})">
        <div class="form-group">
          <label>Card Number</label>
          <input type="text" id="pay-cc-num" maxlength="19" placeholder="4111 2222 3333 4444" required oninput="updateCardVisualNum(this.value)">
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Expiry Date</label>
            <input type="text" placeholder="MM/YY" maxlength="5" required>
          </div>
          <div class="form-group">
            <label>CVV</label>
            <input type="password" maxlength="3" placeholder="123" required>
          </div>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px; font-weight: 700;">Securely Pay ₹${price}</button>
      </form>
    </div>
  `;
  overlay.classList.add('active');
}

// Update card number visual preview
function updateCardVisualNum(val) {
  const p = document.getElementById('cc-num-preview');
  if (p) {
    p.innerText = val || 'XXXX XXXX XXXX XXXX';
  }
}

// Complete payment gateway mockup
function handleCreditCardPaySubmit(e, planName, price) {
  e.preventDefault();
  closeModal();
  stateActions.purchaseMembership(planName, price);
  showToast(`Congratulations! You are now a ${planName} member.`);
  
  // Router reset to show upgraded states
  initRouter();
}

// Edit profile details
function handleEditProfileSubmit(e) {
  e.preventDefault();
  
  const edu = document.getElementById('edit-education').value;
  const prof = document.getElementById('edit-profession').value;
  const city = document.getElementById('edit-city').value;
  const inc = document.getElementById('edit-income').value;
  const food = document.getElementById('edit-food').value;
  
  state.currentUser.education = edu;
  state.currentUser.profession = prof;
  state.currentUser.location = `${city}, Maharashtra`;
  state.currentUser.income = inc;
  state.currentUser.foodPreference = food;
  stateActions.saveAll();
  
  showToast('Profile updated successfully!');
  switchDashboardTab('overview');
}

// Logout session
function handleLogout() {
  stateActions.logoutUser();
  showToast('Logged out successfully.');
  if (window.location.hash === '#/') {
    initRouter();
  } else {
    window.location.hash = '#/';
  }
}

// Admin approves profile verification
function handleAdminApprove(id) {
  stateActions.adminApproveProfile(id);
  showToast('Profile verification approved!');
  switchAdminTab('approvals');
}

// Admin blocks profile (deletes it)
function handleAdminReject(id) {
  if (confirm('Are you sure you want to block and delete this profile permanently?')) {
    stateActions.adminBlockProfile(id);
    showToast('Profile blocked and deleted.');
    const activeTab = document.querySelector('.admin-menu a.active').id.split('ad-tab-')[1];
    switchAdminTab(activeTab);
  }
}
