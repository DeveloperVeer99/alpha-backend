const Signal = require("../models/Signal");
const User = require("../models/User");

// Create new signal (Analyst & Super Admin only)
exports.createSignal = async (req, res) => {
  try {
    const { title, description, symbol, type, entryPrice, stopLoss, takeProfit, timeframe, leverage, riskLevel } = req.body;

    const signal = await Signal.create({
      title,
      description,
      symbol,
      type,
      entryPrice,
      stopLoss,
      takeProfit,
      timeframe,
      leverage,
      riskLevel,
      postedBy: req.user._id,
    });

    await signal.populate("postedBy", "name username");

    res.status(201).json({
      success: true,
      message: "Signal created successfully",
      data: signal,
    });
  } catch (error) {
    console.error("Create signal error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create signal",
    });
  }
};

// Get all signals (with filters)
exports.getAllSignals = async (req, res) => {
  try {
    const { status, symbol, type, postedBy } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (symbol) filter.symbol = symbol.toUpperCase();
    if (type) filter.type = type;
    if (postedBy) filter.postedBy = postedBy;

    const signals = await Signal.find(filter)
      .populate("postedBy", "name username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: signals.length,
      data: signals,
    });
  } catch (error) {
    console.error("Get all signals error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch signals",
    });
  }
};

// Get single signal by ID
exports.getSignalById = async (req, res) => {
  try {
    const { signalId } = req.params;

    const signal = await Signal.findById(signalId).populate("postedBy", "name username");

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "Signal not found",
      });
    }

    // Increment views
    signal.views += 1;
    await signal.save();

    res.status(200).json({
      success: true,
      data: signal,
    });
  } catch (error) {
    console.error("Get signal error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch signal",
    });
  }
};

// Update signal (Analyst & Super Admin only)
exports.updateSignal = async (req, res) => {
  try {
    const { signalId } = req.params;
    const updates = req.body;

    const signal = await Signal.findById(signalId);

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "Signal not found",
      });
    }

    // Check if user is the creator or super admin
    if (signal.postedBy.toString() !== req.user._id.toString() && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this signal",
      });
    }

    Object.keys(updates).forEach((key) => {
      signal[key] = updates[key];
    });

    await signal.save();
    await signal.populate("postedBy", "name username");

    res.status(200).json({
      success: true,
      message: "Signal updated successfully",
      data: signal,
    });
  } catch (error) {
    console.error("Update signal error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update signal",
    });
  }
};

// Close signal with results (Analyst & Super Admin only)
exports.closeSignal = async (req, res) => {
  try {
    const { signalId } = req.params;
    const { closePrice, outcome } = req.body;

    const signal = await Signal.findById(signalId);

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "Signal not found",
      });
    }

    // Check if user is the creator or super admin
    if (signal.postedBy.toString() !== req.user._id.toString() && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to close this signal",
      });
    }

    // Calculate profit/loss percentage
    let profitLoss = 0;
    if (signal.type === "BUY") {
      profitLoss = ((closePrice - signal.entryPrice) / signal.entryPrice) * 100;
    } else {
      profitLoss = ((signal.entryPrice - closePrice) / signal.entryPrice) * 100;
    }

    signal.status = "CLOSED";
    signal.closePrice = closePrice;
    signal.profitLoss = profitLoss;
    signal.outcome = outcome;

    await signal.save();
    await signal.populate("postedBy", "name username");

    res.status(200).json({
      success: true,
      message: "Signal closed successfully",
      data: signal,
    });
  } catch (error) {
    console.error("Close signal error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to close signal",
    });
  }
};

// Delete signal (Super Admin only)
exports.deleteSignal = async (req, res) => {
  try {
    const { signalId } = req.params;

    const signal = await Signal.findById(signalId);

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "Signal not found",
      });
    }

    await Signal.findByIdAndDelete(signalId);

    res.status(200).json({
      success: true,
      message: "Signal deleted successfully",
    });
  } catch (error) {
    console.error("Delete signal error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete signal",
    });
  }
};

// Like/Unlike signal
exports.toggleLike = async (req, res) => {
  try {
    const { signalId } = req.params;

    const signal = await Signal.findById(signalId);

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "Signal not found",
      });
    }

    const userIndex = signal.likes.indexOf(req.user._id);

    if (userIndex > -1) {
      // Unlike
      signal.likes.splice(userIndex, 1);
    } else {
      // Like
      signal.likes.push(req.user._id);
    }

    await signal.save();

    res.status(200).json({
      success: true,
      message: userIndex > -1 ? "Signal unliked" : "Signal liked",
      data: { likes: signal.likes.length },
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle like",
    });
  }
};

// Get signal analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalSignals = await Signal.countDocuments();
    const activeSignals = await Signal.countDocuments({ status: "ACTIVE" });
    const closedSignals = await Signal.countDocuments({ status: "CLOSED" });

    // Win rate calculation
    const winningSignals = await Signal.countDocuments({ status: "CLOSED", outcome: "WIN" });
    const winRate = closedSignals > 0 ? ((winningSignals / closedSignals) * 100).toFixed(2) : 0;

    // Average profit/loss
    const closedSignalsData = await Signal.find({ status: "CLOSED", profitLoss: { $exists: true } });
    const avgProfitLoss = closedSignalsData.length > 0
      ? (closedSignalsData.reduce((sum, signal) => sum + signal.profitLoss, 0) / closedSignalsData.length).toFixed(2)
      : 0;

    // Top performing analysts
    const topAnalysts = await Signal.aggregate([
      { $match: { status: "CLOSED", outcome: "WIN" } },
      { $group: { _id: "$postedBy", wins: { $sum: 1 } } },
      { $sort: { wins: -1 } },
      { $limit: 5 },
    ]);

    // Populate analyst details
    const populatedAnalysts = await User.populate(topAnalysts, { path: "_id", select: "name username" });

    // Signals by symbol
    const signalsBySymbol = await Signal.aggregate([
      { $group: { _id: "$symbol", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSignals,
        activeSignals,
        closedSignals,
        winRate: parseFloat(winRate),
        avgProfitLoss: parseFloat(avgProfitLoss),
        topAnalysts: populatedAnalysts.map(a => ({ analyst: a._id, wins: a.wins })),
        signalsBySymbol,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch analytics",
    });
  }
};

// Get analyst's own signals
exports.getMySignals = async (req, res) => {
  try {
    const signals = await Signal.find({ postedBy: req.user._id })
      .populate("postedBy", "name username")
      .sort({ createdAt: -1 });

    const totalSignals = signals.length;
    const activeSignals = signals.filter(s => s.status === "ACTIVE").length;
    const closedSignals = signals.filter(s => s.status === "CLOSED").length;
    const winningSignals = signals.filter(s => s.status === "CLOSED" && s.outcome === "WIN").length;
    const winRate = closedSignals > 0 ? ((winningSignals / closedSignals) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      count: signals.length,
      stats: {
        totalSignals,
        activeSignals,
        closedSignals,
        winRate: parseFloat(winRate),
      },
      data: signals,
    });
  } catch (error) {
    console.error("Get my signals error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch signals",
    });
  }
};
