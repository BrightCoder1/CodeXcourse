export const buildAssignedCourses = (dashboard, history) => {
  if (!Array.isArray(dashboard?.courses) || !Array.isArray(history?.courseAttendance)) {
    throw new Error('Course or attendance information was not returned by the server.');
  }

  const attendanceByCourse = new Map();
  history.courseAttendance.forEach((record) => {
    const courseId = record.course_id?._id;
    if (!courseId) return;

    const key = String(courseId);
    const attendanceRecords = attendanceByCourse.get(key) || [];
    attendanceRecords.push({
      date: record.date,
      status: record.status,
      checkIn: record.check_in,
      checkOut: record.check_out,
      totalMinutes: Number(record.total_minutes) || 0,
    });
    attendanceByCourse.set(key, attendanceRecords);
  });

  return dashboard.courses.map((course) => {
    const attendanceRecords = (attendanceByCourse.get(String(course._id)) || [])
      .sort((left, right) => new Date(left.date) - new Date(right.date));
    const lastAttendance = attendanceRecords[attendanceRecords.length - 1];
    return {
      id: String(course._id),
      name: course.courseName,
      code: course.courseCode,
      instructor: course.teacherName || course.instructorName || 'Course instructor',
      image: course.courseImageUrl,
      lectures: attendanceRecords.length,
      totalMinutes: attendanceRecords.reduce((total, record) => total + record.totalMinutes, 0),
      lastAttendance: lastAttendance?.date || '',
      attendanceRecords,
    };
  });
};
