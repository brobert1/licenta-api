import getFileContent from '@db/functions/get-file-content';

export default async () => {
  return [
    // Fundamentals paid book
    {
      name: 'Fundamentals full course',
      description: getFileContent('../descriptions/fundamentals-full.md'),
      image: {
        name: 'alex-banzea-fundamentals-full.jpg',
        path: '/images/alex-banzea-fundamentals-full.jpg',
      },
      preview: {
        description: `Learn the essential building blocks of chess! This course covers the basics: piece movement,
          fundamental tactics (like forks and pins), checkmating patterns, and simple opening principles.
          Perfect for beginners, you'll gain a solid foundation to start playing and enjoying the game.`,
        image: {
          name: 'alex-banzea-fundamentals-full.jpg',
          path: '/images/alex-banzea-fundamentals-full.jpg',
        },
      },
      difficulty: 'beginner',
      tags: ['Fundamentals', 'Learn Chess'],
      author: {
        name: 'Alex Banzea',
        image: '/images/alex-banzea-profile.jpg',
        title: 'IM',
      },
      isPaid: true,
      price: 10,
      currency: 'EUR',
      hasMoveTrainer: true,
    },
    // Fundamentals free course
    {
      name: 'Fundamentals sample course',
      description: getFileContent('../descriptions/fundamentals-free.md'),
      image: {
        name: 'alex-banzea-fundamentals-free.jpg',
        path: '/images/alex-banzea-fundamentals-free.jpg',
      },
      preview: {
        description: `Get started with chess for FREE! This introductory course covers the essentials: piece movement,
          basic tactics, checkmating,and opening principles. Learn the foundations and start playing today!`,
        image: {
          name: 'alex-banzea-fundamentals-free.jpg',
          path: '/images/alex-banzea-fundamentals-free.jpg',
        },
      },
      difficulty: 'beginner',
      tags: ['Fundamentals', 'Learn Chess'],
      author: {
        name: 'Alex Banzea',
        image: '/images/alex-banzea-profile.jpg',
        title: 'IM',
      },
      isFree: true,
      hasMoveTrainer: true,
    },
    // Jobava free course
    {
      name: 'Jobava free course',
      description: getFileContent('../descriptions/jobava-beginner.md'),
      image: {
        name: 'alex-banzea-jobava-london-1.jpg',
        path: '/images/alex-banzea-jobava-london-1.jpg',
      },
      preview: {
        description: `The Jobava London System offers an aggressive twist on the classic London approach,
          surprising opponents with quick development and sharp tactical potential`,
        image: {
          name: 'alex-banzea-jobava-london-1.jpg',
          path: '/images/alex-banzea-jobava-london-1.jpg',
        },
      },
      difficulty: 'beginner',
      tags: ['Jobava London', 'Opening', 'Tactics'],
      author: {
        name: 'Alex Banzea',
        image: '/images/alex-banzea-profile.jpg',
        title: 'IM',
      },
      isFree: true,
    },
    // Jobava coming soon course
    {
      name: 'Jobava intermediate course',
      description: getFileContent('../descriptions/jobava-medium.md'),
      image: {
        name: 'alex-banzea-jobava-london-1.jpg',
        path: '/images/alex-banzea-jobava-london-1.jpg',
      },
      preview: {
        description: `Building upon the foundations of the Jobava London System, this intermediate course
          delves deeper into the strategic nuances and tactical complexities of this dynamic opening.
          Go beyond the basic setups and explore advanced pawn structures, piece play, and long-term planning.`,
        image: {
          name: 'alex-banzea-jobava-london-1.jpg',
          path: '/images/alex-banzea-jobava-london-1.jpg',
        },
      },
      difficulty: 'intermediate',
      tags: ['Jobava London', 'Opening', 'Tactics'],
      author: {
        name: 'Alex Banzea',
        image: '/images/alex-banzea-profile.jpg',
        title: 'IM',
      },
      active: false,
      isPaid: true,
      price: 15,
      currency: 'EUR',
    },
  ];
};
