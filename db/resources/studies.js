import { Admin, Client, Course } from '@models';
import { sample } from 'lodash';

export default async () => {
  const client = await Client.findOne({ email: 'jim@email.com' }).lean();
  const admin = await Admin.findOne({ email: 'michael@email.com' }).lean();
  const courses = await Course.find().lean();

  // Find the Jobava London courses
  const jobavaCourses = courses.filter((course) => course.name.startsWith('Jobava'));
  const randomCourses = courses.filter((course) => !course.name.startsWith('Jobava'));

  return [
    // User-created studies (client studies, not attached to any course)
    {
      author: client,
      name: 'Brilliant moves tactics',
      icon: 'fa-chess',
      color: '#7a6973',
      chapters: [],
      tags: [],
      active: true,
    },
    {
      author: client,
      name: 'Basic Endgames',
      icon: 'fa-chess-knight',
      color: '#f10386',
      chapters: [],
      tags: [],
      active: true,
    },
    {
      author: client,
      name: 'Basic Tactics',
      icon: 'fa-chess-bishop',
      color: '#1c02a0',
      chapters: [],
      tags: [],
      active: true,
    },

    // Course-related studies (admin studies, attached to courses)
    {
      author: admin,
      course: jobavaCourses[0],
      name: 'Jobava London: essential theory',
      icon: 'fa-chess-king',
      color: '#2c3e50',
      chapters: [],
      tags: [],
      active: true,
    },
    {
      author: admin,
      course: jobavaCourses[1],
      name: 'Jobava London: intermediate theory',
      icon: 'fa-chess-queen',
      color: '#e74c3c',
      chapters: [],
      tags: [],
      active: true,
    },
    {
      author: admin,
      course: sample(randomCourses),
      name: "Caro-Kann's Early Games",
      icon: 'fa-chess-rook',
      color: '#3498db',
      chapters: [],
      tags: [],
      active: true,
    },
    {
      author: admin,
      course: sample(randomCourses),
      name: "Silman's Complete Endgame",
      icon: 'fa-chess-knight',
      color: '#9b59b6',
      chapters: [],
      tags: [],
      active: true,
    },
    {
      author: admin,
      course: sample(randomCourses),
      name: 'Ambush 1. e4',
      icon: 'fa-chess-bishop',
      color: '#f39c12',
      chapters: [],
      tags: [],
      active: true,
    },
    {
      author: admin,
      course: sample(randomCourses),
      name: "Caro-Kann's Early Games Free",
      icon: 'fa-chess-pawn',
      color: '#1abc9c',
      chapters: [],
      tags: [],
      active: true,
    },
  ];
};
