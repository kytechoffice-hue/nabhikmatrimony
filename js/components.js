// Nabhik Matrimonial UI Components Generators

// Generate Profile Card
function makeProfileCard(profile) {
  const isShortlisted = state.shortlisted.includes(profile.id);
  const isInterestSent = state.interestsSent.includes(profile.id);
  const avatar = getSvgAvatar(profile.gender, profile.id, profile.name);
  
  return `
    <div class="profile-card" data-id="${profile.id}">
      <div class="profile-card-image">
        <img src="${avatar}" alt="${profile.name}">
        ${profile.verified ? `<div class="profile-card-overlay"><span style="margin-right:2px;">✔</span> Verified</div>` : ''}
      </div>
      <div class="profile-card-info">
        <h3>${profile.name}</h3>
        <p>${profile.age} Years, ${profile.height}</p>
        <p>${profile.education}</p>
        <p class="location">${profile.location}</p>
        
        <div style="display: flex; justify-content: center; gap: 8px; margin-top: 10px; padding: 0 10px;">
          <button class="btn-shortlist-icon" onclick="event.stopPropagation(); handleToggleShortlist(${profile.id})" style="color: ${isShortlisted ? '#d4af37' : 'rgba(255,255,255,0.4)'}; font-size: 1.1rem;" title="Shortlist">
            ★
          </button>
          <button class="btn-interest-small" onclick="event.stopPropagation(); handleSendInterest(${profile.id})" style="font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; border: 1.5px solid ${isInterestSent ? '#2e7d32' : 'var(--color-gold)'}; background: ${isInterestSent ? 'rgba(46,125,50,0.1)' : 'transparent'}; color: ${isInterestSent ? '#81c784' : 'var(--color-gold)'};">
            ${isInterestSent ? 'Interest Sent' : 'Send Interest'}
          </button>
        </div>
      </div>
      <a href="#/profile/${profile.id}" class="profile-card-btn">View Profile</a>
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
