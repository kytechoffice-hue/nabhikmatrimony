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
    const isDashboardActive = window.location.hash.split('?')[0] === '#/dashboard';
    authContainer.innerHTML = `
      <span style="color: var(--color-gold); font-size: 0.85rem; font-weight: 600; background: rgba(212,175,55,0.1); padding: 4px 10px; border-radius: 20px;">
        👤 ${state.currentUser.name} ${isPremium ? `👑 ${state.currentUser.membership}` : ''}
      </span>
      <a href="#/dashboard" class="btn-login" style="padding: 6px 14px; font-size: 0.8rem; ${isDashboardActive ? 'background-color: var(--color-gold); color: var(--color-maroon-dark); border-color: var(--color-gold); font-weight: 600;' : ''}">Dashboard</a>
      <button onclick="handleLogout()" class="btn-register" style="padding: 6px 14px; font-size: 0.8rem; background: #c62828; color: #fff;">Logout</button>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="#/login" class="btn-login">Login</a>
      <a href="#/register" class="btn-register">Register</a>
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
    const cleanHash = hash.split('?')[0];
    const isActive = (
      cleanHash === href || 
      (cleanHash === '#/' && href === '#/') || 
      (cleanHash.startsWith('#/profile') && href === '#/search')
    );
    return `<li><a href="${href}" class="${isActive ? 'active' : ''}">${text}</a></li>`;
  };
  
  if (state.currentUser) {
    const isAdmin = (
      state.currentUser.isAdmin === true || 
      state.currentUser.role === 'admin' || 
      (state.currentUser.emailId && state.currentUser.emailId.toLowerCase().includes('admin'))
    );
    // Show full menu when logged in (cleaned up to prevent overflow, added Dashboard)
    navContainer.innerHTML = `
      ${makeLink('#/', 'Home')}
      ${makeLink('#/dashboard', 'Dashboard')}
      ${makeLink('#/search', 'Search Profiles')}
      ${makeLink('#/membership', 'Membership')}
      ${makeLink('#/stories', 'Success Stories')}
      ${makeLink('#/help', 'Help')}
      ${isAdmin ? `<li><a href="#/admin" style="color: var(--color-gold-light); font-weight: 600;">Admin</a></li>` : ''}
    `;
  } else {
    // Show Home, About Us, and Help when not logged in
    navContainer.innerHTML = `
      ${makeLink('#/', 'Home')}
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
  
  // Handle slider arrows
  const arrow = e.target.closest('.slider-arrow');
  if (arrow) {
    e.preventDefault();
    if (arrow.classList.contains('slider-arrow-left')) {
      scrollFeatured('left');
    } else if (arrow.classList.contains('slider-arrow-right')) {
      scrollFeatured('right');
    }
  }
}

