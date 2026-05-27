// Nabhik Matrimonial UI Components Generators

// Generate Profile Card
function makeProfileCard(profile) {
  const avatar = getSvgAvatar(profile.gender, profile.id, profile.name);
  
  return `
    <div class="profile-card only-photo" data-id="${profile.id}" onclick="window.location.hash = '#/profile/${profile.id}'" style="cursor: pointer; height: 320px;">
      <div class="profile-card-image" style="height: 100%;">
        <img src="${avatar}" alt="${profile.name}">
        ${profile.verified ? `<div class="profile-card-overlay"><span style="margin-right:2px;">✔</span> Verified</div>` : ''}
        <!-- Subtle gradient overlay at bottom with Name and basic details -->
        <div class="profile-photo-hover-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 60%, transparent 100%); padding: 24px 12px 12px 12px; text-align: center; color: white; transition: var(--transition-fast);">
          <h3 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--color-gold-light); margin-bottom: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.7);">${profile.name}</h3>
          <p style="font-size: 0.78rem; color: rgba(255,255,255,0.8); margin: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.7);">${profile.age} Yrs, ${profile.height} • ${profile.location.split(',')[0]}</p>
        </div>
      </div>
    </div>
  `;
}

// Generate Success Story Card
function makeSuccessCard(story) {
  // Use dynamically generated couple avatar as placeholder
  const avatar = getSvgAvatar('female', story.id * 10, story.couple);
  return `
    <div class="success-card">
      <div class="success-card-image">
        <img src="${avatar}" alt="${story.couple}">
      </div>
      <div class="success-card-content">
        <p class="success-quote">“${story.quote}”</p>
        <div>
          <h4 class="success-names">${story.couple}</h4>
          <p class="success-date">Married on ${story.date}</p>
        </div>
      </div>
    </div>
  `;
}

// Generate Event Card
function makeEventCard(event) {
  // Generates dynamic wedding/social placeholder SVG
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" style="width:100%; height:100%; display:block; background-color:var(--color-maroon-dark);">
      <circle cx="100" cy="60" r="40" fill="none" stroke="var(--color-gold-trans)" stroke-width="2"/>
      <path d="M70,90 Q100,50 130,90" fill="none" stroke="var(--color-gold)" stroke-width="2" />
      <text x="100" y="65" font-family="Playfair Display" font-size="14" fill="var(--color-gold)" text-anchor="middle" font-weight="bold">EVENTS</text>
    </svg>
  `;
  const eventImg = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgMarkup);
  
  return `
    <div class="event-card">
      <div class="event-image">
        <img src="${eventImg}" alt="${event.title}">
      </div>
      <div class="event-info">
        <h3>${event.title}</h3>
        <div class="event-details">
          <span>📅 ${event.date}</span>
          <span>📍 ${event.location}</span>
          <p style="margin-top: 6px; font-size: 0.78rem; line-height: 1.4; color: var(--color-text-muted);">${event.summary}</p>
        </div>
      </div>
    </div>
  `;
}

// Generate Blog Card
function makeBlogCard(blog) {
  // Generates dynamic book/blog placeholder SVG
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" style="width:100%; height:100%; display:block; background-color:var(--color-maroon);">
      <rect x="50" y="30" width="100" height="60" fill="none" stroke="var(--color-gold)" stroke-width="2" rx="4"/>
      <line x1="60" y1="45" x2="140" y2="45" stroke="var(--color-gold-light)" stroke-width="1.5"/>
      <line x1="60" y1="60" x2="120" y2="60" stroke="var(--color-gold-light)" stroke-width="1.5"/>
      <line x1="60" y1="75" x2="100" y2="75" stroke="var(--color-gold-light)" stroke-width="1.5"/>
    </svg>
  `;
  const blogImg = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgMarkup);

  return `
    <div class="blog-card">
      <div class="blog-card-image">
        <img src="${blogImg}" alt="${blog.title}">
      </div>
      <div class="blog-card-content">
        <div>
          <span class="blog-card-meta">${blog.category} • ${blog.date}</span>
          <h3>${blog.title}</h3>
          <p>${blog.excerpt}</p>
        </div>
        <a href="#/blogs" class="blog-read-more" style="margin-top: 12px; display: inline-block;">Read Full Article →</a>
      </div>
    </div>
  `;
}

// Global Toast Notification Helper
function showToast(message) {
  const toast = document.getElementById('toast-system');
  if (toast) {
    document.getElementById('toast-text').innerText = message;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  }
}
