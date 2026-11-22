const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");

const allowedStatuses = ["present", "absent", "late", "leave"];
const allowedUserTypes = ["student", "employee"];

const getActorId = (user) =>
  user && (user.userId || user._id || user.id || user.studentId);

const isValidObjectId = (value) => mongoose.isValidObjectId(value);

const parseDate = (value) => {
  if (!value) return null;

  // Date-only input ko local calendar date samjho, UTC conversion nahi.
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const parseOptionalDateTime = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return { value: undefined };
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { error: `${fieldName} must be a valid date/time.` };
  }
  return { value: parsed };
};

const getDateFilter = (query) => {
  const filter = {};
  if (query.date) {
    const date = parseDate(query.date);
    if (!date) return { error: "date must be a valid YYYY-MM-DD date." };
    filter.$gte = date;
    filter.$lt = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  }

  if (query.from) {
    const from = parseDate(query.from);
    if (!from) return { error: "from must be a valid YYYY-MM-DD date." };
    filter.$gte = from;
  }
  if (query.to) {
    const to = parseDate(query.to);
    if (!to) return { error: "to must be a valid YYYY-MM-DD date." };
    filter.$lt = new Date(to.getTime() + 24 * 60 * 60 * 1000);
  }
  if (query.from && query.to && filter.$gte >= filter.$lt) {
    return { error: "from must be on or before to." };
  }
  return Object.keys(filter).length ? { value: filter } : { value: undefined };
};

const buildFilters = (query) => {
  const filters = {};
  const dateFilter = getDateFilter(query);
  if (dateFilter.error) return dateFilter;
  if (dateFilter.value) filters.date = dateFilter.value;

  if (query.userType) {
    if (!allowedUserTypes.includes(query.userType)) {
      return { error: "userType must be student or employee." };
    }
    filters.userType = query.userType;
  }
  if (query.status) {
    if (!allowedStatuses.includes(query.status)) {
      return { error: "status is invalid." };
    }
    filters.status = query.status;
  }
  return { value: filters };
};

const sendError = (res, error, fallbackMessage) => {
  if (error && error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Is user ki is date ki attendance pehle se maujood hai.",
    });
  }
  if (
    error &&
    (error.name === "ValidationError" || error.name === "CastError")
  ) {
    return res.status(400).json({ success: false, message: error.message });
  }
  console.error(fallbackMessage, error);
  return res.status(500).json({ success: false, message: fallbackMessage });
};

const validateMarkPayload = (payload) => {
  if (!payload || !isValidObjectId(payload.user)) {
    return "Valid user ID dena zaroori hai.";
  }
  if (!allowedUserTypes.includes(payload.userType)) {
    return "userType student ya employee hona chahiye.";
  }
  if (!allowedStatuses.includes(payload.status)) {
    return "status present, absent, late, ya leave hona chahiye.";
  }
  return null;
};

const createAttendanceData = (payload, actorId, date) => ({
  user: payload.user,
  userType: payload.userType,
  date,
  status: payload.status,
  checkIn: payload.checkIn,
  checkOut: payload.checkOut,
  markedBy: actorId,
  remarks: payload.remarks,
});

const markAttendance = async (req, res) => {
  try {
    const errorMessage = validateMarkPayload(req.body);
    if (errorMessage) {
      return res.status(400).json({ success: false, message: errorMessage });
    }
    const actorId = getActorId(req.user);
    if (!isValidObjectId(actorId)) {
      return res.status(401).json({ success: false, message: "Invalid session." });
    }

    const date = req.body.date ? parseDate(req.body.date) : parseDate(new Date());
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date must be a valid YYYY-MM-DD date.",
      });
    }
    const checkIn = parseOptionalDateTime(req.body.checkIn, "checkIn");
    const checkOut = parseOptionalDateTime(req.body.checkOut, "checkOut");
    if (checkIn.error || checkOut.error) {
      return res.status(400).json({
        success: false,
        message: checkIn.error || checkOut.error,
      });
    }

    const existing = await Attendance.findOne({ user: req.body.user, date });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Is user ki is date ki attendance pehle se maujood hai.",
      });
    }

    const attendance = await Attendance.create(
      createAttendanceData(
        { ...req.body, checkIn: checkIn.value, checkOut: checkOut.value },
        actorId,
        date
      )
    );
    return res.status(201).json({
      success: true,
      message: "Attendance mark ho gayi.",
      data: attendance,
    });
  } catch (error) {
    return sendError(res, error, "Attendance mark nahi ho saki.");
  }
};

