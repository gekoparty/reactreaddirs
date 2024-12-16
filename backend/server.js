import dotenv from 'dotenv';
import express from 'express';
import fastGlob from 'fast-glob';
import path from 'path';
import mongoose from 'mongoose';
import DirectoryName from './models/directoryNameSchema.js';



const port = process.env.PORT || 5000;



const app = express();
app.use(express.json());

dotenv.config();


mongoose.set('strictQuery', false);

connectToDB();

app.get("/api/directories", async (req, res) => {
  try {
    // Fetch all directories from the database
    const directories = await DirectoryName.find({});
    res.status(200).json({ directories });
  } catch (error) {
    console.error("Error fetching directories from database:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/directories", async (req, res) => {
  
  const directory = req.body.directory;
  
  try {
    const directoryNames = await fastGlob(`${directory}/**/`, {
      onlyDirectories: true,
    });
    const subDirectoryNames = directoryNames.map((directoryName, index) => ({
      key: index,
      name: path.parse(directoryName).base,
    }))
    res.status(200).json({ directories: subDirectoryNames });
  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/directories/save", async (req, res) => {
  const { directories } = req.body; // Destructure directories from req.body

  if (!Array.isArray(directories) || directories.length === 0) {
    return res.status(400).json({ error: "Directories must be a non-empty array." });
  }

  // Extract volumeName from the first directory object
  const volumeName = directories[0]?.volumeName;
  if (!volumeName) {
    return res.status(400).json({ error: "Volume name is required." });
  }

  try {
    const savedDirectories = [];
    const existingDirectories = [];

    for (const { name } of directories) {
      // Log input data for debugging
      console.log(`Processing directory: name=${name}, volumeName=${volumeName}`);

      // Check if the directory exists
      const existingDirectory = await DirectoryName.findOne({ name, volumeName });

      if (!existingDirectory) {
        // If not, save the new directory
        const newDirectory = new DirectoryName({ name, volumeName });
        await newDirectory.save();
        savedDirectories.push({ name, volumeName });
      } else {
        // If it exists, add it to the existingDirectories array
        existingDirectories.push({ name, volumeName: existingDirectory.volumeName });
      }
    }

    console.log("Saved Directories:", savedDirectories);
    console.log("Existing Directories:", existingDirectories);

    // Return both saved and existing directories
    res.status(200).json({ savedDirectories, existingDirectories });
  } catch (error) {
    console.error("Error saving directories:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New delete route to remove directories based on _id
app.post("/api/directories/delete", async (req, res) => {
  const { ids } = req.body; // Get the array of _id from the request body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "No directory IDs provided." });
  }

  try {
    // Delete directories by _id
    const result = await DirectoryName.deleteMany({ _id: { $in: ids } });

    // If no directories were deleted, respond accordingly
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No directories found with the provided IDs." });
    }

    res.status(200).json({ message: `${result.deletedCount} directories deleted successfully.` });
  } catch (error) {
    console.error("Error deleting directories:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});



async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to DB");
  } catch (err) {
    console.error(err.message);
  }
}
