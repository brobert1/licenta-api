import { Client, Course } from '@models';
import { sample } from 'lodash';

export default async () => {
  const clients = await Client.find().lean();
  const courses = await Course.find().lean();

  return [
    {
      name: 'PERFECT COURSE',
      review: 'Good content and well-structured modules. Learned a lot.',
      rating: 4,
      approved: true,
      user: sample(clients),
      course: sample(courses),
    },
    {
      name: 'LOVE EVERY BIT OF IT',
      review: 'Engaging material and helpful resources.',
      rating: 4,
      approved: true,
      user: sample(clients),
      course: sample(courses),
    },
    {
      name: 'COULD HAVE BEEN BETTER',
      review: 'Informative but could use more real-world examples.',
      rating: 3,
      approved: false,
      user: sample(clients),
      course: sample(courses),
    },
    {
      name: 'DECENT',
      review: 'Good overall, but some sections were lacking depth.',
      rating: 3,
      approved: false,
      user: sample(clients),
      course: sample(courses),
    },
    {
      name: 'BEST ONE IN YEARS',
      review: 'Excellent course with comprehensive coverage of topics.',
      rating: 5,
      approved: true,
      user: sample(clients),
      course: sample(courses),
    },
    {
      name: 'COULD NOT ASK FOR MORE',
      review: 'The instructors were top-notch and very knowledgeable.',
      rating: 5,
      approved: true,
      user: sample(clients),
      course: sample(courses),
    },
    {
      name: 'NICE TEACHER',
      review: 'Good overall, but the pacing was a bit slow for my liking.',
      rating: 3,
      approved: false,
      user: sample(clients),
      course: sample(courses),
    },
    {
      name: 'LOVING IT PARTIALLY',
      review: 'Decent course, but could benefit from more interactive elements.',
      rating: 3,
      approved: false,
      user: sample(clients),
      course: sample(courses),
    },
  ];
};
