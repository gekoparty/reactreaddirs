import mongoose from "mongoose";



const directoryNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  volumeName: {
    type: String,
    required: true,
    trim: true,
  },
});

directoryNameSchema.index({ name: 1 });
directoryNameSchema.index({ volumeName: 1, name: 1 });

const DirectoryName = mongoose.model("DirectoryName", directoryNameSchema);

export default DirectoryName;
