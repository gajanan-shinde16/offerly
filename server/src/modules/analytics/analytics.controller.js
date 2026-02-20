import User from "../../models/User.model.js";
import Application from "../../models/Application.model.js";
import mongoose from "mongoose";

   //STUDENT: SUMMARY
export const getMySummary = async (req, res, next) => {
  try {
    const stats = await Application.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.userId)
        }
      },
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

    res.json({
      success: true,
      data: summary
    });
  } catch (err) {
    next(err);
  }
};

// STUDENT: COMPANY-WISE STATS
export const companyWiseStats = async (req, res, next) => {
  try {
    const stats = await Application.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.userId)
        }
      },
      {
        $group: {
          _id: "$company",
          total: { $sum: 1 },
          offers: {
            $sum: { $cond: [{ $eq: ["$status", "Offer"] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "In-Progress"] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

// STUDENT: ROUND DROP-OFF
export const roundDropOff = async (req, res, next) => {
  try {
    const data = await Application.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.userId),
          status: "Rejected"
        }
      },
      {
        $group: {
          _id: "$currentRound",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

//ADMIN: GLOBAL STATS
export const getAdminStats = async (req, res, next) => {
  try {
    // 1️ Total users
    const totalUsers = await User.countDocuments();

    // 2️ Total applications
    const totalApplications = await Application.countDocuments();

    // 3️ Applications by status
    const statusStats = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const applicationsByStatus = {
      "In-Progress": 0,
      Offer: 0,
      Rejected: 0
    };

    statusStats.forEach(item => {
      applicationsByStatus[item._id] = item.count;
    });

    // 4️ Top companies
    const topCompanies = await Application.aggregate([
      {
        $group: {
          _id: "$company",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalApplications,
        applicationsByStatus,
        topCompanies
      }
    });
  } catch (err) {
    next(err);
  }
};
