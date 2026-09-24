export const weddingConfig = {
  couple: {
    groom: { firstName: "Aaroon", lastName: "Ahmed", fullName: "Aaroon Ahmed" },
    bride: { firstName: "Olivia", lastName: "Khan", fullName: "Olivia Khan" },
    displayName: "Aaroon & Olivia",
    monogram: { groom: "A", bride: "O" },
  },

  date: {
    iso: "2027-04-26T20:00:00+05:30",
    display: "April 26, 2027",
    short: "April 26",
    yearWords: "Two Thousand Twenty Seven",
    numeric: "26 · 04 · 27",
    year: "2027",
  },

  venue: {
    name: "Liceria Grand Ballroom",
    address: "123 Anywhere St., Any City, ST 12345",
    city: "Any City",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Liceria+Grand+Ballroom+123+Anywhere+St+Any+City",
    mapsLabel: "Open Google Maps",
  },

  invitation: {
    envelopeEyebrow: "You are cordially invited to celebrate",
    envelopeTitle: "Aaroon & Olivia",
    envelopeCopy: "A celebration of love, family and a beautiful beginning",
    openButton: "Open invitation",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    arabicShort: "بِسْمِ اللَّهِ",
    arabicMeaning: "In the name of Allah, the Most Gracious, the Most Merciful",
    familyIntro: "Together with their families",
    heroMessage: "“Two souls, one heart, a lifetime of love — we invite you to witness the beginning of our forever.”",
    familyBlessing: "With the blessings of our families",
    dateEyebrow: "The day we wed",
    dateNote: "Liceria Grand Ballroom · Any City",
  },

  scratchCard: {
    revealedAria: "Wedding date revealed: April 26, 2027",
    hiddenAria: "Scratch to reveal the wedding date",
    scratchGold: "SCRATCH THE GOLD",
    revealDate: "TO REVEAL OUR DATE",
    revealed: "REVEALED",
    foreverBegins: "Our forever begins",
    scratchHint: "Scratch gently to uncover",
    stampGroom: "A",
    stampBride: "O",
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
        description: "Come for the Nikah. Stay for the laughter. Leave with a memory we will carry for years.",
      },
    ],
    quote: "What begins as two names on an invitation becomes a lifetime of memories.",
  },

  moments: [
    {
      number: "01",
      name: "Mehendi Ceremony",
      date: "April 24, 2027",
      time: "6:00 PM onwards",
      location: "The Garden Courtyard",
      description: "An evening of music, laughter, sweets, and intricate henna designs with the women of our families.",
    },
    {
      number: "02",
      name: "Wedding Ceremony",
      date: "April 26, 2027",
      time: "8:00 PM sharp",
      location: "Liceria Grand Ballroom",
      description: "The Nikah and formal union of two souls, surrounded by the prayers and blessings of our loved ones.",
    },
    {
      number: "03",
      name: "Valima Reception",
      date: "April 27, 2027",
      time: "7:00 PM",
      location: "Liceria Grand Ballroom",
      description: "A grand feast and a joyful evening to celebrate our first days as husband and wife.",
    },
  ],

  venueSection: {
    eyebrow: "The venue",
    mapsLabel: "Open Google Maps",
  },

  momentsSection: {
    eyebrow: "Three moments, one celebration",
    title: "The journey of our celebration",
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
    quote: "“Your presence on this auspicious day is the greatest gift we could receive.”",
    groomFamilyLabel: "Groom's family",
    groomFamily: "Mr. & Mrs. Ahmed Siddiqui",
    groomFamilyNote: "Family & relatives",
    brideFamilyLabel: "Bride's family",
    brideFamily: "Mr. & Mrs. Salman Khan",
    brideFamilyNote: "Family & relatives",
    thanksLabel: "With thanks to",
    thanksName: "Our grandparents",
    thanksNote: "Siblings & cousins",
  },

  seo: {
    title: "Aaroon & Olivia — Wedding Invitation",
    description: "A royal Muslim wedding invitation for Aaroon and Olivia, with ceremony details, RSVP, and directions.",
    ogDescription: "Join Aaroon and Olivia as they celebrate their wedding with family and friends.",
  },
} as const;
