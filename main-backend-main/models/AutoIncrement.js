const mongoose = require('mongoose');

// Define a schema for the counter
const counterSchema = new mongoose.Schema({
    model: String,
    field: String,
    count: Number
});

// Use the existing Counter model if it exists, otherwise create a new one
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const autoIncrementModelID = async function(modelName) {
    const counter = await Counter.findOneAndUpdate(
        { model: modelName, field: '_id' },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
    );
    return counter.count;
};

const AutoIncrementID = (schema, modelName) => {
    schema.pre('save', async function(next) {
        if (this.isNew) {
            this._id = await autoIncrementModelID(modelName);
        }
        next();
    });
};

module.exports = AutoIncrementID;