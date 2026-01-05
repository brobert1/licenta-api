import { error } from '@functions';
import { Client, Course } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  const { id } = req.params;
  if (!id || !me) {
    throw error(404, 'Missing required params');
  }

  const [course, user] = await Promise.all([
    Course.findById(id).select('name active').lean(),
    Client.findById(me).select('enrolledCourses').lean(),
  ]);

  if (!course) {
    throw error(404, 'Course not found');
  }
  if (!course.active) {
    throw error(400, 'Cannot enroll in an unpublished course');
  }

  // Check if user is already enrolled
  const isAlreadyEnrolled = user.enrolledCourses?.some(
    (enrolledCourse) => enrolledCourse._id.toString() === id
  );

  if (isAlreadyEnrolled) {
    throw error(400, 'User is already enrolled in this course');
  }

  // Add course to user's enrolledCourses
  const updatedUser = await Client.findByIdAndUpdate(
    me,
    {
      $push: {
        enrolledCourses: {
          _id: course._id,
          name: course.name,
        },
      },
    },
    {
      select: 'enrolledCourses',
    }
  ).lean();

  return res.status(200).json({
    message: 'Successfully enrolled in course',
    enrolledCourses: updatedUser.enrolledCourses,
  });
};