// Close active modal
function closeModal(isProgrammatic = false) {
  const modal = document.getElementById('modal-system-overlay');
  if (modal) {
    const wasActive = modal.classList.contains('active');
    modal.classList.remove('active');
    modal.innerHTML = '';
    
    if (wasActive && !isProgrammatic) {
      // If we closed the login modal route manually, reset the hash back to home
      const cleanHash = window.location.hash.split('?')[0];
      if (cleanHash === '#/login') {
        window.location.hash = '#/';
      }
    }
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
  
  // Clean query string from hash for routing (e.g. #/help?submitted=true)
  let path = hash.split('?')[0];
  let params = null;
  
  if (path.startsWith('#/profile/')) {
    params = path.split('#/profile/')[1];
    path = '#/profile/:id';
  }
  
  // Active nav highlighting
  document.querySelectorAll('.nav-links a').forEach(a => {
    const aHash = a.getAttribute('href');
    const cleanAHash = aHash ? aHash.split('?')[0] : '';
    if (path === cleanAHash || (path === '#/' && cleanAHash === '#') || (path.startsWith('#/profile') && cleanAHash === '#/search')) {
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
      const isUserAdmin = state.currentUser && (
        state.currentUser.isAdmin === true || 
        state.currentUser.role === 'admin' || 
        (state.currentUser.emailId && state.currentUser.emailId.toLowerCase().includes('admin'))
      );
      if (!isUserAdmin) {
        showToast('Access Denied. Admin privilege required.');
        window.location.hash = '#/';
      } else {
        renderAdmin(appView);
      }
      break;
    case '#/help':
      renderHelp(appView);
      break;
    default:
      renderHome(appView);
  }
  
  updateHeaderAuth();

  // If redirected from FormSubmit after successful submission
  if (hash.includes('submitted=true')) {
    showToast('Success! Query sent to support@nabhikmatrimony.com');
    // Remove query parameter from hash without triggering a routing event
    window.history.replaceState(null, null, window.location.pathname + path);
  }

  // Dynamic SEO Page Tags update
  updatePageSEO(path, params);
}

/* ==========================================================================
   VIEW RENDERERS
   ========================================================================== */

// 1. HOME VIEW
function renderHome(container) {
  // Grab 10 registered profiles
  const featured = state.profiles.slice(0, 10);
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
        </div>
        
        <div class="featured-slider-container">
          <button class="slider-arrow slider-arrow-left">◀</button>
          <div class="featured-slider">
            ${featuredHtml}
          </div>
          <button class="slider-arrow slider-arrow-right">▶</button>
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



    <!-- Call to Action -->
    <section class="cta-section">
      <div class="container">
        <h2>Ready to Find Your Life Partner?</h2>
        <p>Join Nabhik Matrimonial today to connect with matching verified profiles in our community. Registration is free and takes only a few minutes.</p>
        <a href="#/register" class="btn btn-primary" style="font-size: 1.1rem; padding: 16px 36px;">Register Now</a>
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

// Slider horizontal scrolling control
function scrollFeatured(direction) {
  const slider = document.querySelector('.featured-slider');
  if (slider) {
    const scrollAmount = 300; // scroll 300px
    if (direction === 'left') {
      slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}

// 2. ABOUT US VIEW
function renderAbout(container) {
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>About Us</h1>
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
          
          <div class="faq-list">
            <details class="faq-item">
              <summary>
                How do I register on Nabhik Matrimonial?
                <span class="faq-arrow">▼</span>
              </summary>
              <p>
                Click on the "Register" button on the top right. Fill out your details (Personal Info, Education, Location, etc.) and complete the registration. After registration, we will send an OTP via SMS to verify your mobile number. Once verified, you can log in and find matches.
              </p>
            </details>
            
            <details class="faq-item">
              <summary>
                How does the profile verification work?
                <span class="faq-arrow">▼</span>
              </summary>
              <p>
                To keep our community safe, every registered profile is reviewed by our administration team. You may be requested to upload an identity document. Approved profiles receive a gold "✔ Verified" badge.
              </p>
            </details>
            
            <details class="faq-item">
              <summary>
                Is my personal information and contact number secure?
                <span class="faq-arrow">▼</span>
              </summary>
              <p>
                Yes, absolutely. We prioritize your privacy. Your contact details are only shared with premium members if you choose to accept their interest, or you can manage this from your privacy settings in the dashboard.
              </p>
            </details>
            
            <details class="faq-item">
              <summary>
                What are the benefits of Membership Plans?
                <span class="faq-arrow">▼</span>
              </summary>
              <p>
                Premium members get benefits like viewing direct phone numbers, unlimited chat messages, sending highlighted interests, and getting higher priority in searches. Check out our Membership page for details.
              </p>
            </details>
          </div>
        </div>
        
        <!-- Support Ticket / Contact Sidebar -->
        <div class="support-sidebar">
          <div class="contact-card">
            <h3>Contact Support</h3>
            <p class="contact-desc">We are available to help you find your perfect match.</p>
            <div class="contact-details-row">
              <div class="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>support@nabhikmatrimony.com</span>
              </div>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>+91 98765 43210</span>
              </div>
            </div>
            <p class="contact-address">Nabhik Society Office, Mumbai, Maharashtra</p>
          </div>
          
          <div class="ticket-card">
            <h4>Submit a Query</h4>
            <form class="ticket-form" onsubmit="handleTicketSubmit(event)">
              <div>
                <input type="text" id="ticket-name" placeholder="Full Name" required autocomplete="off">
              </div>
              <div>
                <input type="email" id="ticket-email" placeholder="Email Address" required autocomplete="off">
              </div>
              <div>
                <textarea id="ticket-query" placeholder="How can we help you?" rows="4" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Ticket</button>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  `;
}

// Helper modal: FormSubmit activation instructions (avoids opening local mail client)
function openActivationModal(email) {
  const overlay = document.getElementById('modal-system-overlay');
  if (!overlay) return;
  
  overlay.innerHTML = `
    <div class="modal-content" style="max-width: 480px; text-align: center; padding: 30px; border-radius: 12px; position: relative;">
      <button class="modal-close-btn" onclick="closeModal()" style="position: absolute; right: 15px; top: 15px; background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">×</button>
      <div style="font-size: 50px; margin-bottom: 15px; color: var(--color-gold);">✉</div>
      <h3 style="color: var(--color-maroon); margin-bottom: 15px; font-family: 'Playfair Display', serif; font-size: 22px;">Activation Required</h3>
      <p style="font-size: 14px; color: #555; margin-bottom: 20px; line-height: 1.6;">
        FormSubmit needs to verify this email address. We have sent an activation link to:<br>
        <strong style="color: var(--color-maroon); font-size: 15px;">${email}</strong>
      </p>
      <div style="background: #fdf5e6; border: 1px dashed var(--color-gold); padding: 15px; border-radius: 8px; font-size: 13px; text-align: left; color: #666; margin-bottom: 25px; line-height: 1.5;">
        <strong>Next Steps for Admin:</strong><br>
        1. Log into your email: <strong>${email}</strong><br>
        2. Click the <strong>"Activate Form"</strong> button in the email from FormSubmit.<br>
        3. Once activated, future ticket submissions will go through automatically!
      </div>
      <button class="btn btn-primary" onclick="closeModal()" style="width: 100%; padding: 12px; font-weight: 600;">Got It</button>
    </div>
  `;
  overlay.classList.add('active');
}

// Helper modal: Manual email instructions (failsafe copy-paste if AJAX is blocked)
function openManualMailModal(email, subject, bodyText) {
  const overlay = document.getElementById('modal-system-overlay');
  if (!overlay) return;
  
  window.__latestQueryEmail = email;
  window.__latestQuerySubject = subject;
  window.__latestQueryBody = bodyText;
  
  const bodyHtml = bodyText.replace(/\n/g, '<br>');
  
  overlay.innerHTML = `
    <div class="modal-content" style="max-width: 520px; text-align: center; padding: 30px; border-radius: 12px; position: relative;">
      <button class="modal-close-btn" onclick="closeModal()" style="position: absolute; right: 15px; top: 15px; background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">×</button>
      <div style="font-size: 50px; margin-bottom: 15px; color: var(--color-gold);">✉</div>
      <h3 style="color: var(--color-maroon); margin-bottom: 15px; font-family: 'Playfair Display', serif; font-size: 22px;">Send Email Query</h3>
      <p style="font-size: 14px; color: #555; margin-bottom: 20px; line-height: 1.6;">
        We could not submit your ticket automatically (often due to browser settings or adblockers). Please copy your query and email us directly:
      </p>
      
      <div style="background: #fdf5e6; border: 1px dashed var(--color-gold); padding: 12px; border-radius: 8px; font-weight: bold; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; text-align: left;">
        <div>
          <div style="font-size: 11px; color: #999; text-transform: uppercase;">Support Email</div>
          <span style="color: var(--color-maroon); font-size: 15px;">${email}</span>
        </div>
        <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(window.__latestQueryEmail); showToast('Email copied!')" style="padding: 6px 12px; font-size: 12px; font-weight: 600;">Copy Email</button>
      </div>

      <div style="text-align: left; background: #f9f9f9; padding: 15px; border-radius: 8px; font-size: 13px; max-height: 160px; overflow-y: auto; margin-bottom: 20px; border: 1px solid #eee; line-height: 1.5; color: #333;">
        <strong>Subject:</strong> ${subject}<br><br>
        <strong>Body:</strong><br>
        ${bodyHtml}
      </div>
      
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(window.__latestQueryBody); showToast('Message body copied!')" style="flex: 1; padding: 10px; font-size: 13px; font-weight: 600;">Copy Message Body</button>
        <button class="btn btn-primary" onclick="closeModal()" style="flex: 1; padding: 10px; font-size: 13px; font-weight: 600;">Done</button>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

// Submit query form handler (sends email directly via FormSubmit with modal fallbacks)
function handleTicketSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('ticket-name').value;
  const email = document.getElementById('ticket-email').value;
  const query = document.getElementById('ticket-query').value;
  
  const subject = "Submit a Query";
  const body = `Dear Team,

I hope you are doing well.

I would like to submit a query regarding your matrimonial services. Please find my details below:

Name:  ${name} 
Email ID: ${email}

Query Details:
${query}

Kindly review my request and provide the necessary information or assistance at your earliest convenience.

Thank you.

Best Regards,
 ${name} 

Sent this email on support@nabhikmatrimony.com`;

  showToast('Sending query to support...');

  // Use FormSubmit AJAX API to send the email directly in the background
  fetch('https://formsubmit.co/ajax/support@nabhikmatrimony.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      email: email,
      message: query,
      _subject: subject,
      _honey: "", // Honeypot spam prevention
      _template: "table"
    })
  })
  .then(response => {
    if (!response.ok) throw new Error('API delivery failed');
    return response.json();
  })
  .then(data => {
    const isSuccess = data && (data.success === true || data.success === 'true');
    const isActivation = data && typeof data.message === 'string' && 
                         (data.message.toLowerCase().includes('activate') || data.message.toLowerCase().includes('activation'));
    
    if (!isSuccess || isActivation) {
      console.warn('FormSubmit needs activation:', data);
      showToast('First submit: Activation required.');
      openActivationModal('support@nabhikmatrimony.com');
    } else {
      showToast('Success! Query sent to support@nabhikmatrimony.com');
    }
    e.target.reset();
  })
  .catch(err => {
    console.warn('AJAX delivery failed, falling back to standard POST redirect:', err);
    showToast('Redirecting to secure form submission...');
    
    // Construct and submit standard form programmatically to bypass CORS/adblockers
    const form = document.createElement('form');
    form.action = 'https://formsubmit.co/support@nabhikmatrimony.com';
    form.method = 'POST';
    form.style.display = 'none';
    
    const fields = {
      name: name,
      email: email,
      message: query,
      _subject: subject,
      _next: window.location.origin + window.location.pathname + '#/help?submitted=true',
      _captcha: 'false'
    };
    
    for (const key in fields) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    }
    
    document.body.appendChild(form);
    form.submit();
  });
}

// 3. SEARCH VIEW WITH FILTERS
function renderSearch(container) {
  // Build sidebar filters HTML
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Search Profiles</h1>
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
            <option value="Ahmednagar">Ahmednagar</option>
            <option value="Akola">Akola</option>
            <option value="Alibaug">Alibaug</option>
            <option value="Amalner">Amalner</option>
            <option value="Amravati">Amravati</option>
            <option value="Aurangabad">Aurangabad</option>
            <option value="Baramati">Baramati</option>
            <option value="Beed">Beed</option>
            <option value="Bhandara">Bhandara</option>
            <option value="Bhiwandi">Bhiwandi</option>
            <option value="Bhusawal">Bhusawal</option>
            <option value="Chandrapur">Chandrapur</option>
            <option value="Dhule">Dhule</option>
            <option value="Gondia">Gondia</option>
            <option value="Hingoli">Hingoli</option>
            <option value="Ichalkaranji">Ichalkaranji</option>
            <option value="Jalgaon">Jalgaon</option>
            <option value="Jalna">Jalna</option>
            <option value="Kalyan-Dombivli">Kalyan-Dombivli</option>
            <option value="Karad">Karad</option>
            <option value="Karjat">Karjat</option>
            <option value="Kolhapur">Kolhapur</option>
            <option value="Latur">Latur</option>
            <option value="Lonavala">Lonavala</option>
            <option value="Mahabaleshwar">Mahabaleshwar</option>
            <option value="Malegaon">Malegaon</option>
            <option value="Matheran">Matheran</option>
            <option value="Mira-Bhayandar">Mira-Bhayandar</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Nagpur">Nagpur</option>
            <option value="Nanded">Nanded</option>
            <option value="Nashik">Nashik</option>
            <option value="Navi Mumbai">Navi Mumbai</option>
            <option value="Osmanabad">Osmanabad</option>
            <option value="Palghar">Palghar</option>
            <option value="Pandharpur">Pandharpur</option>
            <option value="Panvel">Panvel</option>
            <option value="Parbhani">Parbhani</option>
            <option value="Pune">Pune</option>
            <option value="Ratnagiri">Ratnagiri</option>
            <option value="Sangli">Sangli</option>
            <option value="Satara">Satara</option>
            <option value="Shirdi">Shirdi</option>
            <option value="Shrirampur">Shrirampur</option>
            <option value="Solapur">Solapur</option>
            <option value="Thane">Thane</option>
            <option value="Ulhasnagar">Ulhasnagar</option>
            <option value="Wardha">Wardha</option>
            <option value="Washim">Washim</option>
            <option value="Yavatmal">Yavatmal</option>
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
  const avatar = profile.photo || getSvgAvatar(profile.gender, profile.id, profile.name);
  
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Profile of ${profile.name}</h1>
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
        ${(() => {
          const userMem = state.currentUser ? (state.currentUser.membership || 'Free') : 'Free';
          if (userMem === 'Gold' || userMem === 'Platinum' || userMem === 'Premium Assisted') {
            return `
              <div class="profile-info-section" style="background-color: #f1f8e9; border: 1.5px solid #81c784; border-radius: var(--border-radius-sm); padding: 24px;">
                <h4 style="color: #2e7d32; font-family: var(--font-serif); margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">💚 Premium Unlocked: Contact Details</h4>
                <div class="profile-info-grid" style="margin-top: 16px;">
                  <div class="info-item"><span class="info-label">Mobile Number</span><span class="info-value">+91 98234 ${50000 + profile.id}</span></div>
                  <div class="info-item"><span class="info-label">Email Address</span><span class="info-value">${profile.name.toLowerCase().replace(/\s+/g, '')}@gmail.com</span></div>
                </div>
                <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                  <button onclick="showToast('Downloading Biodata PDF...')" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.8rem; height: auto;">📥 Download Biodata PDF</button>
                  <button onclick="showToast('Initiating Kundali Matching...')" class="btn btn-outline" style="padding: 8px 16px; font-size: 0.8rem; border-color: #2e7d32; color: #2e7d32; height: auto;">🕉 Check Kundali Match</button>
                </div>
              </div>
            `;
          } else if (userMem === 'Silver') {
            return `
              <div class="profile-info-section" style="background-color: var(--color-cream); border: 1.5px dashed var(--color-gold); border-radius: var(--border-radius-sm); padding: 24px; text-align: center;">
                <h4 style="color: var(--color-maroon); font-family: var(--font-serif); margin-bottom: 8px;">🔑 Direct Contact Details Locked (Gold & Above)</h4>
                <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 12px;">You are currently on the Silver Plan. Direct contact details and Kundali matching options are exclusive for Gold, Platinum & Premium Assisted members.</p>
                <a href="#/membership" class="btn btn-primary" style="padding: 8px 20px; font-size: 0.85rem;">Upgrade to Gold Plan</a>
              </div>
            `;
          } else {
            return `
              <div class="profile-info-section" style="background-color: var(--color-cream); border: 1.5px dashed var(--color-gold); border-radius: var(--border-radius-sm); padding: 24px; text-align: center;">
                <h4 style="color: var(--color-maroon); font-family: var(--font-serif); margin-bottom: 8px;">🔑 Partner Preferences & Contacts Locked</h4>
                <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 12px;">Contact numbers, biodata PDF download, and matching kundali options are exclusive for Gold & Platinum members.</p>
                <a href="#/membership" class="btn btn-primary" style="padding: 8px 20px; font-size: 0.85rem;">Upgrade to View Contact</a>
              </div>
            `;
          }
        })()}
      </div>
    </div>
  `;
}

// 5. REGISTRATION VIEW
function renderRegister(container) {
  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Register</h1>
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
              <input type="text" id="reg-city" list="reg-cities-list" required placeholder="e.g. Pune">
              <datalist id="reg-cities-list">
                <option value="Ahmednagar">
                <option value="Akola">
                <option value="Alibaug">
                <option value="Amalner">
                <option value="Amravati">
                <option value="Aurangabad">
                <option value="Baramati">
                <option value="Beed">
                <option value="Bhandara">
                <option value="Bhiwandi">
                <option value="Bhusawal">
                <option value="Chandrapur">
                <option value="Dhule">
                <option value="Gondia">
                <option value="Hingoli">
                <option value="Ichalkaranji">
                <option value="Jalgaon">
                <option value="Jalna">
                <option value="Kalyan-Dombivli">
                <option value="Karad">
                <option value="Karjat">
                <option value="Kolhapur">
                <option value="Latur">
                <option value="Lonavala">
                <option value="Mahabaleshwar">
                <option value="Malegaon">
                <option value="Matheran">
                <option value="Mira-Bhayandar">
                <option value="Mumbai">
                <option value="Nagpur">
                <option value="Nanded">
                <option value="Nashik">
                <option value="Navi Mumbai">
                <option value="Osmanabad">
                <option value="Palghar">
                <option value="Pandharpur">
                <option value="Panvel">
                <option value="Parbhani">
                <option value="Pune">
                <option value="Ratnagiri">
                <option value="Sangli">
                <option value="Satara">
                <option value="Shirdi">
                <option value="Shrirampur">
                <option value="Solapur">
                <option value="Thane">
                <option value="Ulhasnagar">
                <option value="Wardha">
                <option value="Washim">
                <option value="Yavatmal">
              </datalist>
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

// Open Login Modal popup
function openLoginModal() {
  const overlay = document.getElementById('modal-system-overlay');
  if (!overlay) return;
  
  overlay.innerHTML = `
    <div class="modal-content" style="max-width: 440px;">
      <button class="modal-close-btn" onclick="closeModal()">×</button>
      <div class="traditional-header" style="margin-bottom: 24px; text-align: center;">
        <h2>Welcome Back</h2>
        <div class="traditional-divider"><span class="icon">✦</span></div>
      </div>
      
      <!-- Toggle login options -->
      <div style="display: flex; justify-content: center; gap: 12px; border-bottom: 1px solid var(--color-border); margin-bottom: 24px; padding-bottom: 8px;">
        <button id="tab-login-email" onclick="toggleLoginTabs('email')" style="font-weight: 600; color: var(--color-maroon); background: none; border: none; cursor: pointer;" class="text-gold">Email Login</button>
        <span style="color: var(--color-border);">|</span>
        <button id="tab-login-otp" onclick="toggleLoginTabs('otp')" style="font-weight: 500; color: var(--color-text-muted); background: none; border: none; cursor: pointer;">Mobile OTP Login</button>
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
        <p style="margin-top: 12px;">Don't have an account? <a href="#/register" onclick="closeModal()" style="color: var(--color-maroon); font-weight: 600;">Register</a></p>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

// 6. LOGIN VIEW
function renderLogin(container) {
  // Render home page as backdrop first
  renderHome(container);
  openLoginModal();
}

// 7. MEMBER DASHBOARD VIEW
function renderDashboard(container) {
  if (!state.currentUser) {
    // If not logged in, redirect to login
    window.location.hash = '#/login';
    return;
  }
  
  // Extract tab parameter from hash query string
  const hash = window.location.hash || '#/dashboard';
  const parts = hash.split('?');
  let activeTab = 'overview';
  if (parts[1]) {
    parts[1].split('&').forEach(param => {
      const [key, val] = param.split('=');
      if (key === 'tab') {
        activeTab = decodeURIComponent(val);
      }
    });
  }
  
  // Check if we are already on the dashboard page layout
  const alreadyRendered = document.getElementById('dashboard-content');
  if (alreadyRendered) {
    // Just switch the active tab, avoiding full layout re-renders
    switchDashboardTab(activeTab);
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
      </div>
    </div>
    
    <div class="container dashboard-layout">
      <!-- Dashboard Sidebar -->
      <aside class="dashboard-sidebar">
        <div class="dashboard-user-summary">
          <img id="db-sidebar-user-photo" src="${state.currentUser.photo || getSvgAvatar(state.currentUser.gender, state.currentUser.id, state.currentUser.name)}" alt="${state.currentUser.name}">
          <h4 id="db-sidebar-user-name">${state.currentUser.name}</h4>
          <p>ID: #NB-${1000 + state.currentUser.id} • ${state.currentUser.membership || 'Free'} Member</p>
        </div>
        <ul class="dashboard-menu">
          <li><a href="#/dashboard?tab=overview" id="db-tab-overview">📊 Overview</a></li>
          <li><a href="#/dashboard?tab=matches" id="db-tab-matches">❤️ Matches</a></li>
          <li><a href="#/dashboard?tab=interests" id="db-tab-interests">✉ Received Interests</a></li>
          <li><a href="#/dashboard?tab=shortlisted" id="db-tab-shortlisted">⭐ Shortlisted Profiles</a></li>
          <li><a href="#/dashboard?tab=messages" id="db-tab-messages">💬 Chat Messages</a></li>
          <li><a href="#/dashboard?tab=edit" id="db-tab-edit">✏ Edit Profile</a></li>
        </ul>
      </aside>
      
      <!-- Dashboard Content Panel -->
      <main id="dashboard-content" class="dashboard-main">
        <!-- Render Active Tab initially -->
      </main>
    </div>
  `;
  
  switchDashboardTab(activeTab);
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
            <img src="${p.photo || getSvgAvatar(p.gender, p.id, p.name)}" alt="${p.name}">
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
          
          <h3 style="font-size: 1.15rem; color: var(--color-maroon); border-bottom: 1px solid var(--color-border); padding-bottom: 6px; margin: 20px 0 12px 0; font-family: var(--font-serif);">Personal Details</h3>
          <div class="form-row-2">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="edit-name" value="${state.currentUser.name || ''}" required>
            </div>
            <div class="form-group">
              <label>Gender</label>
              <select id="edit-gender">
                <option value="Male" ${state.currentUser.gender === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Female" ${state.currentUser.gender === 'Female' ? 'selected' : ''}>Female</option>
              </select>
            </div>
          </div>
          
          <div class="form-row-2">
            <div class="form-group">
              <label>Date of Birth</label>
              <input type="date" id="edit-dob" value="${state.currentUser.dob || ''}">
            </div>
            <div class="form-group">
              <label>Height</label>
              <input type="text" id="edit-height" value="${state.currentUser.height || ''}" placeholder="e.g. 5'8\\\"">
            </div>
          </div>
          
          <div class="form-row-2">
            <div class="form-group">
              <label>Email ID</label>
              <input type="email" id="edit-email" value="${state.currentUser.emailId || ''}" required>
            </div>
            <div class="form-group">
              <label>Mobile Number</label>
              <input type="text" id="edit-mobile" value="${state.currentUser.mobile || ''}">
            </div>
          </div>

          <h3 style="font-size: 1.15rem; color: var(--color-maroon); border-bottom: 1px solid var(--color-border); padding-bottom: 6px; margin: 24px 0 12px 0; font-family: var(--font-serif);">Education & Profession</h3>
          <div class="form-row-2">
            <div class="form-group">
              <label>Education</label>
              <input type="text" id="edit-education" value="${state.currentUser.education || ''}">
            </div>
            <div class="form-group">
              <label>Profession</label>
              <input type="text" id="edit-profession" value="${state.currentUser.profession || ''}">
            </div>
          </div>
          
          <div class="form-row-2">
            <div class="form-group">
              <label>City</label>
              <input type="text" id="edit-city" list="edit-cities-list" value="${state.currentUser.location ? state.currentUser.location.split(',')[0].trim() : ''}" required>
              <datalist id="edit-cities-list">
                <option value="Ahmednagar">
                <option value="Akola">
                <option value="Alibaug">
                <option value="Amalner">
                <option value="Amravati">
                <option value="Aurangabad">
                <option value="Baramati">
                <option value="Beed">
                <option value="Bhandara">
                <option value="Bhiwandi">
                <option value="Bhusawal">
                <option value="Chandrapur">
                <option value="Dhule">
                <option value="Gondia">
                <option value="Hingoli">
                <option value="Ichalkaranji">
                <option value="Jalgaon">
                <option value="Jalna">
                <option value="Kalyan-Dombivli">
                <option value="Karad">
                <option value="Karjat">
                <option value="Kolhapur">
                <option value="Latur">
                <option value="Lonavala">
                <option value="Mahabaleshwar">
                <option value="Malegaon">
                <option value="Matheran">
                <option value="Mira-Bhayandar">
                <option value="Mumbai">
                <option value="Nagpur">
                <option value="Nanded">
                <option value="Nashik">
                <option value="Navi Mumbai">
                <option value="Osmanabad">
                <option value="Palghar">
                <option value="Pandharpur">
                <option value="Panvel">
                <option value="Parbhani">
                <option value="Pune">
                <option value="Ratnagiri">
                <option value="Sangli">
                <option value="Satara">
                <option value="Shirdi">
                <option value="Shrirampur">
                <option value="Solapur">
                <option value="Thane">
                <option value="Ulhasnagar">
                <option value="Wardha">
                <option value="Washim">
                <option value="Yavatmal">
              </datalist>
            </div>
            <div class="form-group">
              <label>Annual Income</label>
              <input type="text" id="edit-income" value="${state.currentUser.income || ''}">
            </div>
          </div>

          <h3 style="font-size: 1.15rem; color: var(--color-maroon); border-bottom: 1px solid var(--color-border); padding-bottom: 6px; margin: 24px 0 12px 0; font-family: var(--font-serif);">Religion & Family Background</h3>
          <div class="form-row-2">
            <div class="form-group">
              <label>Religion</label>
              <input type="text" id="edit-religion" value="${state.currentUser.religion || 'Hindu'}">
            </div>
            <div class="form-group">
              <label>Community / Caste</label>
              <input type="text" id="edit-community" value="${state.currentUser.community || 'Nabhik'}">
            </div>
          </div>
          
          <div class="form-row-2">
            <div class="form-group">
              <label>Father's Name</label>
              <input type="text" id="edit-father" value="${state.currentUser.fatherName || ''}">
            </div>
            <div class="form-group">
              <label>Mother's Name</label>
              <input type="text" id="edit-mother" value="${state.currentUser.motherName || ''}">
            </div>
          </div>
          
          <div class="form-group">
            <label>Native Place / Ancestral Town</label>
            <input type="text" id="edit-native" value="${state.currentUser.nativePlace || ''}">
          </div>

          <h3 style="font-size: 1.15rem; color: var(--color-maroon); border-bottom: 1px solid var(--color-border); padding-bottom: 6px; margin: 24px 0 12px 0; font-family: var(--font-serif);">Lifestyle & Habits</h3>
          <div class="form-row-2">
            <div class="form-group">
              <label>Lifestyle & Food Preference</label>
              <select id="edit-food">
                <option value="Vegetarian" ${state.currentUser.foodPreference === 'Vegetarian' ? 'selected' : ''}>Vegetarian</option>
                <option value="Non-Vegetarian" ${state.currentUser.foodPreference === 'Non-Vegetarian' ? 'selected' : ''}>Non-Vegetarian</option>
              </select>
            </div>
            <div class="form-group">
              <label>Smoking / Drinking Habits</label>
              <input type="text" id="edit-habits" value="${state.currentUser.smokingDrinking || 'No Smoking / No Drinking'}">
            </div>
          </div>
          
          <div class="form-group">
            <label>Hobbies & Interests</label>
            <input type="text" id="edit-hobbies" value="${state.currentUser.hobbies || ''}" placeholder="e.g. Reading, Traveling, Music">
          </div>

          <h3 style="font-size: 1.15rem; color: var(--color-maroon); border-bottom: 1px solid var(--color-border); padding-bottom: 6px; margin: 24px 0 12px 0; font-family: var(--font-serif);">Profile Photo</h3>
          <div class="form-group">
            <label>Upload New Photo</label>
            <input type="file" accept="image/*" id="edit-photo" style="padding: 8px 0; border: none; font-family: inherit; font-size: 0.9rem;">
          </div>
          
          <button type="submit" class="btn btn-primary" style="margin-top: 15px; width: 220px; font-size: 0.95rem; padding: 10px 20px;">Save Profile Changes</button>
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
  const currentPlan = state.currentUser ? (state.currentUser.membership || 'Free') : null;
  
  // Define membership plans data
  const plans = [
    {
      name: 'Free',
      displayName: 'Free Plan',
      price: 0,
      period: '',
      badgeClass: 'free-badge',
      badgeIcon: '🌱',
      tagline: 'Best for new users.',
      features: [
        'Create Profile',
        'Upload Photos',
        'Browse Limited Profiles',
        'Send 5 Interests Per Day',
        'Basic Search Filters'
      ],
      note: '',
      featured: false
    },
    {
      name: 'Silver',
      displayName: 'Silver Plan',
      price: 499,
      period: ' / 3 Months',
      badgeClass: 'silver-badge',
      badgeIcon: '🥈',
      tagline: 'Best low-cost starter plan.',
      features: [
        'View 50 Profiles',
        'Send Unlimited Interests',
        'Basic Chat Access',
        'Priority Profile Visibility',
        'Mobile Notifications'
      ],
      note: 'Recommended because many Indian users prefer plans below ₹500 initially.',
      featured: false
    },
    {
      name: 'Gold',
      displayName: 'Gold Plan',
      price: 999,
      period: ' / 6 Months',
      badgeClass: 'gold-badge',
      badgeIcon: '🥇',
      tagline: 'Best balance of affordability and value.',
      features: [
        'Unlimited Profile Views',
        'Direct Contact Access',
        'Unlimited Chat',
        'Advanced Search Filters',
        'See Who Viewed Your Profile',
        'Profile Highlight Badge'
      ],
      note: 'This pricing is competitive compared to many Indian matrimony services charging ₹1999–₹6000 for similar features.',
      featured: true
    },
    {
      name: 'Platinum',
      displayName: 'Platinum Plan',
      price: 1999,
      period: ' / 12 Months',
      badgeClass: 'platinum-badge',
      badgeIcon: '💎',
      tagline: 'Best for serious users.',
      features: [
        'All Gold Features',
        'Featured Profile on Homepage',
        'Profile Verification Badge',
        'WhatsApp Support',
        'Dedicated Relationship Assistance',
        'Priority Match Suggestions'
      ],
      note: '',
      featured: false
    },
    {
      name: 'Premium Assisted',
      displayName: 'Premium Assisted Plan',
      price: 4999,
      period: ' / 12 Months',
      badgeClass: 'assisted-badge',
      badgeIcon: '🤝',
      tagline: 'Optional high-end service.',
      features: [
        'Dedicated Matchmaking Support',
        'Manual Match Recommendations',
        'Family Assistance',
        'Phone Support',
        'Profile Promotion',
        'Premium Badge'
      ],
      note: '',
      featured: false
    }
  ];

  let cardsHtml = plans.map(p => {
    const isCurrent = currentPlan === p.name;
    const priceText = p.price === 0 ? '₹0' : `₹${p.price}`;
    
    // Determine button text and action
    let btnHtml = '';
    if (!state.currentUser) {
      btnHtml = `<a href="#/login" class="plan-btn btn-gold">Sign In to Choose</a>`;
    } else if (isCurrent) {
      btnHtml = `<button class="plan-btn plan-btn-active" disabled>Active Plan</button>`;
    } else if (p.name === 'Free') {
      // Free plan downgrade disabled or just simple info
      btnHtml = `<button class="plan-btn plan-btn-active" disabled>Default Plan</button>`;
    } else {
      btnHtml = `<button onclick="handleSelectPlan('${p.name}', ${p.price})" class="plan-btn ${p.featured ? 'btn-gold' : ''}">Upgrade Now</button>`;
    }

    return `
      <div class="membership-card ${p.featured ? 'featured-plan' : ''}">
        ${p.featured ? `<div class="plan-ribbon">Most Popular</div>` : ''}
        
        <div class="plan-badge ${p.badgeClass}">
          <span style="font-size: 1.5rem;">${p.badgeIcon}</span>
        </div>
        
        <h3>${p.displayName}</h3>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; margin-bottom: 16px; min-height: 40px; display: flex; align-items: center; justify-content: center;">
          ${p.tagline}
        </p>
        
        <div class="plan-price">${priceText}<span>${p.period}</span></div>
        
        <ul class="plan-features">
          ${p.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
        
        ${p.note ? `
          <div style="background-color: var(--color-cream-dark); border-left: 3px solid var(--color-gold); padding: 8px 12px; margin-bottom: 20px; font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.3; font-style: italic; border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;">
            💡 ${p.note}
          </div>
        ` : ''}
        
        <div style="margin-top: auto;">
          ${btnHtml}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="page-banner">
      <div class="container">
        <h1>Premium Membership Plans</h1>
      </div>
    </div>
    
    <div class="container section-padding">
      <div class="traditional-header">
        <h2>Choose Your Matchmaking Journey</h2>
        <div class="traditional-divider"><span class="icon">✦</span></div>
        <p style="max-width: 600px; margin: 16px auto 0 auto; color: var(--color-text-muted); font-size: 0.95rem;">
          Upgrade your Nabhik Matrimonial membership to connect faster, access verified phone numbers, and unlock direct chats with compatible life partners.
        </p>
      </div>
      <div class="membership-grid">
        ${cardsHtml}
      </div>
      
      <!-- Recommended Pricing Table -->
      <div class="pricing-table-container">
        <h3>Recommended Pricing Table</h3>
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Features</th>
              <th>Free</th>
              <th>Silver</th>
              <th>Gold</th>
              <th>Platinum</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Create Profile</td>
              <td>Yes</td>
              <td>Yes</td>
              <td>Yes</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>View Profiles</td>
              <td>Limited</td>
              <td>50</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td>Send Interests</td>
              <td>5/Day</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td>Chat Access</td>
              <td>No</td>
              <td>Basic</td>
              <td>Full</td>
              <td>Full</td>
            </tr>
            <tr>
              <td>Contact Details</td>
              <td>No</td>
              <td>Limited</td>
              <td>Yes</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Profile Highlight</td>
              <td>No</td>
              <td>Yes</td>
              <td>Yes</td>
              <td>Priority</td>
            </tr>
            <tr>
              <td>Verification Badge</td>
              <td>No</td>
              <td>No</td>
              <td>No</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Support</td>
              <td>Email</td>
              <td>Email</td>
              <td>Priority</td>
              <td>WhatsApp + Call</td>
            </tr>
            <tr>
              <td>Price</td>
              <td><strong>₹0</strong></td>
              <td><strong>₹499</strong></td>
              <td><strong>₹999</strong></td>
              <td><strong>₹1999</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Extra Revenue Features -->
      <div style="margin-top: 60px;">
        <div class="traditional-header" style="margin-bottom: 32px;">
          <h2>Extra Revenue Features</h2>
          <div class="traditional-divider"><span class="icon">✦</span></div>
          <p style="color: var(--color-text-muted); font-size: 0.9rem; max-width: 500px; margin: 12px auto 0 auto;">
            You can additionally purchase individual add-ons to boost your profile's performance and matching accuracy.
          </p>
        </div>
        
        <div class="membership-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px;">
          <!-- Feature 1 -->
          <div class="membership-card" style="padding: 24px; text-align: center; justify-content: space-between; border-radius: var(--border-radius-sm);">
            <div>
              <div style="font-size: 2.2rem; margin-bottom: 12px;">🚀</div>
              <h4 style="font-family: var(--font-serif); font-size: 1.15rem; color: var(--color-maroon); margin-bottom: 6px;">Profile Boost</h4>
              <p style="font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.3; margin-bottom: 12px;">Get 5x more profile visibility and match recommendations for 30 days.</p>
            </div>
            <div>
              <div style="font-size: 1.3rem; font-weight: 700; color: var(--color-maroon); margin-bottom: 12px;">₹99</div>
              <button onclick="handleSelectPlan('Profile Boost', 99)" class="btn btn-primary" style="padding: 6px 16px; font-size: 0.8rem; width: 100%; border-radius: var(--border-radius-sm);">Buy Boost</button>
            </div>
          </div>
          
          <!-- Feature 2 -->
          <div class="membership-card" style="padding: 24px; text-align: center; justify-content: space-between; border-radius: var(--border-radius-sm);">
            <div>
              <div style="font-size: 2.2rem; margin-bottom: 12px;">🪐</div>
              <h4 style="font-family: var(--font-serif); font-size: 1.15rem; color: var(--color-maroon); margin-bottom: 6px;">Horoscope Match</h4>
              <p style="font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.3; margin-bottom: 12px;">Detailed Gun Milan report analysis with native astrology charts.</p>
            </div>
            <div>
              <div style="font-size: 1.3rem; font-weight: 700; color: var(--color-maroon); margin-bottom: 12px;">₹49</div>
              <button onclick="handleSelectPlan('Horoscope Match', 49)" class="btn btn-primary" style="padding: 6px 16px; font-size: 0.8rem; width: 100%; border-radius: var(--border-radius-sm);">Get Match</button>
            </div>
          </div>
          
          <!-- Feature 3 -->
          <div class="membership-card" style="padding: 24px; text-align: center; justify-content: space-between; border-radius: var(--border-radius-sm);">
            <div>
              <div style="font-size: 2.2rem; margin-bottom: 12px;">🛡️</div>
              <h4 style="font-family: var(--font-serif); font-size: 1.15rem; color: var(--color-maroon); margin-bottom: 6px;">Profile Verification</h4>
              <p style="font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.3; margin-bottom: 12px;">Get the green verification checkmark badge indicating verified IDs.</p>
            </div>
            <div>
              <div style="font-size: 1.3rem; font-weight: 700; color: var(--color-maroon); margin-bottom: 12px;">₹199</div>
              <button onclick="handleSelectPlan('Profile Verification', 199)" class="btn btn-primary" style="padding: 6px 16px; font-size: 0.8rem; width: 100%; border-radius: var(--border-radius-sm);">Verify Now</button>
            </div>
          </div>
          
          <!-- Feature 4 -->
          <div class="membership-card" style="padding: 24px; text-align: center; justify-content: space-between; border-radius: var(--border-radius-sm);">
            <div>
              <div style="font-size: 2.2rem; margin-bottom: 12px;">⭐</div>
              <h4 style="font-family: var(--font-serif); font-size: 1.15rem; color: var(--color-maroon); margin-bottom: 6px;">Homepage Featured</h4>
              <p style="font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.3; margin-bottom: 12px;">Display your profile in the prominent slider right on the homepage.</p>
            </div>
            <div>
              <div style="font-size: 1.3rem; font-weight: 700; color: var(--color-maroon); margin-bottom: 12px;">₹299</div>
              <button onclick="handleSelectPlan('Homepage Featured Profile', 299)" class="btn btn-primary" style="padding: 6px 16px; font-size: 0.8rem; width: 100%; border-radius: var(--border-radius-sm);">Feature Profile</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- FAQ / Help Prompt -->
      <div style="margin-top: 60px; text-align: center; background-color: #fff; border: 1px solid var(--color-border); border-radius: var(--border-radius); padding: 32px;">
        <h3 style="font-size: 1.25rem; color: var(--color-maroon); font-family: var(--font-serif); margin-bottom: 8px;">Need Assisted Matchmaking Assistance?</h3>
        <p style="font-size: 0.9rem; color: var(--color-text-muted); max-width: 620px; margin: 0 auto 16px auto;">
          Our Premium Assisted Plan offers custom matchmaking search managed directly by Nabhik Matrimonial coordinators. We help schedule introductions and work closely with your family.
        </p>
        <a href="#/contact" class="btn btn-outline" style="font-size: 0.85rem; padding: 8px 20px;">Contact Relationship Advisor</a>
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

          <h4 style="margin-top: 24px; color: var(--color-gold); font-family: var(--font-serif); font-size: 1.1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 6px;">KY Tech Services IT Divisions</h4>
          <ul class="contact-info-list" style="margin-top: 12px; font-size: 0.88rem;">
            <li><span class="icon">💻</span> Website Development & Web Design Company India</li>
            <li><span class="icon">⚙️</span> Software Development Services</li>
            <li><span class="icon">🚀</span> Digital Marketing Company Contact</li>
            <li><span class="icon">🛠️</span> Technical Support Contact & Business IT Solutions</li>
          </ul>
        </div>
        
        <div>
          <form onsubmit="handleContactSubmit(event)">
            <!-- Form metadata reference -->
            <input type="hidden" name="form_metadata" value="Contact KY Tech Services, IT Company Contact, Website Development Contact, Digital Marketing Company Contact, Software Development Services, Technical Support Contact, Business IT Solutions, Web Design Company India">
            
            <div class="form-row-2">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" required placeholder="Your Name">
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" required placeholder="Your Email">
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Subject</label>
                <input type="text" required placeholder="Subject">
              </div>
              <div class="form-group">
                <label>Inquiry Type (Service Area)</label>
                <select required style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 4px; background: #fff; font-family: inherit; font-size: 0.9rem; color: var(--color-text);">
                  <option value="" disabled selected>Select service focus...</option>
                  <option value="KY Tech Services">Contact KY Tech Services</option>
                  <option value="IT Company Contact">IT Company Contact</option>
                  <option value="Website Development Contact">Website Development Contact</option>
                  <option value="Digital Marketing Company Contact">Digital Marketing Company Contact</option>
                  <option value="Software Development Services">Software Development Services</option>
                  <option value="Technical Support Contact">Technical Support Contact</option>
                  <option value="Business IT Solutions">Business IT Solutions</option>
                  <option value="Web Design Company India">Web Design Company India</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Message</label>
              <textarea rows="4" required placeholder="Type your message here..."></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary" style="padding: 10px 24px; font-size: 0.95rem;">Send Message</button>
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
            <tr><td>Silver (₹499)</td><td>${state.revenueReport.activePlans.Silver || 0}</td></tr>
            <tr><td>Gold (₹999)</td><td>${state.revenueReport.activePlans.Gold || 0}</td></tr>
            <tr><td>Platinum (₹1999)</td><td>${state.revenueReport.activePlans.Platinum || 0}</td></tr>
            <tr><td>Premium Assisted (₹4999)</td><td>${state.revenueReport.activePlans['Premium Assisted'] || 0}</td></tr>
          </tbody>
        </table>

        <h3 style="font-size: 1.2rem; margin: 32px 0 16px 0;">Extra Features Sales</h3>
        <table class="admin-table">
          <thead>
            <tr><th>Feature Type</th><th>Units Sold</th></tr>
          </thead>
          <tbody>
            <tr><td>Profile Boost (₹99)</td><td>${(state.revenueReport.extraFeatures && state.revenueReport.extraFeatures['Profile Boost']) || 0}</td></tr>
            <tr><td>Horoscope Match (₹49)</td><td>${(state.revenueReport.extraFeatures && state.revenueReport.extraFeatures['Horoscope Match']) || 0}</td></tr>
            <tr><td>Profile Verification (₹199)</td><td>${(state.revenueReport.extraFeatures && state.revenueReport.extraFeatures['Profile Verification']) || 0}</td></tr>
            <tr><td>Homepage Featured Profile (₹299)</td><td>${(state.revenueReport.extraFeatures && state.revenueReport.extraFeatures['Homepage Featured Profile']) || 0}</td></tr>
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
  if (state.currentUser && (!state.currentUser.membership || state.currentUser.membership === 'Free')) {
    if (state.interestsSent.length >= 5 && !state.interestsSent.includes(id)) {
      showToast('⚠️ Daily limit reached! Free accounts can only send 5 interests. Upgrade to Silver or above for unlimited interests.');
      window.location.hash = '#/membership';
      return;
    }
  }
  
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
  
  if (!state.currentUser.membership || state.currentUser.membership === 'Free') {
    showToast('💬 Chatting is exclusive to premium members. Upgrade your plan to start chatting!');
    window.location.hash = '#/membership';
    return;
  }
  
  // Add to active threads if not present
  if (!state.activeChats[id]) {
    state.activeChats[id] = [
      { sender: 'them', text: `Namaskar, thank you for connecting. I am checking your profile details.` }
    ];
    stateActions.saveAll();
  }
  
  window.location.hash = '#/dashboard?tab=messages';
  setTimeout(() => {
    // Find thread and click
    const threadBtn = document.querySelector(`.thread-item[onclick*="${id}"]`);
    if (threadBtn) threadBtn.click();
  }, 200);
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
  
  const photoInput = document.getElementById('reg-photo');
  
  function proceed(photoBase64) {
    // Store form temp data inside window to load after OTP
    window.tempRegData = {
      name, gender, dob, mobile, emailId: email, password, 
      location: `${city}, ${stateVal}`, education, profession,
      photo: photoBase64
    };
    
    // Open OTP device mockup Modal
    openOtpVerificationModal(mobile);
  }
  
  if (photoInput && photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      proceed(evt.target.result);
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    proceed('');
  }
}

// Email Login submit
function handleEmailLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;
  
  const user = stateActions.loginUser(email, pass);
  if (user) {
    showToast(`Successfully logged in as ${user.name}`);
    closeModal(true);
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
    mobile: mobile,
    emailId: `${mobile}@nabhik.com`,
    name: `User-${mobile.slice(-4)}`,
    gender: 'Male' // Default gender fallback
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
    closeModal(true);
    
    // Check if user already exists
    const mobile = window.tempRegData.mobile || '';
    const existingUser = state.profiles.find(p => p.mobile === mobile || (p.emailId && p.emailId.startsWith(mobile)));
    
    let user;
    if (existingUser) {
      state.currentUser = existingUser;
      stateActions.saveAll();
      user = existingUser;
    } else {
      user = stateActions.registerUser(window.tempRegData);
    }
    
    showToast(`Verification Successful! Logged in as ${user.name}`);
    window.location.hash = '#/dashboard?tab=overview';
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
  closeModal(true);
  stateActions.purchaseMembership(planName, price);
  showToast(`Congratulations! You are now a ${planName} member.`);
  
  // Router reset to show upgraded states
  initRouter();
}

// Edit profile details
function handleEditProfileSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('edit-name').value;
  const gender = document.getElementById('edit-gender').value;
  const dob = document.getElementById('edit-dob').value;
  const height = document.getElementById('edit-height').value;
  const email = document.getElementById('edit-email').value;
  const mobile = document.getElementById('edit-mobile').value;
  
  const edu = document.getElementById('edit-education').value;
  const prof = document.getElementById('edit-profession').value;
  const city = document.getElementById('edit-city').value;
  const inc = document.getElementById('edit-income').value;
  
  const religion = document.getElementById('edit-religion').value;
  const community = document.getElementById('edit-community').value;
  const father = document.getElementById('edit-father').value;
  const mother = document.getElementById('edit-mother').value;
  const native = document.getElementById('edit-native').value;
  
  const food = document.getElementById('edit-food').value;
  const habits = document.getElementById('edit-habits').value;
  const hobbies = document.getElementById('edit-hobbies').value;
  
  const photoInput = document.getElementById('edit-photo');
  
  function proceed(photoBase64) {
    state.currentUser.name = name;
    state.currentUser.gender = gender;
    state.currentUser.dob = dob;
    state.currentUser.height = height;
    state.currentUser.emailId = email;
    state.currentUser.mobile = mobile;
    
    state.currentUser.education = edu;
    state.currentUser.profession = prof;
    state.currentUser.location = `${city}, Maharashtra`;
    state.currentUser.income = inc;
    
    state.currentUser.religion = religion;
    state.currentUser.community = community;
    state.currentUser.fatherName = father;
    state.currentUser.motherName = mother;
    state.currentUser.nativePlace = native;
    
    state.currentUser.foodPreference = food;
    state.currentUser.smokingDrinking = habits;
    state.currentUser.hobbies = hobbies;
    
    if (photoBase64) {
      state.currentUser.photo = photoBase64;
    }
    
    // Update DOM elements in sidebar immediately
    const sidebarName = document.getElementById('db-sidebar-user-name');
    if (sidebarName) sidebarName.textContent = name;
    
    const sidebarPhoto = document.getElementById('db-sidebar-user-photo');
    if (sidebarPhoto) {
      sidebarPhoto.src = state.currentUser.photo || getSvgAvatar(gender, state.currentUser.id, name);
      sidebarPhoto.alt = name;
    }
    
    // Update the profile in the profiles database list as well
    const idx = state.profiles.findIndex(p => p.id === state.currentUser.id);
    if (idx !== -1) {
      state.profiles[idx] = { ...state.profiles[idx], ...state.currentUser };
    } else {
      state.profiles.push(state.currentUser);
    }
    
    stateActions.saveAll();
    
    showToast('Profile updated successfully!');
    window.location.hash = '#/dashboard?tab=overview';
  }
  
  if (photoInput && photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      proceed(evt.target.result);
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    proceed(null);
  }
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

// Centralized SEO Manager for dynamic Title, Meta Description, and Meta Keywords
function updatePageSEO(path, params) {
  let title = "Nabhik Matrimonial | Where Tradition Meets Perfect Match";
  let description = "Trusted Matrimonial Platform for the Nabhik Society. Find your perfect life partner matching traditional values and modern aspirations.";
  let keywords = "Nabhik Matrimonial, Nabhik Matrimony, Nabhik Vivah, Nabhik bride, Nabhik groom, Nabhik community, matrimonial services, trusted matrimony";

  switch (path) {
    case '#/':
      title = "Nabhik Matrimonial | Trusted Matrimony Site for Nabhik Community";
      description = "Find your perfect life partner on Nabhik Matrimonial. The most trusted matrimonial platform for the Nabhik community offering secure, verified profiles.";
      keywords = "Nabhik Matrimonial, Nabhik Matrimony, Nabhik Vivah, Nabhik bride, Nabhik groom, Nabhik community, matrimonial services, trusted matrimony";
      break;
    case '#/about':
      title = "About Us | Nabhik Matrimonial Services & Values";
      description = "Learn about Nabhik Matrimonial, our mission, traditional family values, and commitment to bringing Nabhik brides and grooms together securely.";
      keywords = "About Nabhik Matrimonial, community matrimony, matrimonial platform history, Nabhik marriage mission";
      break;
    case '#/search':
      title = "Search Nabhik Profiles | Find Brides & Grooms Online";
      description = "Browse and search verified profiles of Nabhik brides and grooms. Filter search results by age, location, education, and profession.";
      keywords = "search Nabhik profiles, find Nabhik matches, Nabhik brides search, Nabhik grooms search, verified profiles";
      break;
    case '#/profile/:id':
      let profileName = "Member";
      if (params && typeof state !== 'undefined' && state.profiles) {
        const p = state.profiles.find(x => x.id == params);
        if (p) profileName = p.name;
      }
      title = `${profileName} Profile | Nabhik Matrimonial Matchmaking`;
      description = `View full profile details, education, profession, family background, and photos of verified Nabhik member ${profileName}.`;
      keywords = `${profileName} profile, Nabhik member details, Nabhik bride profile, Nabhik groom profile, matrimonial candidate`;
      break;
    case '#/register':
      title = "Register Account | Join Nabhik Matrimonial Free";
      description = "Create your matrimonial profile on Nabhik Matrimonial today. Register free to connect with verified matches from the Nabhik community.";
      keywords = "Nabhik Matrimonial registration, register free matrimony, create matrimonial account, Nabhik matchmaking signup";
      break;
    case '#/login':
      title = "Welcome Back | Member Login | Nabhik Matrimonial";
      description = "Log in to your Nabhik Matrimonial account to check received interests, chat with matched profiles, and view recommendations.";
      keywords = "Nabhik matrimonial login, member sign in, access dashboard, matrimonial login portal";
      break;
    case '#/dashboard':
      title = "Member Dashboard | Nabhik Matrimonial Control Panel";
      description = "Access matches, received interests, shortlists, and chat center from your secure Nabhik Matrimonial member dashboard.";
      keywords = "Nabhik dashboard, member matches, dashboard overview, matrimonial control panel";
      break;
    case '#/membership':
      title = "Premium Membership Plans | Upgrade Nabhik Matrimonial";
      description = "Upgrade your profile with Free, Silver, Gold, Platinum, or Premium Assisted membership plans to unlock direct contacts, chats, and family assistance.";
      keywords = "matrimony pricing plans, premium membership, unlock contacts, gold matrimony membership, platinum plan, assisted matchmaking plan";
      break;
    case '#/stories':
      title = "Success Stories | Nabhik Matrimonial Happy Marriages";
      description = "Read inspiring success stories and matrimonial matches made through Nabhik Matrimonial. Celebrating happy Nabhik couples.";
      keywords = "matrimonial success stories, Nabhik marriage stories, happy couples, matrimonial matches";
      break;
    case '#/events':
      title = "Community Events & News | Nabhik Matrimonial";
      description = "Stay updated on Nabhik community events, offline introductions, matrimonial meets, and cultural news.";
      keywords = "Nabhik events, community matchmaking meets, matrimonial introduction events";
      break;
    case '#/blogs':
      title = "Marriage Tips & Articles | Nabhik Matrimonial Blog";
      description = "Discover relationship tips, community values, pre-marriage guidance, and matrimonial advice on Nabhik Matrimonial Blog.";
      keywords = "matrimonial blog, marriage advice, relationship tips, community family values";
      break;
    case '#/contact':
      title = "Contact KY Tech Services | IT & Web Design Company India";
      description = "Contact KY Tech Services: Leading Web Design Company in India providing Software Development Services, Digital Marketing, and Business IT solutions. Contact us for technical support.";
      keywords = "Contact KY Tech Services, IT Company Contact, Website Development Contact, Digital Marketing Company Contact, Software Development Services, Technical Support Contact, Business IT Solutions, Web Design Company India";
      break;
    case '#/policy':
      title = "Privacy Policy | Data Protection | Nabhik Matrimonial";
      description = "Read Nabhik Matrimonial privacy policy to understand how we encrypt user data, safeguard uploaded files, and protect candidate details.";
      keywords = "privacy policy, matrimonial security, data protection rules, member safety guidelines";
      break;
    case '#/terms':
      title = "Terms of Service & Rules | Nabhik Matrimonial";
      description = "Review Nabhik Matrimonial terms, platform regulations, verification guidelines, and rules for a safe matchmaking experience.";
      keywords = "terms and conditions, user agreement, matrimonial portal regulations";
      break;
    case '#/admin':
      title = "Platform Admin Panel | Nabhik Matrimonial Administration";
      description = "Nabhik Matrimonial platform management control panel for profile verifications, blocking, and revenue analytics reporting.";
      keywords = "admin dashboard, profile approvals, platform analytics, verification portal";
      break;
    case '#/help':
      title = "Help & Support | Nabhik Matrimonial Service Center";
      description = "Need help? Search FAQs or submit queries to the Nabhik Matrimonial support team for fast troubleshooting help.";
      keywords = "customer support, matrimonial FAQs, submit support ticket, help desk";
      break;
  }

  // Update Title
  document.title = title;

  // Update Description Meta Tag
  let metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description);
  } else {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    metaDesc.setAttribute('content', description);
    document.head.appendChild(metaDesc);
  }

  // Update Keywords Meta Tag
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    metaKeywords.setAttribute('content', keywords);
  } else {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    metaKeywords.setAttribute('content', keywords);
    document.head.appendChild(metaKeywords);
  }
}
