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
  console.log(req.body)
  console.log(379*3)
  const directory = req.body.directory;
  console.log(`Received directory name: ${directory}`);
  console.log(`Reading directory: ${directory}`);

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
