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

app.get("/", (req, res) => {
  res.send("Hello World!");
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
      const existingDirectory = await DirectoryName.findOne({ name, volumeName });

      if (!existingDirectory) {
        const newDirectory = new DirectoryName({ name, volumeName });
        await newDirectory.save();
        savedDirectories.push({ name, volumeName });
      } else {
        existingDirectories.push({ name, volumeName });
      }
    }

    console.log("Saved Directories:", savedDirectories);
    console.log("Existing Directories:", existingDirectories);

    res.status(200).json({ savedDirectories, existingDirectories });
  } catch (error) {
    console.error("Error saving directories:", error.message);
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
