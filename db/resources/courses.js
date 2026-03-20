import getFileContent from '@db/functions/get-file-content';

const VIMEO_PREVIEW_URLS = [
  "https://vimeo.com/371639181?fl=pl&fe=sh"
];

export default async () => {
  const admin1 = {
    name: 'Alex Banzea',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    title: 'IM',
  };

  const admin2 = {
    name: 'Grandmaster Coach',
    image: 'https://randomuser.me/api/portraits/men/54.jpg',
    title: 'GM',
  };

  const admin3 = {
    name: 'Strategy Expert',
    image: 'https://randomuser.me/api/portraits/men/76.jpg',
    title: 'FM',
  };

  const courses = [
    // --- Admin 1 (Alex Banzea) Courses ---
    {
      name: 'Sicilian Defense Mastery',
      description: getFileContent('../descriptions/sicilian-defense.md'),
      image: {
        name: '1234861669219094.png',
        path: '/images/1234861669219094.png',
      },
      preview: {
        description:
          'Unlock the secrets of the most aggressive response to 1.e4! Learn Key variations: Najdorf, Dragon, and Scheveningen.',
        image: {
          name: '1234861669219094.png',
          path: '/images/1234861669219094.png',
        },
      },
      difficulty: 'advanced',
      tags: ['Opening', 'Tactics', 'Sicilian'],
      author: admin1,
      isPaid: true,
      price: 25,
      currency: 'EUR',
      hasMoveTrainer: true,
    },
    {
      name: 'Jobava London System',
      description: getFileContent('../descriptions/jobava-beginner.md'),
      image: {
        name: 'alex-banzea-chess-course-3.jpg',
        path: '/images/alex-banzea-chess-course-3.jpg',
      },
      preview: {
        description:
          'The Jobava London System offers an aggressive twist on the classic London approach.',
        image: {
          name: 'alex-banzea-chess-course-3.jpg',
          path: '/images/alex-banzea-chess-course-3.jpg',
        },
      },
      difficulty: 'intermediate',
      tags: ['Opening', 'System', 'White'],
      author: admin1,
      isPaid: true,
      price: 15,
      currency: 'EUR',
      hasMoveTrainer: true,
    },
    {
      name: 'Tactics Mastery: From Beginner to Expert',
      description: getFileContent('../descriptions/tactics-mastery.md'),
      image: {
        name: '136631734951157.png',
        path: '/images/136631734951157.png',
      },
      preview: {
        description: 'Sharpen your tactical vision! Learn Pins, Forks, and Skewers.',
        image: {
          name: '136631734951157.png',
          path: '/images/136631734951157.png',
        },
      },
      difficulty: 'intermediate',
      tags: ['Tactics', 'Calculation'],
      author: admin1,
      isPaid: true,
      price: 20,
      currency: 'EUR',
      hasMoveTrainer: true,
    },

    // --- Admin 2 (Grandmaster Coach) Courses ---
    {
      name: "King's Indian Defense",
      description: getFileContent('../descriptions/kings-indian.md'),
      image: {
        name: '1475801681203296.png',
        path: '/images/1475801681203296.png',
      },
      preview: {
        description:
          "Dominate with the King's Indian Defense! Learn the Mar del Plata variation and attacking plans.",
        image: {
          name: '1475801681203296.png',
          path: '/images/1475801681203296.png',
        },
      },
      difficulty: 'advanced',
      tags: ['Opening', 'Black', 'Strategy'],
      author: admin2,
      isPaid: true,
      price: 30,
      currency: 'EUR',
      hasMoveTrainer: true,
    },
    {
      name: 'Advanced Endgame Strategy',
      description: getFileContent('../descriptions/adv-endgames.md'),
      image: {
        name: '1945811697105335.png',
        path: '/images/1945811697105335.png',
      },
      preview: {
        description:
          'Turn your advantage into a win. Master Rook endgames and Minor piece endings.',
        image: {
          name: '1945811697105335.png',
          path: '/images/1945811697105335.png',
        },
      },
      difficulty: 'advanced',
      tags: ['Endgame', 'Technique'],
      author: admin2,
      isPaid: true,
      price: 25,
      currency: 'EUR',
    },
    {
      name: 'The Ruy Lopez (Spanish Opening)',
      description: getFileContent('../descriptions/ruy-lopez.md'),
      image: {
        name: '1993581701685140.png',
        path: '/images/1993581701685140.png',
      },
      preview: {
        description:
          'Master the classic Spanish Opening. Explore Main lines and Positional concepts.',
        image: {
          name: '1993581701685140.png',
          path: '/images/1993581701685140.png',
        },
      },
      difficulty: 'intermediate',
      tags: ['Opening', 'White', 'Classic'],
      author: admin2,
      isPaid: true,
      price: 20,
      currency: 'EUR',
      hasMoveTrainer: true,
    },

    // --- Admin 3 (Strategy Expert) Courses ---
    {
      name: 'Positional Play & Strategy',
      description: getFileContent('../descriptions/positional-play.md'),
      image: {
        name: '2248671712568775.png',
        path: '/images/2248671712568775.png',
      },
      preview: {
        description:
          'Understand the deeper meaning of chess moves. Learn about Weak squares and Pawn structures.',
        image: {
          name: '2248671712568775.png',
          path: '/images/2248671712568775.png',
        },
      },
      difficulty: 'intermediate',
      tags: ['Strategy', 'Positional'],
      author: admin3,
      isPaid: true,
      price: 22,
      currency: 'EUR',
    },
    {
      name: 'Attacking Secrets',
      description: getFileContent('../descriptions/attacking-secrets.md'),
      image: {
        name: '2316841716811370.png',
        path: '/images/2316841716811370.png',
      },
      preview: {
        description:
          'Learn how to launch unstoppable attacks. Master King safety and Piece coordination.',
        image: {
          name: '2316841716811370.png',
          path: '/images/2316841716811370.png',
        },
      },
      difficulty: 'beginner',
      tags: ['Attack', 'Tactics'],
      author: admin3,
      isPaid: true,
      price: 18,
      currency: 'EUR',
      hasMoveTrainer: true,
    },
    {
      name: 'Chess Fundamentals',
      description: getFileContent('../descriptions/fundamentals-free.md'),
      image: {
        name: '2414781716811215.png',
        path: '/images/2414781716811215.png',
      },
      preview: {
        description:
          'Get started with chess for FREE! Learn the foundations and start playing today!',
        image: {
          name: '2414781716811215.png',
          path: '/images/2414781716811215.png',
        },
      },
      difficulty: 'beginner',
      tags: ['Fundamentals', 'Free'],
      author: admin3,
      isFree: true,
      hasMoveTrainer: true,
    },
  ];

  return courses.map((course, index) => ({
    ...course,
    preview: {
      ...course.preview,
      video: VIMEO_PREVIEW_URLS[index % VIMEO_PREVIEW_URLS.length],
    },
  }));
};
