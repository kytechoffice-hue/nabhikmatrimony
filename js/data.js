// Nabhik Matrimonial Mock Database & State Management

// Dynamic SVG Avatar Generator for high-end vector illustrations
function getSvgAvatar(gender, seedId, name) {
  // Check if profile has a custom uploaded photo path
  if (typeof state !== 'undefined' && state.profiles) {
    const profile = state.profiles.find(p => p.id === seedId);
    if (profile && profile.photo) {
      return profile.photo;
    }
  } else if (typeof initialProfiles !== 'undefined') {
    const profile = initialProfiles.find(p => p.id === seedId);
    if (profile && profile.photo) {
      return profile.photo;
    }
  }

  const hash = seedId * 31;
  const hairColors = ['#1a0f0d', '#2b1b17', '#120a08'];
  const skinColors = ['#e8a87c', '#e09867', '#f4c39f', '#dda07a'];
  const dressColors = ['#8b002c', '#b3003b', '#a21b3c', '#5c0d16', '#4a0a10'];
  const goldGradient = 'url(#avatarGoldGrad)';
  
  const skin = skinColors[hash % skinColors.length];
  const hair = hairColors[hash % hairColors.length];
  const dress = dressColors[hash % dressColors.length];
  
  // Base SVG markup with gradients and patterns
  let svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" style="width: 100%; height: 100%; display: block; background: radial-gradient(circle, #faf3e7 0%, #ecdcb9 100%);">
      <defs>
        <linearGradient id="avatarGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fdf0cd" />
          <stop offset="50%" stop-color="#d4af37" />
          <stop offset="100%" stop-color="#b8860b" />
        </linearGradient>
      </defs>
      <!-- Background Circle Border -->
      <circle cx="60" cy="60" r="54" fill="none" stroke="${goldGradient}" stroke-width="2" stroke-dasharray="2 1"/>
  `;
  
  if (gender.toLowerCase() === 'female') {
    // Female portrait with bun, gajra (flowers), traditional jewelry, saree drape
    svg += `
      <!-- Hair back bun -->
      <circle cx="60" cy="46" r="22" fill="${hair}" />
      <!-- Gajra (flowers) around bun -->
      <circle cx="44" cy="38" r="5" fill="#ffffff" />
      <circle cx="50" cy="31" r="5" fill="#ffffff" />
      <circle cx="60" cy="28" r="5" fill="#ffffff" />
      <circle cx="70" cy="31" r="5" fill="#ffffff" />
      <circle cx="76" cy="38" r="5" fill="#ffffff" />
      
      <!-- Neck -->
      <rect x="54" y="65" width="12" height="15" fill="${skin}" rx="4" />
      
      <!-- Saree Blouse / Shoulders -->
      <path d="M30,95 Q30,78 60,78 Q90,78 90,95 L90,115 L30,115 Z" fill="${dress}" />
      <!-- Gold Embroidery border on blouse -->
      <path d="M32,95 Q52,88 60,95 Q68,88 88,95" fill="none" stroke="${goldGradient}" stroke-width="3" />
      <!-- Saree Pallu (diagonal drape) -->
      <path d="M30,95 L65,78 Q78,78 90,95 L68,115 L30,115 Z" fill="#b3003b" opacity="0.9" />
      <path d="M35,95 L70,78" fill="none" stroke="${goldGradient}" stroke-width="2.5" />
      
      <!-- Head / Face -->
      <circle cx="60" cy="52" r="17" fill="${skin}" />
      
      <!-- Hair front / parting -->
      <path d="M43,52 C43,38 52,38 60,42 C68,38 77,38 77,52 C77,40 43,40 43,52 Z" fill="${hair}" />
      
      <!-- Bindi -->
      <circle cx="60" cy="48" r="2" fill="#c62828" />
      <!-- Traditional head jewelry (Maang Tikka) -->
      <line x1="60" y1="38" x2="60" y2="45" stroke="${goldGradient}" stroke-width="1.5" />
      <circle cx="60" cy="45" r="1.5" fill="#c62828" />
      
      <!-- Ear jewelry (Jhumkas) -->
      <circle cx="42" cy="56" r="3" fill="${goldGradient}" />
      <path d="M40,59 L44,59 L42,63 Z" fill="${goldGradient}" />
      <circle cx="78" cy="56" r="3" fill="${goldGradient}" />
      <path d="M76,59 L80,59 L78,63 Z" fill="${goldGradient}" />
      
      <!-- Gold Necklace -->
      <path d="M50,70 Q60,76 70,70" fill="none" stroke="${goldGradient}" stroke-width="2.5" />
      <path d="M47,73 Q60,82 73,73" fill="none" stroke="${goldGradient}" stroke-width="1.5" />
    `;
  } else {
    // Male portrait with sharp hair, clean beard, traditional collar sherwani
    svg += `
      <!-- Neck -->
      <rect x="54" y="65" width="12" height="15" fill="${skin}" rx="4" />
      
      <!-- Sherwani shoulders -->
      <path d="M30,95 Q30,76 60,76 Q90,76 90,95 L90,115 L30,115 Z" fill="${dress}" />
      <!-- Sherwani center opening and buttons -->
      <line x1="60" y1="76" x2="60" y2="115" stroke="${goldGradient}" stroke-width="2" />
      <circle cx="60" cy="84" r="1.5" fill="${goldGradient}" />
      <circle cx="60" cy="92" r="1.5" fill="${goldGradient}" />
      <circle cx="60" cy="100" r="1.5" fill="${goldGradient}" />
      <!-- Collar -->
      <path d="M50,76 Q60,72 70,76" fill="none" stroke="${goldGradient}" stroke-width="3" />
      
      <!-- Head / Face -->
      <circle cx="60" cy="50" r="18" fill="${skin}" />
      
      <!-- Hair sharp style -->
      <path d="M42,50 Q50,33 60,34 Q70,33 78,50 C80,32 40,32 42,50 Z" fill="${hair}" />
      
      <!-- Beard/Stubble outline (Traditional grooming) -->
      <path d="M42,52 Q44,66 60,68 Q76,66 78,52 Q76,63 60,63 Q44,63 42,52 Z" fill="#2b1b17" opacity="0.4" />
      <path d="M52,58 Q60,60 68,58" fill="none" stroke="${hair}" stroke-width="1.5" />
    `;
  }
  
  svg += `</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Initial seed mock profile data
const initialProfiles = [
  {
    id: 1,
    gender: 'Male',
    name: 'Rahul Nabhik',
    age: 27,
    height: "5'9\"",
    education: 'B.Tech, Software Engineer',
    profession: 'Software Engineer',
    location: 'Pune, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹12,000,000 / Year',
    familyType: 'Joint Family',
    fatherName: 'Rajesh Nabhik',
    motherName: 'Sunita Nabhik',
    nativePlace: 'Satara, Maharashtra',
    foodPreference: 'Vegetarian',
    smokingDrinking: 'No Smoking / No Drinking',
    hobbies: 'Reading, Cricket, Coding',
    verified: true,
    featured: true,
    photo: 'images/member1.png'
  },
  {
    id: 2,
    gender: 'Female',
    name: 'Priya Nabhik',
    age: 25,
    height: "5'3\"",
    education: 'MBA, HR Manager',
    profession: 'HR Manager',
    location: 'Nagpur, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹8,000,000 / Year',
    familyType: 'Nuclear Family',
    fatherName: 'Sanjay Nabhik',
    motherName: 'Lata Nabhik',
    nativePlace: 'Amravati, Maharashtra',
    foodPreference: 'Vegetarian',
    smokingDrinking: 'No Smoking / No Drinking',
    hobbies: 'Classical Dance, Painting, Cooking',
    verified: true,
    featured: true,
    photo: 'images/member3.png'
  },
  {
    id: 3,
    gender: 'Male',
    name: 'Sandeep Nabhik',
    age: 29,
    height: "5'6\"",
    education: 'MCA, Senior Developer',
    profession: 'Senior Developer',
    location: 'Mumbai, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹15,000,000 / Year',
    familyType: 'Joint Family',
    fatherName: 'Vikas Nabhik',
    motherName: 'Rekha Nabhik',
    nativePlace: 'Nashik, Maharashtra',
    foodPreference: 'Non-Vegetarian (Occasional)',
    smokingDrinking: 'No Smoking / No Drinking',
    hobbies: 'Trekking, Photography, Music',
    verified: true,
    featured: true,
    photo: 'images/member2.png'
  },
  {
    id: 4,
    gender: 'Female',
    name: 'Ankita Nabhik',
    age: 24,
    height: "5'3\"",
    education: 'B.Com, Accountant',
    profession: 'Accountant',
    location: 'Aurangabad, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹5,000,000 / Year',
    familyType: 'Nuclear Family',
    fatherName: 'Anil Nabhik',
    motherName: 'Jyoti Nabhik',
    nativePlace: 'Jalna, Maharashtra',
    foodPreference: 'Vegetarian',
    smokingDrinking: 'No Smoking / No Drinking',
    hobbies: 'Gardening, Reading, Travel',
    verified: true,
    featured: true,
    photo: 'images/member4.png'
  },
  {
    id: 5,
    gender: 'Male',
    name: 'Vikram Nabhik',
    age: 30,
    height: "5'10\"",
    education: 'Business Owner',
    profession: 'Business Owner',
    location: 'Nashik, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹20,000,000 / Year',
    familyType: 'Joint Family',
    fatherName: 'Harish Nabhik',
    motherName: 'Meena Nabhik',
    nativePlace: 'Sangli, Maharashtra',
    foodPreference: 'Non-Vegetarian',
    smokingDrinking: 'No Smoking / No Drinking',
    hobbies: 'Gym, Traveling, Driving',
    verified: true,
    featured: true,
    photo: 'images/member5.png'
  },
  {
    id: 6,
    gender: 'Female',
    name: 'Snehal Nabhik',
    age: 26,
    height: "5'4\"",
    education: 'M.Tech, Assistant Professor',
    profession: 'Professor',
    location: 'Pune, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹7,000,000 / Year',
    familyType: 'Nuclear Family',
    fatherName: 'Dilip Nabhik',
    motherName: 'Chhaya Nabhik',
    nativePlace: 'Kolhapur, Maharashtra',
    foodPreference: 'Vegetarian',
    smokingDrinking: 'No Smoking / No Drinking',
    hobbies: 'Writing, Yoga, Music',
    verified: false, // Pending verification (admin test case)
    featured: false,
    photo: 'images/member8.png'
  },
  {
    id: 7,
    gender: 'Male',
    name: 'Amit Nabhik',
    age: 28,
    height: "5'8\"",
    education: 'B.Sc, Government Officer',
    profession: 'Government Officer',
    location: 'Nagpur, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹9,000,000 / Year',
    familyType: 'Joint Family',
    fatherName: 'Pradip Nabhik',
    motherName: 'Seema Nabhik',
    nativePlace: 'Chandrapur, Maharashtra',
    foodPreference: 'Vegetarian',
    smokingDrinking: 'No Smoking / No Drinking',
    hobbies: 'News, Badminton, Public Service',
    verified: true,
    featured: false,
    photo: 'images/member7.png'
  },
  {
    id: 8,
    gender: 'Female',
    name: 'Neha Nabhik',
    age: 27,
    height: "5'2\"",
    education: 'MBBS, Doctor',
    profession: 'Doctor',
    location: 'Mumbai, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹18,000,000 / Year',
    familyType: 'Nuclear Family',
    fatherName: 'Dr. Ramesh Nabhik',
    motherName: 'Dr. Mangal Nabhik',
    nativePlace: 'Pune, Maharashtra',
    foodPreference: 'Vegetarian',
    smokingDrinking: 'No Smoking / No Drinking',
    hobbies: 'Social Work, Reading, Flute',
    verified: true,
    featured: false,
    photo: 'images/member9.png'
  },
  {
    id: 9,
    gender: 'Male',
    name: 'Ganesh Nabhik',
    age: 31,
    height: "5'7\"",
    education: 'B.Arch, Architect',
    profession: 'Architect',
    location: 'Thane, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹14,000,000 / Year',
    familyType: 'Joint Family',
    fatherName: 'Shankar Nabhik',
    motherName: 'Shaila Nabhik',
    nativePlace: 'Ratnagiri, Maharashtra',
    foodPreference: 'Non-Vegetarian',
    smokingDrinking: 'No Smoking / No Drinking',
    hobbies: 'Designing, Sketching, Traveling',
    verified: false, // Pending verification (admin test case)
    featured: false,
    photo: 'images/member6.png'
  },
  {
    id: 10,
    gender: 'Female',
    name: 'Pooja Nabhik',
    age: 23,
    height: "5'1\"",
    education: 'B.Sc Nursing, Nurse',
    profession: 'Nurse',
    location: 'Kolhapur, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹4,000,000 / Year',
    familyType: 'Joint Family',
    fatherName: 'Balaji Nabhik',
    motherName: 'Sarika Nabhik',
    nativePlace: 'Satara, Maharashtra',
    foodPreference: 'Vegetarian',
    smokingDrinking: 'No Smoking / No Drinking',
    hobbies: 'Cooking, Caring, Cinema',
    verified: true,
    featured: false,
    photo: 'images/member3.png'
  }
];

// Seed success stories
const initialStories = [
  {
    id: 1,
    couple: 'Rohit & Pooja',
    date: '12 May 2023',
    quote: 'We found the perfect match through Nabhik Metromonial. Thank you for connecting our families. The platform made searching secure and simple.'
  },
  {
    id: 2,
    couple: 'Amit & Sneha',
    date: '18 Feb 2023',
    quote: 'The platform is genuine and extremely easy to use. We are thankful to Nabhik Metromonial. Finding someone with similar family values was very easy.'
  },
  {
    id: 3,
    couple: 'Nilesh & Komal',
    date: '22 Nov 2022',
    quote: 'We got good responses and found a life partner who understands our traditional values and supports modern aspirations.'
  }
];

// Seed Events & Announcements
const initialEvents = [
  {
    id: 1,
    title: 'Nabhik Samaj Sammelan 2024',
    date: '15 June 2024',
    location: 'Nagpur, Maharashtra',
    summary: 'Grand gathering for Nabhik community families to connect and discuss traditional matchmaking.'
  },
  {
    id: 2,
    title: 'Samuhik Vivah Sohala',
    date: '21 July 2024',
    location: 'Pune, Maharashtra',
    summary: 'Annual mass marriage ceremony organized by the Nabhik Trust to support families.'
  },
  {
    id: 3,
    title: 'Yuva Melava 2024',
    date: '12 August 2024',
    location: 'Mumbai, Maharashtra',
    summary: 'Youth interaction event for educated grooms and brides to interact directly and express views.'
  },
  {
    id: 4,
    title: 'Samaj Seva Abhiyan',
    date: '25 August 2024',
    location: 'Aurangabad, Maharashtra',
    summary: 'Community education and career guidance program for youths organized by regional members.'
  }
];

// Seed Blogs
const initialBlogs = [
  {
    id: 1,
    title: '5 Key Tips for a Successful Matrimonial Search',
    category: 'Relationship Advice',
    date: '26 May 2026',
    author: 'Admin',
    excerpt: 'Navigating matrimonial databases requires patience and strategy. Read our top tips to make your search smooth, secure, and fruitful.'
  },
  {
    id: 2,
    title: 'Traditional Nabhik Wedding Rituals Explained',
    category: 'Community Traditions',
    date: '18 May 2026',
    author: 'Samaj Pandit',
    excerpt: 'Explore the rich history, meanings, and procedures of traditional rituals that define the sacred bond in a Nabhik marriage.'
  },
  {
    id: 3,
    title: 'How Families Align on Compatibility in 2026',
    category: 'Family Values',
    date: '10 May 2026',
    author: 'Counselor Anjali',
    excerpt: 'Modern matchmaking requires balancing tradition with individual aspirations. Discover how families find common ground.'
  }
];

// LocalStorage Helper to ensure state persistence
const storage = {
  get(key, defaultValue) {
    const data = localStorage.getItem('nabhik_matrimonial_' + key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set(key, value) {
    localStorage.setItem('nabhik_matrimonial_' + key, JSON.stringify(value));
  }
};

// Force update profiles in localStorage if they don't have the photo field (to handle version transitions)
try {
  const stored = localStorage.getItem('nabhik_matrimonial_profiles');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed && (parsed.length < 10 || !parsed[9].photo)) {
      localStorage.removeItem('nabhik_matrimonial_profiles');
      localStorage.removeItem('nabhik_matrimonial_currentUser');
    }
  }
} catch (e) {
  console.error("Failed to check or clear localStorage profiles", e);
}

// Global App State
const state = {
  profiles: storage.get('profiles', initialProfiles),
  stories: storage.get('stories', initialStories),
  events: storage.get('events', initialEvents),
  blogs: storage.get('blogs', initialBlogs),
  
  currentUser: storage.get('currentUser', null), // logged-in user object
  interestsSent: storage.get('interestsSent', []), // array of profile IDs user sent interest to
  interestsReceived: storage.get('interestsReceived', [1, 3]), // dummy received interests
  shortlisted: storage.get('shortlisted', []), // array of shortlisted profile IDs
  activeChats: storage.get('activeChats', {
    // profileId: Array of messages
    1: [
      { sender: 'them', text: 'Namaskar, I saw your profile and found it matching. Can we speak?' },
      { sender: 'you', text: 'Namaskar, thank you for reaching out. Yes, we can connect.' }
    ]
  }),
  
  // Simulated admin analytics
  revenueReport: storage.get('revenueReport', {
    totalRevenue: 24988,
    activePlans: { Silver: 12, Gold: 8, Platinum: 4 }
  })
};

// Sanitization: Ensure all profiles and currentUser have a gender defined to avoid runtime crashes
if (state.profiles) {
  state.profiles.forEach(p => {
    if (!p.gender) p.gender = 'Male';
  });
}
if (state.currentUser && !state.currentUser.gender) {
  state.currentUser.gender = 'Male';
}

// Clean up test user "User-2376" if present in state.profiles
if (state.profiles) {
  const originalLength = state.profiles.length;
  state.profiles = state.profiles.filter(p => p.name !== 'User-2376');
  if (state.profiles.length !== originalLength) {
    if (state.currentUser && state.currentUser.name === 'User-2376') {
      state.currentUser = null;
    }
    storage.set('profiles', state.profiles);
    storage.set('currentUser', state.currentUser);
  }
}

// State Updates Helpers
const stateActions = {
  saveAll() {
    storage.set('profiles', state.profiles);
    storage.set('stories', state.stories);
    storage.set('events', state.events);
    storage.set('blogs', state.blogs);
    storage.set('currentUser', state.currentUser);
    storage.set('interestsSent', state.interestsSent);
    storage.set('interestsReceived', state.interestsReceived);
    storage.set('shortlisted', state.shortlisted);
    storage.set('activeChats', state.activeChats);
    storage.set('revenueReport', state.revenueReport);
  },
  
  registerUser(userData) {
    // Generate new mock profile
    const newId = state.profiles.length + 1;
    const newProfile = {
      id: newId,
      verified: false,
      featured: false,
      ...userData
    };
    state.profiles.push(newProfile);
    // Log user in
    state.currentUser = newProfile;
    this.saveAll();
    return newProfile;
  },
  
  loginUser(email, password) {
    const found = state.profiles.find(p => p.emailId === email);
    if (found) {
      state.currentUser = found;
      this.saveAll();
      return found;
    }
    // Fallback: If no match but valid string, seed mock user
    if (email) {
      const mockUser = {
        id: Math.max(...state.profiles.map(p => p.id), 0) + 1,
        name: email.split('@')[0],
        emailId: email,
        gender: 'Male',
        age: 28,
        height: "5'8\"",
        education: 'B.E, Technical Lead',
        profession: 'Technical Lead',
        location: 'Mumbai, Maharashtra',
        religion: 'Hindu',
        community: 'Nabhik',
        income: '₹1,500,000 / Year',
        verified: true,
        membership: 'Free'
      };
      state.profiles.push(mockUser);
      state.currentUser = mockUser;
      this.saveAll();
      return mockUser;
    }
    return null;
  },
  
  logoutUser() {
    state.currentUser = null;
    this.saveAll();
  },
  
  toggleShortlist(id) {
    const idx = state.shortlisted.indexOf(id);
    if (idx > -1) {
      state.shortlisted.splice(idx, 1);
    } else {
      state.shortlisted.push(id);
    }
    this.saveAll();
  },
  
  sendInterest(id) {
    if (!state.interestsSent.includes(id)) {
      state.interestsSent.push(id);
      this.saveAll();
    }
  },
  
  sendChatMessage(profileId, text) {
    if (!state.activeChats[profileId]) {
      state.activeChats[profileId] = [];
    }
    state.activeChats[profileId].push({ sender: 'you', text });
    this.saveAll();
  },
  
  adminApproveProfile(id) {
    const profile = state.profiles.find(p => p.id === id);
    if (profile) {
      profile.verified = true;
      this.saveAll();
    }
  },
  
  adminBlockProfile(id) {
    const idx = state.profiles.findIndex(p => p.id === id);
    if (idx > -1) {
      state.profiles.splice(idx, 1);
      this.saveAll();
    }
  },
  
  purchaseMembership(planName, price) {
    if (state.currentUser) {
      state.currentUser.membership = planName;
      state.revenueReport.totalRevenue += price;
      state.revenueReport.activePlans[planName] = (state.revenueReport.activePlans[planName] || 0) + 1;
      this.saveAll();
    }
  }
};
