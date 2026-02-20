import Application from "../../models/Application.model.js";
import mongoose from "mongoose";

/* ---------- HELPER ---------- */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ============================
   CREATE APPLICATION (STUDENT)
============================ */
export const createApplication = async (req, res, next) => {
  try {
    const application = await Application.create({
      ...req.body,
      userId: req.user.userId
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (err) {
    next(err);
  }
};

/* ============================
   GET MY APPLICATIONS (PAGINATED + SEARCH)
============================ */
export const getMyApplications = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const { status, q } = req.query;

    const filter = {
      userId: req.user.userId
    };

    if (status) {
      filter.status = status;
    }

    if (q) {
      filter.$or = [
        { company: { $regex: q, $options: "i" } },
        { role: { $regex: q, $options: "i" } },
        { currentRound: { $regex: q, $options: "i" } }
      ];
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

/* ============================
   GET SINGLE APPLICATION
============================ */
export const getApplicationById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID"
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (application.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (err) {
    next(err);
  }
};

/* ============================
   UPDATE STATUS (INLINE UPDATE)
============================ */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, currentRound } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID"
      });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (application.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to modify this application"
      });
    }

    if (application.status !== "In-Progress") {
      return res.status(400).json({
        success: false,
        message: "Cannot update a completed application"
      });
    }

    application.status = status;

    // ✅ FIX: do not overwrite with undefined / empty unintentionally
    if (currentRound !== undefined) {
      application.currentRound = currentRound;
    }

    await application.save();

    res.json({
      success: true,
      data: application
    });
  } catch (err) {
    next(err);
  }
};

/* ============================
   UPDATE FULL APPLICATION
============================ */
export const updateApplication = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID"
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (application.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to edit this application"
      });
    }

    if (application.status !== "In-Progress") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit a completed application"
      });
    }

    const {
      company,
      role,
      package: pkg,
      rounds,
      currentRound,
      status
    } = req.body;

    application.company = company;
    application.role = role;
    application.package = pkg;
    application.rounds = rounds;
    application.status = status;

    // ✅ FIX: protect existing value
    if (currentRound !== undefined) {
      application.currentRound = currentRound;
    }

    await application.save();

    res.json({
      success: true,
      data: application
    });
  } catch (err) {
    next(err);
  }
};

/* ============================
   DELETE APPLICATION
============================ */
export const deleteApplication = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID"
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (application.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete this application"
      });
    }

    if (application.status !== "In-Progress") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a completed application"
      });
    }

    await application.deleteOne();

    res.json({
      success: true,
      message: "Application deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};

/* ============================
   STUDENT DASHBOARD SUMMARY
============================ */
export const getStudentDashboard = async (req, res, next) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

    const stats = await Application.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      total: 0,
      "In-Progress": 0,
      Offer: 0,
      Rejected: 0
    };

    stats.forEach(item => {
      summary[item._id] = item.count;
      summary.total += item.count;
    });

    const recent = await Application.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      summary,
      recent
    });
  } catch (err) {
    next(err);
  }
};

/* ============================
   ADMIN: GET ALL APPLICATIONS
============================ */
export const getAllApplications = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const { status, q } = req.query;
    const matchStage = {};

    if (status) {
      matchStage.status = status;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      ...(q
        ? [
            {
              $match: {
                $or: [
                  { company: { $regex: q, $options: "i" } },
                  { role: { $regex: q, $options: "i" } },
                  { "user.email": { $regex: q, $options: "i" } }
                ]
              }
            }
          ]
        : []),
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }]
        }
      }
    ];

    const result = await Application.aggregate(pipeline);
    const applications = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    res.json({
      success: true,
      data: applications.map(app => ({
        ...app,
        userId: {
          _id: app.user._id,
          email: app.user.email
        }
      })),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

/* ============================
   ADMIN: GET APPLICATION DETAILS
============================ */
export const getAdminApplicationById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID"
      });
    }

    const application = await Application.findById(req.params.id)
      .populate("userId", "name email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (err) {
    next(err);
  }
};
