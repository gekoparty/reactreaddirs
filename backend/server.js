import dotenv from 'dotenv';
import express from 'express';
import fastGlob from 'fast-glob';
import path from 'path';
import mongoose from 'mongoose';
import DirectoryName from './models/directoryNameSchema.js';
import slugify from 'slugify';



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
  const { directories } = req.body;

  if (!Array.isArray(directories) || directories.length === 0) {
    return res.status(400).json({ error: "Directories must be a non-empty array." });
  }

  const volumeName = directories[0]?.volumeName;
  if (!volumeName) {
    return res.status(400).json({ error: "Volume name is required." });
  }

  try {
    const savedDirectories = [];
    const existingDirectories = [];

    for (const { name } of directories) {
      // Generate slug with custom logic
      const slug = slugify(name, { lower: true, strict: false });

      // Check if a directory with the same slug exists
      const existingDirectory = await DirectoryName.findOne({ slug });

      if (!existingDirectory) {
        // Save the original name and the slug
        const newDirectory = new DirectoryName({ name, slug, volumeName });
        await newDirectory.save();
        savedDirectories.push({ name, volumeName });
      } else {
        existingDirectories.push({
          name, // Original name from current search
          slug,
          currentVolume: volumeName,
          existingVolume: existingDirectory.volumeName, // From database
        });
      }
    }

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
