import dotenv from 'dotenv';
import express from 'express';
import fastGlob from 'fast-glob';
import fs from 'fs/promises';
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

const MAX_PAGE_SIZE = 100;
const SORTABLE_FIELDS = new Set(["name", "volumeName"]);

function clampPositiveInteger(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeDirectoryName(name) {
  return String(name || "").trim();
}

function createSlug(name) {
  return slugify(normalizeDirectoryName(name), { lower: true, strict: false });
}

function buildDirectoryQuery({ search = "", volume = "" }) {
  const query = {};
  const trimmedSearch = search.trim();
  const trimmedVolume = volume.trim();

  if (trimmedSearch) {
    query.name = { $regex: escapeRegExp(trimmedSearch), $options: "i" };
  }

  if (trimmedVolume) {
    query.volumeName = { $regex: escapeRegExp(trimmedVolume), $options: "i" };
  }

  return query;
}

function buildDirectorySearchPipeline({ query, escapedSearch, page, limit, sortBy, sortDirection }) {
  const rankExpression = escapedSearch
    ? {
        $switch: {
          branches: [
            {
              case: {
                $regexMatch: {
                  input: "$name",
                  regex: `^${escapedSearch}$`,
                  options: "i",
                },
              },
              then: 0,
            },
            {
              case: {
                $regexMatch: {
                  input: "$name",
                  regex: `^${escapedSearch}`,
                  options: "i",
                },
              },
              then: 1,
            },
          ],
          default: 2,
        },
      }
    : 0;

  return [
    { $match: query },
    { $addFields: { searchRank: rankExpression } },
    { $sort: { searchRank: 1, [sortBy]: sortDirection, _id: 1 } },
    { $skip: page * limit },
    { $limit: limit },
    { $project: { searchRank: 0 } },
  ];
}

function formatDuration(startedAt) {
  return Date.now() - startedAt;
}


app.get("/api/directories", async (req, res) => {
  const startedAt = Date.now();
  const page = Math.max(clampPositiveInteger(req.query.page, 1) - 1, 0);
  const limit = clampPositiveInteger(req.query.limit, 25, MAX_PAGE_SIZE);
  const sortBy = SORTABLE_FIELDS.has(req.query.sortBy) ? req.query.sortBy : "name";
  const sortDirection = req.query.order === "desc" ? -1 : 1;
  const query = buildDirectoryQuery({
    search: String(req.query.search || ""),
    volume: String(req.query.volume || ""),
  });
  const trimmedSearch = String(req.query.search || "").trim();
  const escapedSearch = trimmedSearch ? escapeRegExp(trimmedSearch) : "";

  try {
    const [directories, totalMatching, total] = await Promise.all([
      escapedSearch
        ? DirectoryName.aggregate(
            buildDirectorySearchPipeline({
              query,
              escapedSearch,
              page,
              limit,
              sortBy,
              sortDirection,
            })
          )
        : DirectoryName.find(query)
            .sort({ [sortBy]: sortDirection, _id: 1 })
            .skip(page * limit)
            .limit(limit)
            .lean(),
      DirectoryName.countDocuments(query),
      DirectoryName.estimatedDocumentCount(),
    ]);

    res.status(200).json({
      directories,
      page: page + 1,
      limit,
      total,
      totalMatching,
      sortBy,
      order: sortDirection === -1 ? "desc" : "asc",
      durationMs: formatDuration(startedAt),
    });
  } catch (error) {
    console.error("Error fetching directories from database:", error.message);
    res.status(500).json({ error: "Could not search directories." });
  }
});

app.post("/api/directories", async (req, res) => {
  const startedAt = Date.now();
  const directory = String(req.body.directory || "").trim();

  if (!directory) {
    return res.status(400).json({ error: "Choose a folder path to scan." });
  }

  try {
    const stats = await fs.stat(directory);

    if (!stats.isDirectory()) {
      return res.status(400).json({ error: "The selected path is not a folder." });
    }

    const normalizedDirectory = directory.replace(/\\/g, "/").replace(/\/+$/, "");
    const directoryNames = await fastGlob(`${normalizedDirectory}/**/`, {
      onlyDirectories: true,
      unique: true,
      suppressErrors: true,
    });

    const subDirectoryNames = directoryNames
      .map((directoryName, index) => ({
        key: index,
        name: path.parse(directoryName).base,
      }))
      .filter((directoryName) => directoryName.name);

    res.status(200).json({
      directories: subDirectoryNames,
      scannedPath: directory,
      count: subDirectoryNames.length,
      durationMs: formatDuration(startedAt),
    });
  } catch (error) {
    console.error("Error scanning directory:", error.message);
    const message =
      error.code === "ENOENT"
        ? "That folder path does not exist."
        : "Could not scan that folder. Check the path and permissions.";

    res.status(500).json({ error: message });
  }
});

app.post("/api/directories/save", async (req, res) => {
  const startedAt = Date.now();
  const { directories } = req.body;
  const volumeName = normalizeDirectoryName(req.body.volumeName || directories?.[0]?.volumeName);

  if (!Array.isArray(directories) || directories.length === 0) {
    return res.status(400).json({ error: "Scan a folder before saving." });
  }

  if (!volumeName) {
    return res.status(400).json({ error: "Add a volume name before saving." });
  }

  try {
    const uniqueBySlug = new Map();
    const duplicateDirectories = [];

    for (const directory of directories) {
      const name = normalizeDirectoryName(directory.name);
      const slug = createSlug(name);

      if (!name || !slug) {
        continue;
      }

      if (uniqueBySlug.has(slug)) {
        duplicateDirectories.push({
          name,
          slug,
          volumeName,
          reason: "Duplicate name in this scan",
        });
        continue;
      }

      uniqueBySlug.set(slug, { name, slug, volumeName });
    }

    const uniqueDirectories = [...uniqueBySlug.values()];

    if (uniqueDirectories.length === 0) {
      return res.status(400).json({ error: "No valid folder names were found in the scan." });
    }

    const slugs = uniqueDirectories.map((directory) => directory.slug);
    const existingMatches = await DirectoryName.find({ slug: { $in: slugs } }).lean();
    const existingBySlug = new Map(
      existingMatches.map((directory) => [directory.slug, directory])
    );

    const directoriesToSave = uniqueDirectories.filter(
      (directory) => !existingBySlug.has(directory.slug)
    );

    const existingDirectories = uniqueDirectories
      .filter((directory) => existingBySlug.has(directory.slug))
      .map((directory) => {
        const existingDirectory = existingBySlug.get(directory.slug);

        return {
          _id: existingDirectory._id,
          name: directory.name,
          slug: directory.slug,
          volumeName,
          currentVolume: volumeName,
          existingVolume: existingDirectory.volumeName,
        };
      });

    const savedDirectories =
      directoriesToSave.length > 0
        ? await DirectoryName.insertMany(directoriesToSave, { ordered: false })
        : [];

    res.status(200).json({
      savedDirectories,
      existingDirectories,
      duplicateDirectories,
      summary: {
        scanned: directories.length,
        unique: uniqueDirectories.length,
        saved: savedDirectories.length,
        alreadyExisted: existingDirectories.length,
        duplicateInScan: duplicateDirectories.length,
        durationMs: formatDuration(startedAt),
      },
    });
  } catch (error) {
    console.error("Error saving directories:", error.message);
    res.status(500).json({ error: "Could not save the scanned directories." });
  }
});

app.put("/api/directories/:id", async (req, res) => {
  const { id } = req.params;
  const { name, volumeName } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid directory ID." });
  }

  if (!name?.trim() || !volumeName?.trim()) {
    return res.status(400).json({ error: "Name and volume name are required." });
  }

  try {
    const slug = slugify(name.trim(), { lower: true, strict: false });
    const duplicate = await DirectoryName.findOne({ slug, _id: { $ne: id } });

    if (duplicate) {
      return res.status(409).json({ error: "A directory with this name already exists." });
    }

    const directory = await DirectoryName.findByIdAndUpdate(
      id,
      { name: name.trim(), volumeName: volumeName.trim(), slug },
      { new: true, runValidators: true }
    );

    if (!directory) {
      return res.status(404).json({ error: "Directory not found." });
    }

    res.status(200).json({ directory });
  } catch (error) {
    console.error("Error updating directory:", error.message);
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

    res.status(200).json({
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} directories deleted successfully.`,
    });
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
