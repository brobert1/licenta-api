import bcrypt from 'bcryptjs';

export default async () => {
  return [
    {
      email: 'michael@email.com',
      name: 'Michael Scott',
      role: 'admin',
      __t: 'admin',
      password: bcrypt.hashSync('supersecretpassword'),
      active: true,
    },
    {
      email: 'jim@email.com',
      name: 'Jim Halpert',
      role: 'client',
      __t: 'client',
      password: bcrypt.hashSync('supersecretpassword'),
      active: true,
    },
    {
      email: 'pam@email.com',
      name: 'Pam Beesly',
      role: 'client',
      __t: 'client',
      password: bcrypt.hashSync('supersecretpassword'),
      active: true,
    },
    {
      email: 'tim@email.com',
      name: 'Tim Buchalka',
      role: 'client',
      __t: 'client',
      password: bcrypt.hashSync('supersecretpassword'),
      active: true,
    },
    {
      email: 'alexander@email.com',
      name: 'Alexander Mahone',
      role: 'client',
      __t: 'client',
      password: bcrypt.hashSync('supersecretpassword'),
      active: true,
    },
    {
      email: 'gregory@email.com',
      name: 'Gregory House',
      role: 'client',
      __t: 'client',
      password: bcrypt.hashSync('supersecretpassword'),
      active: true,
    },
  ];
};
