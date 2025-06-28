import express from "express";
import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import { Resource } from "sst";
import { Metadata } from "@aws-uploadthings/core/metadata";

const app = express();
const s3 = new S3Client({});

// Configure multer to use S3 for storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: Resource.UTFiles.name, // Use the linked bucket name
    // acl: 'public-read', // Optional: if you want the files to be publicly readable
    metadata: function (req, file, cb) {
      // You can access other form fields from `req.body` here
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Create a unique key for the file
      cb(null, `uploads/${Date.now().toString()}-${file.originalname}`);
    },
  }),
});

// Define the single upload endpoint
// 'file' is the name of the form field for the file
app.post("/upload", upload.single("file"), async (req, res) => {
  // At this point, the file has already been uploaded to S3 by multer-s3

  // You can access additional form data sent along with the file
  const otherData = req.body.otherData;
  console.log("Additional data received:", otherData);

  const uuid = crypto.randomUUID();
  await Metadata.storeUserFileMetadata(uuid, otherData);

  // The uploaded file's information is available on req.file
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  const s3File = req.file as any; // Cast to access multer-s3 properties

  res.status(200).json({
    message: "File uploaded successfully to S3!",
    location: s3File.location, // The S3 URL of the uploaded file
    key: s3File.key,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});