const markBulkAttendance = async (req, res) => {
  try {
    const { date: requestedDate, records } = req.body || {};
    const actorId = getActorId(req.user);
    if (!isValidObjectId(actorId)) {
      return res.status(401).json({ success: false, message: "Invalid session." });
    }
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "records mein kam-se-kam ek attendance record dena zaroori hai.",
      });
    }
    const date = requestedDate ? parseDate(requestedDate) : parseDate(new Date());
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date must be a valid YYYY-MM-DD date.",
      });
    }

    const seenUsers = new Set();
    const documents = [];
    for (const record of records) {
      const errorMessage = validateMarkPayload(record);
      if (errorMessage) {
        return res.status(400).json({ success: false, message: errorMessage });
      }
      const userId = String(record.user);
      if (seenUsers.has(userId)) {
        return res.status(400).json({
          success: false,
          message: "Ek bulk request mein user ID duplicate nahi ho sakti.",
        });
      }
      seenUsers.add(userId);
      const checkIn = parseOptionalDateTime(record.checkIn, "checkIn");
      const checkOut = parseOptionalDateTime(record.checkOut, "checkOut");
      if (checkIn.error || checkOut.error) {
        return res.status(400).json({
          success: false,
          message: checkIn.error || checkOut.error,
        });
      }
      documents.push(
        createAttendanceData(
          { ...record, checkIn: checkIn.value, checkOut: checkOut.value },
          actorId,
          date
        )
      );
    }

    const existing = await Attendance.find({
      date,
      user: { $in: records.map((record) => record.user) },
    }).select("user");
    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "Kuch users ki attendance is date par pehle se maujood hai.",
        duplicates: existing.map((entry) => String(entry.user)),
      });
    }

    const saved = await Attendance.insertMany(documents);
    return res.status(201).json({
      success: true,
      message: "Bulk attendance mark ho gayi.",
      count: saved.length,
      data: saved,
    });
  } catch (error) {
    return sendError(res, error, "Bulk attendance mark nahi ho saki.");
  }
};

const checkIn = async (req, res) => {
  try {
    const userId = getActorId(req.user);
    if (!isValidObjectId(userId)) {
      return res.status(401).json({ success: false, message: "Invalid session." });
    }
    const date = parseDate(new Date());
    const existing = await Attendance.findOne({ user: userId, date });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Aaj ki attendance pehle se maujood hai.",
      });
    }
    const now = new Date();
    const attendance = await Attendance.create({
      user: userId,
      userType: "employee",
      date,
      status: "present",
      checkIn: now,
      markedBy: userId,
    });
    return res.status(201).json({
      success: true,
      message: "Check-in record ho gaya.",
      data: attendance,
    });
  } catch (error) {
    return sendError(res, error, "Check-in record nahi ho saka.");
  }
};

const checkOut = async (req, res) => {
  try {
    const userId = getActorId(req.user);
    if (!isValidObjectId(userId)) {
      return res.status(401).json({ success: false, message: "Invalid session." });
    }
    const date = parseDate(new Date());
    const attendance = await Attendance.findOne({ user: userId, date });
    if (!attendance || !attendance.checkIn) {
      return res.status(404).json({
        success: false,
        message: "Aaj ka check-in record nahi mila.",
      });
    }
    if (attendance.checkOut) {
      return res.status(409).json({
        success: false,
        message: "Aaj ka check-out pehle hi record ho chuka hai.",
      });
    }
    attendance.checkOut = new Date();
    await attendance.save();
    return res.status(200).json({
      success: true,
      message: "Check-out record ho gaya.",
      data: attendance,
    });
  } catch (error) {
    return sendError(res, error, "Check-out record nahi ho saka.");
  }
};

