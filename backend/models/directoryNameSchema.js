import mongoose from "mongoose";



const directoryNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  volumeName: {
    type: String,
    required: true,
  },
});

const DirectoryName = mongoose.model("DirectoryName", directoryNameSchema);

export default DirectoryName;
