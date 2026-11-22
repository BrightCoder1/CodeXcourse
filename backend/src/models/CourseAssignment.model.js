const mongoose = require("mongoose");

const courseAssignmentSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { collection: "course_assignments", timestamps: false }
);

courseAssignmentSchema.index(
  { teacher_id: 1, course_id: 1 },
  { unique: true }
);

module.exports = mongoose.model("CourseAssignment", courseAssignmentSchema);