const getAttendance = async (req, res) => {
  try {
    const filterResult = buildFilters(req.query);
    if (filterResult.error) {
      return res.status(400).json({ success: false, message: filterResult.error });
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "page aur limit positive integers hone chahiye.",
      });
    }
    const safeLimit = Math.min(limit, 100);
    const [data, total] = await Promise.all([
      Attendance.find(filterResult.value)
        .populate("user", "name email")
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * safeLimit)
        .limit(safeLimit),
      Attendance.countDocuments(filterResult.value),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit),
      },
      data,
    });
  } catch (error) {
    return sendError(res, error, "Attendance fetch nahi ho saki.");
  }
};

const getUserAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    if (
      String(getActorId(req.user)) !== String(userId) &&
      (req.user.role || req.user.emp_role) !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const filterResult = buildFilters(req.query);
    if (filterResult.error) {
      return res.status(400).json({ success: false, message: filterResult.error });
    }
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    if (!Number.isInteger(page) || !Number.isInteger(limit)) {
      return res.status(400).json({
        success: false,
        message: "page aur limit positive integers hone chahiye.",
      });
    }
    const filters = { ...filterResult.value, user: userId };
    const [data, total] = await Promise.all([
      Attendance.find(filters)
        .populate("user", "name email")
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Attendance.countDocuments(filters),
    ]);
    return res.status(200).json({
      success: true,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      data,
    });
  } catch (error) {
    return sendError(res, error, "User attendance fetch nahi ho saki.");
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const filterResult = buildFilters(req.query);
    if (filterResult.error) {
      return res.status(400).json({ success: false, message: filterResult.error });
    }
    const [total, present, absent, late, leave] = await Promise.all(
      ["total", ...allowedStatuses].map((status) =>
        status === "total"
          ? Attendance.countDocuments(filterResult.value)
          : Attendance.countDocuments({
              ...filterResult.value,
              status,
            })
      )
    );
    return res.status(200).json({
      success: true,
      data: {
        total,
        present,
        absent,
        late,
        leave,
        presentPercentage: total ? Number(((present / total) * 100).toFixed(2)) : 0,
      },
    });
  } catch (error) {
    return sendError(res, error, "Attendance summary fetch nahi ho saki.");
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid attendance ID." });
    }
    const allowedFields = [
      "user",
      "userType",
      "date",
      "status",
      "checkIn",
      "checkOut",
      "remarks",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: "Update ke liye kam-se-kam ek valid field dena zaroori hai.",
      });
    }
    if (updates.user && !isValidObjectId(updates.user)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    if (
      updates.userType &&
      !allowedUserTypes.includes(updates.userType)
    ) {
      return res.status(400).json({ success: false, message: "Invalid userType." });
    }
    if (updates.status && !allowedStatuses.includes(updates.status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }
    if (updates.date !== undefined) {
      updates.date = parseDate(updates.date);
      if (!updates.date) {
        return res.status(400).json({
          success: false,
          message: "date must be a valid YYYY-MM-DD date.",
        });
      }
    }
    for (const field of ["checkIn", "checkOut"]) {
      if (updates[field] !== undefined) {
        const parsed = parseOptionalDateTime(updates[field], field);
        if (parsed.error) {
          return res.status(400).json({ success: false, message: parsed.error });
        }
        updates[field] = parsed.value;
      }
    }

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("user", "name email");
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance nahi mili." });
    }
    return res.status(200).json({
      success: true,
      message: "Attendance update ho gayi.",
      data: attendance,
    });
  } catch (error) {
    return sendError(res, error, "Attendance update nahi ho saki.");
  }
};

const deleteAttendance = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid attendance ID." });
    }
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance nahi mili." });
    }
    return res.status(200).json({
      success: true,
      message: "Attendance delete ho gayi.",
      data: attendance,
    });
  } catch (error) {
    return sendError(res, error, "Attendance delete nahi ho saki.");
  }
};

module.exports = {
  markAttendance,
  markBulkAttendance,
  checkIn,
  checkOut,
  getAttendance,
  getUserAttendance,
  getAttendanceSummary,
  updateAttendance,
  deleteAttendance,
};
