const mongoose = require('mongoose');
require('dotenv').config();

const migrateCollection = async (Model) => {
    const docs = await Model.find().sort('createdAt');
    let counter = 1;

    for (const doc of docs) {
        await Model.findByIdAndUpdate(doc._id, {
            $set: { _id: counter }
        });
        counter++;
    }

    console.log(`Migrated ${Model.modelName}: ${counter - 1} documents`);
};

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Migrate each collection
        await migrateCollection(require('../models/User'));
        await migrateCollection(require('../models/Category'));
        // Add other models as needed

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();