const mongoose = require('mongoose');

const quizHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizType: {
    type: String,
    required: [true, 'Vui lòng chọn loại quiz'],
    enum: [
      'recycling_basics', // Kiến thức cơ bản về tái chế
      'waste_sorting', // Phân loại rác
      'environmental_protection', // Bảo vệ môi trường
      'green_living', // Sống xanh
      'plastic_pollution', // Ô nhiễm nhựa
      'climate_change', // Biến đổi khí hậu
      'general' // Tổng hợp
    ]
  },
  quizTitle: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề quiz'],
    trim: true,
    maxlength: [200, 'Tiêu đề quiz không được vượt quá 200 ký tự']
  },
  questions: [{
    questionId: {
      type: String,
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    userAnswer: {
      type: String,
      required: true
    },
    correctAnswer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    timeSpent: {
      type: Number, // Thời gian làm câu hỏi (giây)
      default: 0
    }
  }],
  totalQuestions: {
    type: Number,
    required: true,
    min: [1, 'Số câu hỏi phải ít nhất là 1']
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: [0, 'Số câu đúng không được âm']
  },
  score: {
    type: Number,
    required: true,
    min: [0, 'Điểm số không được âm'],
    max: [100, 'Điểm số không được vượt quá 100']
  },
  timeSpent: {
    type: Number, // Tổng thời gian làm bài (giây)
    required: true,
    min: [0, 'Thời gian làm bài không được âm']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  pointsEarned: {
    type: Number,
    default: 0,
    min: [0, 'Điểm thưởng không được âm']
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual để tính phần trăm điểm
quizHistorySchema.virtual('percentage').get(function() {
  return Math.round((this.correctAnswers / this.totalQuestions) * 100);
});

// Virtual để format difficulty
quizHistorySchema.virtual('difficultyDisplay').get(function() {
  const difficultyMap = {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó'
  };
  return difficultyMap[this.difficulty];
});

// Virtual để format quiz type
quizHistorySchema.virtual('quizTypeDisplay').get(function() {
  const typeMap = {
    recycling_basics: 'Kiến thức cơ bản về tái chế',
    waste_sorting: 'Phân loại rác',
    environmental_protection: 'Bảo vệ môi trường',
    green_living: 'Sống xanh',
    plastic_pollution: 'Ô nhiễm nhựa',
    climate_change: 'Biến đổi khí hậu',
    general: 'Tổng hợp'
  };
  return typeMap[this.quizType];
});

// Virtual để format thời gian
quizHistorySchema.virtual('timeSpentDisplay').get(function() {
  const minutes = Math.floor(this.timeSpent / 60);
  const seconds = this.timeSpent % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Static method để lấy thống kê quiz của user
quizHistorySchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$user',
        totalQuizzes: { $sum: 1 },
        averageScore: { $avg: '$score' },
        totalPointsEarned: { $sum: '$pointsEarned' },
        bestScore: { $max: '$score' },
        totalTimeSpent: { $sum: '$timeSpent' },
        quizTypeStats: {
          $push: {
            type: '$quizType',
            score: '$score',
            pointsEarned: '$pointsEarned'
          }
        }
      }
    }
  ]);
};

// Index để tối ưu query
quizHistorySchema.index({ user: 1, completedAt: -1 });
quizHistorySchema.index({ quizType: 1, completedAt: -1 });
quizHistorySchema.index({ score: -1 });

module.exports = mongoose.model('QuizHistory', quizHistorySchema);
