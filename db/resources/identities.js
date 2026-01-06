import bcrypt from 'bcryptjs';

export default async () => {
  return [
    {
      email: 'alex.banzea@email.com',
      name: 'Alex Banzea',
      role: 'admin',
      __t: 'admin',
      password: bcrypt.hashSync('supersecretpassword'),
      active: true,
    },
    {
      email: 'grandmaster@email.com',
      name: 'Grandmaster Coach',
      role: 'admin',
      __t: 'admin',
      password: bcrypt.hashSync('supersecretpassword'),
      active: true,
    },
    {
      email: 'strategy@email.com',
      name: 'Strategy Expert',
      role: 'admin',
      __t: 'admin',
      password: bcrypt.hashSync('supersecretpassword'),
      active: true,
    },
  ];
};
