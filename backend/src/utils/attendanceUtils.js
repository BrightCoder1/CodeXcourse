const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const todayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const parseDate = (value, { allowFuture = false } = {}) => {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return null;
  }
  if (!allowFuture && value > todayString()) return null;
  return date;
};

const parseRange = (query) => {
  const range = {};
  if (query.from) {
    const from = parseDate(query.from, { allowFuture: true });
    if (!from) return { error: "Start date must be a valid YYYY-MM-DD date." };
    range.$gte = from;
  }
  if (query.to) {
    const to = parseDate(query.to, { allowFuture: true });
    if (!to) return { error: "End date must be a valid YYYY-MM-DD date." };
    range.$lt = new Date(to.getTime() + 24 * 60 * 60 * 1000);
  }
  if (range.$gte && range.$lt && range.$gte >= range.$lt) {
    return { error: "Start date must be on or before end date." };
  }
  return { range };
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const exactTextRegex = (value) => new RegExp(`^${escapeRegex(value)}$`, "i");
const flexibleCourseNameRegex = (value) => {
  const words = value.trim().split(/[\s_-]+/).filter(Boolean).map(escapeRegex);
  return new RegExp(`^${words.join("[-_\\s]+")}$`, "i");
};
const validId = (id) => typeof id === "string" && OBJECT_ID_PATTERN.test(id);
const validNameFilter = (value) =>
  value === undefined || (typeof value === "string" && value.trim().length <= 100);

const legacyCourseMatchers = (course) => [
  course.courseName ? flexibleCourseNameRegex(course.courseName) : null,
  course.courseCode ? exactTextRegex(course.courseCode) : null,
].filter(Boolean);

const matchesLegacyCourseEnrollment = (studentCourse, course) =>
  typeof studentCourse === "string" &&
  legacyCourseMatchers(course).some((matcher) => matcher.test(studentCourse.trim()));

const courseStudentQuery = (course) => {
  const query = [];
  if (course._id) query.push({ course_ids: course._id });
  const legacyMatchers = legacyCourseMatchers(course);
  if (legacyMatchers.length) {
    query.push({
      course_ids: { $exists: false },
      course: { $in: legacyMatchers },
    });
  }
  return query.length === 1 ? query[0] : query.length ? { $or: query } : { _id: null };
};

const enrolledCourseQuery = (courseName) => {
  if (typeof courseName !== "string" || !courseName.trim()) return { _id: null };
  const value = courseName.trim();
  const query = {
    $or: [
      { courseName: flexibleCourseNameRegex(value) },
      { courseCode: exactTextRegex(value) },
    ],
  };
  if (validId(value)) query.$or.push({ _id: value });
  return query;
};

module.exports = {
  courseStudentQuery,
  enrolledCourseQuery,
  matchesLegacyCourseEnrollment,
  parseDate,
  parseRange,
  todayString,
  validId,
  validNameFilter,
};
