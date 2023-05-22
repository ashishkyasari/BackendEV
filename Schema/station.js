const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  Machine1: {
    type: [{
      value: {
        type: Boolean,
        default: false
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    required: true,
    default: () => {
      const slots = [];
      const startTime = new Date();

      for (let i = 0; i < 48; i++) {
        const slotTime = new Date(startTime.getTime() + 30 * 60000 * i);
        slots.push({ timestamp: slotTime });
      }

      return slots;
    }
  },
  Machine2: {
    type: [{
      value: {
        type: Boolean,
        default: false
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    required: true,
    default: () => {
      const slots = [];
      const startTime = new Date();

      for (let i = 0; i < 48; i++) {
        const slotTime = new Date(startTime.getTime() + 30 * 60000 * i);
        slots.push({ timestamp: slotTime });
      }

      return slots;
    }
  }
});

const Station = mongoose.model("Station", stationSchema);

module.exports = Station;