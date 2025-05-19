const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const dataImportQueue = require("../queue");
const fs = require("fs");

const router = express.Router();
// middleware to handle file uploads from body
const upload = multer({ dest: "uploads/" });

router.post("/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File uploaded successfully");
    const filePath = req.file.path;

    // parse the excel data
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Excel file is empty" });
    }

    // chunking the data
    const chunkSize = 100;
    const totalChunks = Math.ceil(rows.length / chunkSize);

    try {
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const chunkNum = Math.floor(i / chunkSize) + 1;

        // Add job to queue with timeout
        const job = await dataImportQueue.add(
          "import-chunk",
          { rows: chunk, chunkNum, totalChunks },
          {
            timeout: 30000, // 30 seconds timeout
            attempts: 3,
          }
        );

        console.log(
          `Queued chunk ${chunkNum}/${totalChunks}, Job ID: ${job.id}`
        );
      }
    } catch (err) {
      console.error("Error adding to queue:", err);
      return res.status(500).json({
        error: "Failed to queue data for processing",
        details: err.message,
      });
    }

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Send response
    res.json({
      status: "Queued",
      message: "File processed and data queued for import",
      totalRows: rows.length,
      totalChunks: totalChunks,
    });
  } catch (error) {
    console.error("Error processing upload:", error);

    // Clean up file if it exists after error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }

    res.status(500).json({
      error: "Failed to process the Excel file",
      details: error.message,
    });
  }
});

module.exports = router;
