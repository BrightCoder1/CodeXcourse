import './CourseAttendanceTimeline.css';

const STATUS_LABELS = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  leave: 'Leave',
  in_progress: 'Checked in',
};

const CourseAttendanceTimeline = ({ courseName, records }) => (
  <div
    className="course-attendance-timeline"
    role="list"
    aria-label={`${courseName} lecture attendance`}
  >
    {records.length ? records.map((record, index) => {
      const label = STATUS_LABELS[record.status] || 'Not marked';
      return (
        <span
          key={`${record.date}-${index}`}
          className={`course-attendance-segment ${STATUS_LABELS[record.status] ? record.status : 'unmarked'}`}
          role="listitem"
          title={`Lecture ${index + 1} · ${record.date ? new Date(record.date).toLocaleDateString() : ''} · ${label}`}
          aria-label={`Lecture ${index + 1}: ${label}`}
        />
      );
    }) : <span className="course-attendance-segment unmarked" role="listitem" aria-label="No attendance recorded" />}
  </div>
);

export default CourseAttendanceTimeline;
