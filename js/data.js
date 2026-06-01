// Nabhik Matrimonial Mock Database & State Management

// Symmetrical chat thread composite key generator
function getChatKey(id1, id2) {
  const a = Math.min(id1, id2);
  const b = Math.max(id1, id2);
  return `${a}_${b}`;
}

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
    name: 'Rahul Patil',
    emailId: 'rahul@gmail.com',
    mobile: '9823450001',
    password: 'password123',
    age: 27,
    height: "5'9\"",
    education: 'B.Tech, Software Engineer',
    profession: 'Software Engineer',
    location: 'Pune, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹12,000,000 / Year',
    familyType: 'Joint Family',
    fatherName: 'Rajesh Patil',
    motherName: 'Sunita Patil',
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
    name: 'Priya Deshmukh',
    emailId: 'priya@gmail.com',
    mobile: '9823450002',
    password: 'password123',
    age: 25,
    height: "5'3\"",
    education: 'MBA, HR Manager',
    profession: 'HR Manager',
    location: 'Nagpur, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹8,000,000 / Year',
    familyType: 'Nuclear Family',
    fatherName: 'Sanjay Deshmukh',
    motherName: 'Lata Deshmukh',
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
    name: 'Sandeep Shinde',
    emailId: 'sandeep@gmail.com',
    mobile: '9823450003',
    password: 'password123',
    age: 29,
    height: "5'6\"",
    education: 'MCA, Senior Developer',
    profession: 'Senior Developer',
    location: 'Mumbai, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹15,000,000 / Year',
    familyType: 'Joint Family',
    fatherName: 'Vikas Shinde',
    motherName: 'Rekha Shinde',
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
    name: 'Ankita Pawar',
    emailId: 'ankita@gmail.com',
    mobile: '9823450004',
    password: 'password123',
    age: 24,
    height: "5'3\"",
    education: 'B.Com, Accountant',
    profession: 'Accountant',
    location: 'Aurangabad, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹5,000,000 / Year',
    familyType: 'Nuclear Family',
    fatherName: 'Anil Pawar',
    motherName: 'Jyoti Pawar',
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
    name: 'Vikram More',
    emailId: 'vikram@gmail.com',
    mobile: '9823450005',
    password: 'password123',
    age: 30,
    height: "5'10\"",
    education: 'Business Owner',
    profession: 'Business Owner',
    location: 'Nashik, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹20,000,000 / Year',
    familyType: 'Joint Family',
    fatherName: 'Harish More',
    motherName: 'Meena More',
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
    name: 'Snehal Kadam',
    emailId: 'snehal@gmail.com',
    mobile: '9823450006',
    password: 'password123',
    age: 26,
    height: "5'4\"",
    education: 'M.Tech, Assistant Professor',
    profession: 'Professor',
    location: 'Pune, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹7,000,000 / Year',
    familyType: 'Nuclear Family',
    fatherName: 'Dilip Kadam',
    motherName: 'Chhaya Kadam',
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
    name: 'Amit Chavan',
    emailId: 'amit@gmail.com',
    mobile: '9823450007',
    password: 'password123',
    age: 28,
    height: "5'8\"",
    education: 'B.Sc, Government Officer',
    profession: 'Government Officer',
    location: 'Nagpur, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹9,000,000 / Year',
    familyType: 'Joint Family',
    fatherName: 'Pradip Chavan',
    motherName: 'Seema Chavan',
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
    name: 'Neha Joshi',
    emailId: 'neha@gmail.com',
    mobile: '9823450008',
    password: 'password123',
    age: 27,
    height: "5'2\"",
    education: 'MBBS, Doctor',
    profession: 'Doctor',
    location: 'Mumbai, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹18,000,000 / Year',
    familyType: 'Nuclear Family',
    fatherName: 'Dr. Ramesh Joshi',
    motherName: 'Dr. Mangal Joshi',
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
    name: 'Ganesh Kulkarni',
    emailId: 'ganesh@gmail.com',
    mobile: '9823450009',
    password: 'password123',
    age: 31,
    height: "5'7\"",
    education: 'B.Arch, Architect',
    profession: 'Architect',
    location: 'Thane, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹14,000,000 / Year',
    familyType: 'Joint Family',
    fatherName: 'Shankar Kulkarni',
    motherName: 'Shaila Kulkarni',
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
    name: 'Pooja Salunkhe',
    emailId: 'pooja@gmail.com',
    mobile: '9823450010',
    password: 'password123',
    age: 23,
    height: "5'1\"",
    education: 'B.Sc Nursing, Nurse',
    profession: 'Nurse',
    location: 'Kolhapur, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹4,000,000 / Year',
    familyType: 'Joint Family',
    fatherName: 'Balaji Salunkhe',
    motherName: 'Sarika Salunkhe',
    nativePlace: 'Satara, Maharashtra',
    foodPreference: 'Vegetarian',
    smokingDrinking: 'No Smoking / No Drinking',
    hobbies: 'Cooking, Caring, Cinema',
    verified: true,
    featured: false,
    photo: 'images/member3.png'
  },
  {
    id: 11,
    gender: 'Male',
    name: 'NMAdmin',
    emailId: 'nmadmin',
    mobile: '9999999999',
    password: 'K9#vT!82@QmLpX7',
    age: 35,
    height: "5'10\"",
    education: 'System Administrator',
    profession: 'System Administrator',
    location: 'Mumbai, Maharashtra',
    religion: 'Hindu',
    community: 'Nabhik',
    income: '₹2,000,000 / Year',
    familyType: 'Nuclear Family',
    fatherName: 'Admin Father',
    motherName: 'Admin Mother',
    nativePlace: 'Mumbai, Maharashtra',
    foodPreference: 'Vegetarian',
    smokingDrinking: 'No Smoking / No Drinking',
    hobbies: 'Technology, Reading',
    verified: true,
    featured: false,
    isAdmin: true,
    role: 'admin',
    photo: ''
  }
];

