import dotenv from 'dotenv';
import express from 'express';
import fastGlob from 'fast-glob';
import path from 'path';
import mongoose from 'mongoose'


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
  const { directories, volumeNumber } = req.body;
  try {
    // You can process the data here and save it to a database or do any other logic you need
    // For example, you can save the data to a MongoDB collection:
    // const directory = new Directory({ directories, volumeNumber });
    // await directory.save();
    console.log(volumeNumber)
    res.status(200).json({ message: "Directories saved successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
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
