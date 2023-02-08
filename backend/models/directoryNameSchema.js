import mongoose from "mongoose";



const directoryNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  volumeName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const DirectoryName = mongoose.model("DirectoryName", directoryNameSchema);

export default DirectoryName;
