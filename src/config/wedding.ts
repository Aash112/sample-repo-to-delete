export const weddingConfig = {
  couple: {
    groom: { firstName: "Al-Ryan", lastName: "", fullName: "Al-Ryan" },
    bride: { firstName: "Faseeha", lastName: "", fullName: "Faseeha" },
    displayName: "Al-Ryan & Faseeha",
    monogram: { groom: "A", bride: "F" },
  },

  date: {
    iso: "2026-12-30T12:30:00+05:30",
    display: "December 30, 2026",
    short: "December 30",
    yearWords: "Two Thousand Twenty Six",
    numeric: "30 · 12 · 26",
    year: "2026",
  },

  venue: {
    name: "UAE Community Hall",
    address: "Thengapattanam, Kanniyakumari",
    city: "Thengapattanam",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=UAE+Community+Hall+Thengapattanam",
    mapsLabel: "Open Google Maps",
  },
  
  invitation: {
    envelopeEyebrow: "You are cordially invited to celebrate",
    envelopeTitle: "Al-Ryan & Faseeha",
    envelopeCopy: "A celebration of love, family and a beautiful beginning",
    openButton: "Open invitation",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    arabicShort: "بِسْمِ اللَّهِ",
    arabicMeaning: "In the name of Allah, the Most Gracious, the Most Merciful",
    familyIntro: "Together with their families",
    heroMessage: "“Two souls, one heart, a lifetime of love — we invite you to witness the beginning of our forever.”",
    familyBlessing: "With the blessings of our families",
    dateEyebrow: "The day we wed",
    dateNote: "A day to remember, a beginning to cherish",
  },

  scratchCard: {
    revealedAria: "Wedding date revealed: December 30, 2026",
    hiddenAria: "Scratch to reveal the wedding date",
    scratchGold: "SCRATCH THE GOLD",
    revealDate: "TO REVEAL OUR DATE",
    revealed: "REVEALED",
    foreverBegins: "Our forever begins",
    scratchHint: "Scratch gently to uncover",
    stampGroom: "A",
    stampBride: "F",
  },

  story: {
    eyebrow: "A little more than a date",
    title: "A beginning written in gold.",
    intro: "Before the music, before the lights, before everyone gathers around us — there is simply a promise. Two families, two stories, and one beautiful chapter about to begin.",
    panels: [
      {
        number: "01",
        eyebrow: "The promise",
        title: "To choose each other, every day.",
        description: "Not only for the celebration, but for every ordinary morning, every difficult evening, and every quiet moment in between.",
      },
      {
        number: "02",
        eyebrow: "The blessing",
        title: "Two families become one circle.",
        description: "With the blessings of our parents, grandparents, siblings, and everyone who has loved us into becoming who we are.",
      },
      {
        number: "03",
        eyebrow: "The invitation",
        title: "Your presence completes the picture.",
        description: "Come for the Nikkah. Stay for the laughter. Leave with a memory we will carry for years.",
      },
    ],
    quote: "What begins as two names on an invitation becomes a lifetime of memories.",
  },

  moments: [
    {
      number: "01",
      name: "Nikkah Ceremony",
      date: "December 30, 2026",
      time: "12:30 PM – 1:30 PM",
      location: "UAE Community Hall",
      description: "The Nikkah and formal union of two souls, surrounded by the prayers and blessings of our loved ones.",
    },
  ],

  venueSection: {
    eyebrow: "The venue",
    mapsLabel: "Open Google Maps",
  },

  momentsSection: {
    eyebrow: "One beautiful moment",
    title: "The day we begin our journey",
  },

  countdown: {
    ariaLabel: "Countdown to the wedding",
  },

  celebration: {
    eyebrow: "And then, we celebrate",
    firstLine: "Come as our guest.",
    secondLine: "Leave as family.",
    time: "8:00 PM",
    description: "Dress in your favourite festive colours, bring your blessings, and let us make an evening worth remembering.",
  },

  rsvp: {
    eyebrow: "We hope you can join us",
    title: "Kindly RSVP",
    intro: "We would be honoured to celebrate with you.",
    nameLabel: "Full name",
    namePlaceholder: "Your name",
    guestsLabel: "Guests",
    attendanceLabel: "Attendance",
    guestOptions: ["1 guest", "2 guests", "3 guests"],
    submit: "Confirm attendance",
    attendanceOptions: { accept: "Joyfully accept", decline: "Regretfully decline" },
    successTitle: "Thank you for letting us know.",
    successMessage: "Your response has been noted with love. We cannot wait to celebrate together.",
  },

footer: {
  script: "With love & gratitude",

  quote: "“Your presence on this blessed day is the greatest gift we could receive.”",

  groomFamilyLabel: "Groom's parents",
  groomFamily: "S. Abdul Raheem & \n M. Siddi Navasia",
  groomFamilyNote: "“With prayers, love, and blessings.”",

  brideFamilyLabel: "Bride's parents",
  brideFamily: "S. Syed Ali & \n J. Samsu Banu",
  brideFamilyNote: "“With love, prayers, and heartfelt blessings.”",

  thanksLabel: "Our siblings",
  thanksName: "A. Azmiya · S. Fahima Azeez · \nS. Farha · S. Fathima",
  thanksNote: "“Together in every moment, celebrating this beautiful beginning.”",
},
  seo: {
    title: "Al-Ryan & Faseeha — Wedding Invitation",
    description: "A royal Muslim wedding invitation for Al-Ryan and Faseeha, with ceremony details, RSVP, and directions.",
    ogDescription: "Join Al-Ryan and Faseeha as they celebrate their wedding with family and friends.",
  },
} as const;