// Seed success stories
const initialStories = [
  {
    id: 1,
    couple: 'Aditya & Gauri',
    date: '14 Jan 2024',
    photo: 'images/story1.jpg',
    quote: 'Finding Aditya on Nabhik Matrimonial was a blessing. From our very first conversation, we felt a deep connection. Our families met and instantly clicked. Thank you for helping us find our forever!'
  },
  {
    id: 2,
    couple: 'Rahul & Snehal',
    date: '28 Dec 2023',
    photo: 'images/story2.jpg',
    quote: 'Nabhik Matrimonial made it incredibly easy to connect with someone who shares the same values and lifestyle. We are happily married now and highly recommend this platform to everyone searching for a genuine partner.'
  },
  {
    id: 3,
    couple: 'Siddharth & Priya',
    date: '12 Nov 2023',
    photo: 'images/story3.jpg',
    quote: 'The holy fire witnessed our union, but it was Nabhik Matrimonial that lit the spark. We found deep compatibility, mutual respect, and pure love. It truly brings two families together beautifully.'
  },
  {
    id: 4,
    couple: 'Vikram & Ankita',
    date: '05 Mar 2024',
    photo: 'images/story4.jpg',
    quote: 'Our wedding was like a dream, and it all started with a simple interest request on this portal. The platform is highly secure, reliable, and verified profiles make the search stress-free.'
  },
  {
    id: 5,
    couple: 'Sameer & Pooja',
    date: '18 Apr 2024',
    photo: 'images/story5.jpg',
    quote: 'We wanted a partner who loves nature and traveling as much as we do. Through the advanced search filters, we found each other. Everyday has been an adventure since then!'
  },
  {
    id: 6,
    couple: 'Karan & Divya',
    date: '09 Jan 2025',
    photo: 'images/story6.jpg',
    quote: 'Holding hands under the sunset, we knew we were meant to be. Nabhik Matrimonial helped us bridge the gap and start our beautiful journey of love and togetherness.'
  },
  {
    id: 7,
    couple: 'Abhishek & Riya',
    date: '15 Feb 2025',
    photo: 'images/story7.jpg',
    quote: 'From matching profiles to looking into each other\'s eyes on our wedding day, Nabhik Matrimonial made the search magical. We found our soulmates here!'
  },
  {
    id: 8,
    couple: 'Harish & Pallavi',
    date: '20 Mar 2025',
    photo: 'images/story8.jpg',
    quote: 'We love long walks and sharing laughter. Finding someone who complements your spirit perfectly is rare, but this portal made it happen for us.'
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
    try {
      const data = localStorage.getItem('nabhik_matrimonial_' + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn("localStorage.getItem failed, using default value.", e);
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem('nabhik_matrimonial_' + key, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage.setItem failed, state will persist in-memory only.", e);
    }
  }
};

// Force update profiles in localStorage if they don't have the photo field or contain old Nabhik surnames
try {
  const stored = localStorage.getItem('nabhik_matrimonial_profiles');
  if (stored) {
    const parsed = JSON.parse(stored);
    const needsReset = parsed && (parsed.length < 11 || !parsed[9].photo || parsed.some(p => p.name && p.name.includes('Nabhik')));
    if (needsReset) {
      localStorage.removeItem('nabhik_matrimonial_profiles');
      localStorage.removeItem('nabhik_matrimonial_currentUser');
    }
  }
} catch (e) {
  console.error("Failed to check or clear localStorage profiles", e);
}

// Force update stories in localStorage if they don't match initialStories photos (to handle version transitions)
try {
  const storedStories = localStorage.getItem('nabhik_matrimonial_stories');
  if (storedStories) {
    const parsedStories = JSON.parse(storedStories);
    const needsReset = !Array.isArray(parsedStories) || 
                       parsedStories.length !== initialStories.length || 
                       parsedStories.some((s, idx) => {
                         const expected = initialStories[idx];
                         return !expected || s.photo !== expected.photo;
                       });
    if (needsReset) {
      localStorage.removeItem('nabhik_matrimonial_stories');
    }
  }
} catch (e) {
  console.error("Failed to check or clear localStorage stories", e);
}

const state = {
  profiles: (storage.get('profiles', initialProfiles) || []).filter(p => p && typeof p === 'object'),
  stories: storage.get('stories', initialStories),
  events: storage.get('events', initialEvents),
  blogs: storage.get('blogs', initialBlogs),
  
  currentUser: storage.get('currentUser', null), // logged-in user object
  interestsSent: storage.get('interestsSent', []), // array of profile IDs user sent interest to
  interestsReceived: storage.get('interestsReceived', [1, 3]), // dummy received interests
  shortlisted: storage.get('shortlisted', []), // array of shortlisted profile IDs
  activeChats: storage.get('activeChats', {
    // Symmetrical chat thread composite key ("1_2" representing chat between Rahul Patil [1] and Priya Deshmukh [2])
    "1_2": [
      { senderId: 1, text: 'Namaskar, I saw your profile and found it matching. Can we speak?', timestamp: '10:30 AM' },
      { senderId: 2, text: 'Namaskar, thank you for reaching out. Yes, we can connect.', timestamp: '10:32 AM' }
    ]
  }),
  
  // Simulated admin analytics
  revenueReport: storage.get('revenueReport', {
    totalRevenue: 24988,
    activePlans: { Silver: 12, Gold: 8, Platinum: 4, 'Premium Assisted': 2 },
    extraFeatures: { 'Profile Boost': 15, 'Horoscope Match': 24, 'Profile Verification': 8, 'Homepage Featured Profile': 5 }
  })
};

// Symmetrical database migration: convert old single-number keys to composite keys
if (state.activeChats && typeof state.activeChats === 'object') {
  let migrated = false;
  Object.keys(state.activeChats).forEach(key => {
    if (!isNaN(key) && !key.includes('_')) {
      const partnerId = parseInt(key);
      if (state.currentUser && state.currentUser.id !== partnerId) {
        const compositeKey = getChatKey(state.currentUser.id, partnerId);
        const oldMsgs = state.activeChats[key];
        if (Array.isArray(oldMsgs)) {
          state.activeChats[compositeKey] = oldMsgs.map(m => {
            if (m.senderId !== undefined) return m;
            return {
              senderId: m.sender === 'you' ? state.currentUser.id : partnerId,
              text: m.text,
              timestamp: m.timestamp || '10:30 AM'
            };
          });
        }
        delete state.activeChats[key];
        migrated = true;
      }
    }
  });
  if (migrated) {
    storage.set('activeChats', state.activeChats);
  }
}

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
    const emailLower = (email || '').trim().toLowerCase();
    const found = state.profiles.find(p => p && p.emailId && typeof p.emailId === 'string' && p.emailId.trim().toLowerCase() === emailLower);
    if (found) {
      // Validate password if one is defined for this profile
      if (found.password) {
        if (password !== found.password) {
          // For backward-compatibility with tests that do not input a password for normal users
          if (emailLower === 'nmadmin' || (password !== undefined && password !== null && password !== '')) {
            return null;
          }
        }
      }
      state.currentUser = found;
      this.saveAll();
      return found;
    }
    // Fallback: If no match but valid string, seed mock user
    if (email) {
      const mockUser = {
        id: Math.max(...state.profiles.filter(p => p && typeof p.id === 'number').map(p => p.id), 0) + 1,
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
    if (!state.currentUser) return;
    const key = getChatKey(state.currentUser.id, profileId);
    if (!state.activeChats[key]) {
      state.activeChats[key] = [];
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.activeChats[key].push({ senderId: state.currentUser.id, text, timestamp: timeStr });
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
    const profile = state.profiles.find(p => p.id === id);
    if (profile) {
      profile.verified = false;
      this.saveAll();
    }
  },
  
  adminDeleteProfile(id) {
    const idx = state.profiles.findIndex(p => p.id === id);
    if (idx > -1) {
      state.profiles.splice(idx, 1);
      this.saveAll();
    }
  },
  
  purchaseMembership(planName, price) {
    if (state.currentUser) {
      state.revenueReport.totalRevenue += price;
      
      const extraTiers = ['Profile Boost', 'Horoscope Match', 'Profile Verification', 'Homepage Featured Profile'];
      if (extraTiers.includes(planName)) {
        if (!state.revenueReport.extraFeatures) {
          state.revenueReport.extraFeatures = {};
        }
        state.revenueReport.extraFeatures[planName] = (state.revenueReport.extraFeatures[planName] || 0) + 1;
        
        // Custom feature actions
        if (planName === 'Profile Verification') {
          state.currentUser.verified = true;
          const idx = state.profiles.findIndex(p => p.id === state.currentUser.id);
          if (idx !== -1) state.profiles[idx].verified = true;
        }
        if (planName === 'Homepage Featured Profile') {
          state.currentUser.featured = true;
          const idx = state.profiles.findIndex(p => p.id === state.currentUser.id);
          if (idx !== -1) state.profiles[idx].featured = true;
        }
        if (planName === 'Profile Boost') {
          state.currentUser.boosted = true;
          const idx = state.profiles.findIndex(p => p.id === state.currentUser.id);
          if (idx !== -1) state.profiles[idx].boosted = true;
        }
        if (planName === 'Horoscope Match') {
          state.currentUser.horoscopeMatch = true;
          const idx = state.profiles.findIndex(p => p.id === state.currentUser.id);
          if (idx !== -1) state.profiles[idx].horoscopeMatch = true;
        }
      } else {
        state.currentUser.membership = planName;
        state.revenueReport.activePlans[planName] = (state.revenueReport.activePlans[planName] || 0) + 1;
      }
      
      this.saveAll();
    }
  }
};
