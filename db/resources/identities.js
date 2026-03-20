import bcrypt from 'bcryptjs';

const password = bcrypt.hashSync('supersecretpassword');

export default async () => {
  return [
    // Professors
    {
      email: 'alex.banzea@email.com',
      name: 'Alex Banzea',
      role: 'professor',
      __t: 'professor',
      password,
      active: true,
      image: {
        name: 'alex-banzea.jpg',
        path: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
    },
    {
      email: 'grandmaster@email.com',
      name: 'Grandmaster Coach',
      role: 'professor',
      __t: 'professor',
      password,
      active: true,
      image: {
        name: 'grandmaster-coach.jpg',
        path: 'https://randomuser.me/api/portraits/men/54.jpg',
      },
    },
    {
      email: 'strategy@email.com',
      name: 'Strategy Expert',
      role: 'professor',
      __t: 'professor',
      password,
      active: true,
      image: {
        name: 'strategy-expert.jpg',
        path: 'https://randomuser.me/api/portraits/men/76.jpg',
      },
    },
    // Admin
    {
      email: 'admin@rooknlearn.com',
      name: 'Platform Admin',
      role: 'admin',
      __t: 'admin',
      password,
      active: true,
    },
    // Clients
    {
      email: 'student@email.com',
      name: 'Alex Student',
      role: 'client',
      __t: 'client',
      password,
      active: true,
    },
    {
      email: 'chess.fan@email.com',
      name: 'Maria Chess Fan',
      role: 'client',
      __t: 'client',
      password,
      active: true,
    },
    {
      email: 'beginner@email.com',
      name: 'John Beginner',
      role: 'client',
      __t: 'client',
      password,
      active: true,
    },
  ];
};
