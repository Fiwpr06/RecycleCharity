const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [10000, 'Nội dung tin nhắn không được vượt quá 10000 ký tự']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    tokens: {
      type: Number,
      default: 0
    }
  }],
  topic: {
    type: String,
    enum: [
      'recycling', // Tái chế
      'waste_management', // Quản lý rác thải
      'environmental_protection', // Bảo vệ môi trường
      'green_living', // Sống xanh
      'climate_change', // Biến đổi khí hậu
      'sustainability', // Bền vững
      'general', // Tổng quát
      'other' // Khác
    ],
    default: 'general'
  },
  title: {
    type: String,
    maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự'],
    trim: true
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  totalTokens: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để update các trường tự động
chatHistorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.totalMessages = this.messages.length;
  this.totalTokens = this.messages.reduce((total, msg) => total + (msg.tokens || 0), 0);
  
  if (this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
    
    // Tự động tạo title từ tin nhắn đầu tiên của user nếu chưa có
    if (!this.title) {
      const firstUserMessage = this.messages.find(msg => msg.role === 'user');
      if (firstUserMessage) {
        this.title = firstUserMessage.content.substring(0, 50) + 
                    (firstUserMessage.content.length > 50 ? '...' : '');
      }
    }
  }
  
  next();
});

// Virtual để format topic
chatHistorySchema.virtual('topicDisplay').get(function() {
  const topicMap = {
    recycling: 'Tái chế',
    waste_management: 'Quản lý rác thải',
    environmental_protection: 'Bảo vệ môi trường',
    green_living: 'Sống xanh',
    climate_change: 'Biến đổi khí hậu',
    sustainability: 'Bền vững',
    general: 'Tổng quát',
    other: 'Khác'
  };
  return topicMap[this.topic];
});

// Virtual để format thời gian chat
chatHistorySchema.virtual('duration').get(function() {
  if (this.messages.length < 2) return 0;
  
  const firstMessage = this.messages[0];
  const lastMessage = this.messages[this.messages.length - 1];
  
  return Math.floor((lastMessage.timestamp - firstMessage.timestamp) / 1000 / 60); // phút
});

// Method để thêm tin nhắn mới
chatHistorySchema.methods.addMessage = function(role, content, tokens = 0) {
  this.messages.push({
    role,
    content,
    tokens,
    timestamp: new Date()
  });
  return this.save();
};

// Method để lấy tin nhắn gần đây
chatHistorySchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

// Static method để lấy thống kê chat của user
chatHistorySchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$user',
        totalSessions: { $sum: 1 },
        totalMessages: { $sum: '$totalMessages' },
        totalTokens: { $sum: '$totalTokens' },
        activeSessions: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        topicStats: {
          $push: {
            topic: '$topic',
            messageCount: '$totalMessages',
            tokens: '$totalTokens'
          }
        },
        averageMessagesPerSession: { $avg: '$totalMessages' },
        lastChatAt: { $max: '$lastMessageAt' }
      }
    }
  ]);
};

// Static method để tìm session theo sessionId và userId
chatHistorySchema.statics.findSession = function(userId, sessionId) {
  return this.findOne({ user: userId, sessionId: sessionId });
};

// Index để tối ưu query
chatHistorySchema.index({ user: 1, lastMessageAt: -1 });
chatHistorySchema.index({ user: 1, sessionId: 1 });
chatHistorySchema.index({ topic: 1, createdAt: -1 });
chatHistorySchema.index({ isActive: 1, lastMessageAt: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
