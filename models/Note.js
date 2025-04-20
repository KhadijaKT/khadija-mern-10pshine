const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        fontFamily: {
            type: String,
            default: 'Arial'
        },
        isBold: {
            type: Boolean,
            default: false
        },
        isItalic: {
            type: Boolean,
            default: false
        },
        isUnderlined: {
            type: Boolean,
            default: false
        },
        backgroundColor: {
            type: String,
            default: '#ffffff' 
        },
        textColor: {
            type: String,
            default: '#000000' 
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Note', noteSchema);