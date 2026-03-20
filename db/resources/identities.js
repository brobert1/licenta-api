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
    },
    {
      email: 'grandmaster@email.com',
      name: 'Grandmaster Coach',
      role: 'professor',
      __t: 'professor',
      password,
      active: true,
    },
    {
      email: 'strategy@email.com',
      name: 'Strategy Expert',
      role: 'professor',
      __t: 'professor',
      password,
      active: true,
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
