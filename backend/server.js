
require('dotenv').config();
const express = require("express");
const app = express();
const fastGlob = require("fast-glob");
const port = process.env.PORT || 5000
const path = require('path');



app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/directories", async (req, res) => {
  const directory = req.body.directory;
  console.log(`Received directory name: ${directory}`);
  console.log(`Reading directory: ${directory}`);

  try {
    const directoryNames = await fastGlob(`${directory}/**/*`, {
      onlyDirectories: true,
    });
    const subDirectoryNames = directoryNames.map(directoryName => path.basename(directoryName.slice(0, -1)));
    res.status(200).json({ directories: subDirectoryNames });
  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
