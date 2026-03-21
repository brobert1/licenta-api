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
      description:
        'This course is built for players who want a serious black repertoire against 1.e4 and are ready to embrace sharp, double-edged positions. You will work through the Najdorf move order, typical anti-Sicilian setups, tactical patterns that appear again and again in club and online play, and a dedicated block on Dragon and Scheveningen ideas so you know where your pieces belong and when to strike. Each study module is broken into five chapters with drills and interactive positions so you remember the plans instead of memorizing moves blindly. By the end you should feel calmer in the main lines, clearer against sidelines, and more confident turning initiative into results.',
      image: {
        name: '1234861669219094.png',
        path: '/images/1234861669219094.png',
      },
      preview: {
        description:
          'Unlock the secrets of the most aggressive response to 1.e4! Four study modules (Najdorf, anti-Sicilians, tactics, Dragon/Scheveningen lab) with five chapters each—over twenty chapters of drills and games.',
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
      description:
        'The Jobava London gives White a practical system that stays flexible while still offering real chances to play for an advantage. You will see how the early knight and bishop development fits together, how to handle Black’s most annoying tries, and how the recommended pawn structures guide your middlegame plans. The course moves from core structures into attacking schemes, then exercises and move-order details so you are not lost when opponents deviate on move four or five. It is aimed at club players who already know the rules of the London but want clearer guidance and more punch in their games.',
      image: {
        name: 'alex-banzea-chess-course-3.jpg',
        path: '/images/alex-banzea-chess-course-3.jpg',
      },
      preview: {
        description:
          'The Jobava London System offers an aggressive twist on the classic London approach. Four modules cover structures, attacking plans, exercises, and move-order sidelines—each with five stepped chapters.',
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
      description:
        'Tactics decide most games at amateur level, and this course is designed to train your eye for forks, pins, skewers, deflections, and the other motifs that show up in real positions. You start with clear patterns, move into calculation under time pressure, then mixed puzzles and harder combinations so you bridge the gap between seeing a tactic in a book and spotting it over the board. The material is paced in short chapters so you can drill regularly without burning out. If you put in consistent work, you should miss fewer one-move blunders and spot more opportunities to win material or deliver mate.',
      image: {
        name: '136631734951157.png',
        path: '/images/136631734951157.png',
      },
      preview: {
        description:
          'Sharpen your tactical vision! Four modules—from core motifs and calculation to mixed puzzles and master-level combinations—with five chapters per module for structured practice.',
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
      description:
        'The King’s Indian is one of the most ambitious ways for Black to meet 1.d4, and this course focuses on understanding the pawn storms, piece placements, and typical sacrifices rather than dumping thousands of moves on you at once. You will study classical setups, the heavy attacking lines connected with the Mar del Plata idea, and plans when White fianchettoes the king’s bishop, plus a final module on universal attacking ideas you can reuse across variations. The goal is to know what you are playing for when you push ...e5 or launch ...f5, and how to meet White’s central space without panicking. Suited for players who enjoy dynamic chess and are willing to learn some theory to support that style.',
      image: {
        name: '1475801681203296.png',
        path: '/images/1475801681203296.png',
      },
      preview: {
        description:
          "Dominate with the King's Indian Defense! Classical lines, Mar del Plata, fianchetto counterplay, and universal attack plans—four studies, five chapters each.",
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
      description:
        'Endgames reward patience and technique, and this course concentrates on the types of positions that decide whether your opening and middlegame work actually counts. You will practice king and pawn fundamentals, rook endings that appear constantly in practice, and minor-piece endings where the right plan matters more than a single trick. A further module uses practical studies and fragments from serious games so you see how strong players convert small edges. The explanations stay concrete: which file the rook belongs on, when to advance the king, and when simplification helps or hurts. Best for players who already know the basic mates and want fewer spoiled wins.',
      image: {
        name: '1945811697105335.png',
        path: '/images/1945811697105335.png',
      },
      preview: {
        description:
          'Turn your advantage into a win. King-and-pawn, rook technique, minor pieces, plus practical study games—four modules with five chapters apiece.',
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
      description:
        'The Spanish has been a main line for more than a century because it gives White lasting pressure without forcing an immediate crisis. Here you learn the closed structures that dominate modern practice, the tactical sharpness of the Open Spanish when Black grabs on e4, typical endgames that arise from the exchange and minority structures, and critical modern tabiyas including ideas connected with the Berlin and Marshall so you are not surprised at the board. The emphasis is on plans: improving pieces, timing d4, and knowing when to attack the king. Ideal if you play 1.e4 and want a serious, respectable weapon that scales from club level upward.',
      image: {
        name: '1993581701685140.png',
        path: '/images/1993581701685140.png',
      },
      preview: {
        description:
          'Master the classic Spanish Opening. Closed plans, open tactics, endings, and critical tabiyas—four in-depth studies with five chapters each.',
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
      description:
        'Not every win comes from a single tactic; often the player who understands the pawn structure and piece placement slowly outplays the opponent. This course uses model games, structure-focused lessons, and prophylactic thinking so you ask better questions before you move: what does my opponent want, which piece is worst, and where should the fight happen. A closing capsule ties common plans together so you can reuse ideas across openings. The tone is practical rather than abstract, with positions chosen because they resemble what you see in rapid and classical games. Helpful for anyone who feels tactically sharp but loses the thread in quiet positions.',
      image: {
        name: '2248671712568775.png',
        path: '/images/2248671712568775.png',
      },
      preview: {
        description:
          'Understand the deeper meaning of chess moves. Model games, pawn structures, prophylaxis, and a strategic plans capsule—four modules, five chapters per study.',
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
      description:
        'Attacking the king is one of the most enjoyable parts of chess, but random sacrifices rarely work against prepared opponents. This course walks you through typical attacking patterns, real sacrifice examples with explanations of what the attacker gains, and how to keep initiative once you have committed. You also practice deciding when to keep pressing and when to cash in, so your attacks do not fizzle into a worse endgame. The level stays accessible for improving players who already know basic tactics but want a clearer attacking checklist. Expect emphasis on piece coordination, open lines, and king safety on both sides.',
      image: {
        name: '2316841716811370.png',
        path: '/images/2316841716811370.png',
      },
      preview: {
        description:
          'Learn how to launch unstoppable attacks. Patterns, sacrifices, initiative, and a practical attack workshop—four studies with five chapters each.',
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
      description:
        'This free course is for anyone starting out or returning after a long break. You will review how the pieces move, basic opening habits like development and king safety, simple checkmating patterns you must know by heart, and first tactical ideas such as forks and pins. A short drill module helps you practice typical club-level mistakes so you build good habits early. The lessons stay short and plain so you can finish a chapter in one sitting and play real games with more confidence. No prior tournament experience is required; curiosity and a willingness to practice are enough.',
      image: {
        name: '2414781716811215.png',
        path: '/images/2414781716811215.png',
      },
      preview: {
        description:
          'Get started with chess for FREE! Opening ideas, mates, tactics, and club starter drills—four beginner modules with five short chapters each.',
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
