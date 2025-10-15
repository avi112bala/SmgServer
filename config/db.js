const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(
      // "mongodb+srv://sheildmotorgroup_db_user:Smg1234@cluster0.btdezfb.mongodb.net/SMG?retryWrites=true&w=majority",
      "mongodb+srv://avi116:Tech1216@cluster0.dxy3r.mongodb.net/SMG?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

