const mongoose = require('mongoose');

const preRegisterUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    deviceInfo: {
        type: String,
        required: false,
        comment: 'Optional: device or browser info'
    },
    ipAddress: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(v);
            },
            message: props => `${props.value} is not a valid IP address!`
        },
        comment: 'Optional: IP address'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'pre_register_users'
});

// Create indexes
preRegisterUserSchema.index({ email: 1 });
preRegisterUserSchema.index({ ipAddress: 1 });
preRegisterUserSchema.index({ createdAt: 1 });

// Add pre-save middleware to update the updatedAt field
preRegisterUserSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const PreRegisterUser = mongoose.model('PreRegisterUser', preRegisterUserSchema);

module.exports = PreRegisterUser; 