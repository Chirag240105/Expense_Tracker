import mongoose from "mongoose";
import { Readable } from "stream";

let bucket = null;

export function getGridFSBucket() {
  if (!bucket) {
    if (!mongoose.connection.db) {
      throw new Error("MongoDB connection not established");
    }
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "receipts",
    });
  }
  return bucket;
}

/**
 * Uploads a file buffer directly to MongoDB GridFS.
 */
export async function uploadToGridFS(buffer, filename, contentType = "application/octet-stream", metadata = {}) {
  const gridBucket = getGridFSBucket();
  const readableStream = Readable.from(buffer);

  return new Promise((resolve, reject) => {
    const uploadStream = gridBucket.openUploadStream(filename, {
      contentType,
      metadata,
    });

    readableStream.pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => {
        resolve({
          fileId: uploadStream.id,
          filename: uploadStream.filename,
          length: uploadStream.length,
          contentType,
        });
      });
  });
}

/**
 * Streams a file out from MongoDB GridFS by ID.
 */
export async function streamFromGridFS(fileId, res) {
  const gridBucket = getGridFSBucket();
  const objectId = typeof fileId === "string" ? new mongoose.Types.ObjectId(fileId) : fileId;

  const files = await gridBucket.find({ _id: objectId }).toArray();
  if (!files || files.length === 0) {
    return res.status(404).json({ success: false, message: "File not found" });
  }

  const fileDoc = files[0];
  res.setHeader("Content-Type", fileDoc.contentType || "application/octet-stream");
  res.setHeader("Content-Length", fileDoc.length);
  res.setHeader("Content-Disposition", `inline; filename="${fileDoc.filename}"`);

  const downloadStream = gridBucket.openDownloadStream(objectId);
  downloadStream.on("error", (err) => {
    res.status(500).json({ success: false, message: err.message });
  });

  return downloadStream.pipe(res);
}
