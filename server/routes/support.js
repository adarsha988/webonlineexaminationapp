import express from 'express';
import SupportQuery from '../models/support.model.js';
import Notification from '../models/notification.model.js';

const router = express.Router();

// Create a new support query
router.post('/support/create', async (req, res) => {
  try {
    const { name, email, issue, studentId, category } = req.body;

    // Validate required fields
    if (!name || !email || !issue) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and issue description are required'
      });
    }

    // Create the support query
    const supportQuery = await SupportQuery.create({
      name,
      email,
      issue,
      studentId: studentId || null,
      category: category || 'other',
      status: 'pending'
    });

    // Create a notification for admins
    await Notification.create({
      type: 'system',
      title: 'New Support Query',
      message: `${name} has submitted a support query: ${issue.substring(0, 100)}...`,
      priority: 'medium',
      userId: null // null means it's for all admins
    });

    // Create a confirmation notification for the student if studentId is provided
    if (studentId) {
      await Notification.create({
        type: 'system',
        title: 'Support Query Submitted',
        message: 'Your support query has been received. Our team will get back to you soon.',
        userId: studentId,
        priority: 'low'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Support query submitted successfully. We will get back to you soon!',
      data: supportQuery
    });
  } catch (error) {
    console.error('Error creating support query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit support query',
      error: error.message
    });
  }
});

// Get all support queries (for admin)
router.get('/support/queries', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const supportQueries = await SupportQuery.find(query)
      .populate('studentId', 'name email')
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportQuery.countDocuments(query);

    res.json({
      success: true,
      data: supportQueries,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: supportQueries.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching support queries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support queries',
      error: error.message
    });
  }
});

// Get support queries for a specific student
router.get('/support/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const supportQueries = await SupportQuery.find({ studentId })
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportQuery.countDocuments({ studentId });

    res.json({
      success: true,
      data: supportQueries,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: supportQueries.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching student support queries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support queries',
      error: error.message
    });
  }
});

// Update support query status (for admin)
router.patch('/support/:queryId', async (req, res) => {
  try {
    const { queryId } = req.params;
    const { status, response, respondedBy } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (response) {
      updateData.response = response;
      updateData.respondedAt = new Date();
      if (respondedBy) updateData.respondedBy = respondedBy;
    }

    const supportQuery = await SupportQuery.findByIdAndUpdate(
      queryId,
      updateData,
      { new: true }
    ).populate('studentId', 'name email');

    if (!supportQuery) {
      return res.status(404).json({
        success: false,
        message: 'Support query not found'
      });
    }

    // Notify the student if there's a response
    if (response && supportQuery.studentId) {
      await Notification.create({
        type: 'system',
        title: 'Support Query Response',
        message: `Your support query has been responded to: ${response.substring(0, 100)}...`,
        userId: supportQuery.studentId._id,
        priority: 'medium'
      });
    }

    res.json({
      success: true,
      message: 'Support query updated successfully',
      data: supportQuery
    });
  } catch (error) {
    console.error('Error updating support query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update support query',
      error: error.message
    });
  }
});

// Delete support query
router.delete('/support/:queryId', async (req, res) => {
  try {
    const { queryId } = req.params;

    const supportQuery = await SupportQuery.findByIdAndDelete(queryId);

    if (!supportQuery) {
      return res.status(404).json({
        success: false,
        message: 'Support query not found'
      });
    }

    res.json({
      success: true,
      message: 'Support query deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting support query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete support query',
      error: error.message
    });
  }
});

export default router;
