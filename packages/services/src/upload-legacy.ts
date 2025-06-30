import express from "express";
import multer from "multer";
import crypto from "crypto";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import { Resource } from "sst";
import { Metadata, UserFileMetadata } from "@aws-uploadthings/core/metadata";

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
      const uuid = crypto.randomUUID();
      cb(null, `${uuid}.${Metadata.getFileExtension(file.originalname)}`);
    },
  }),
});

// Define the single upload endpoint
// 'file' is the name of the form field for the file
app.post("/upload", upload.single("file"), async (req, res) => {
  // At this point, the file has already been uploaded to S3 by multer-s3
  // The uploaded file's information is available on req.file
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  // Serialize all body data as json
  let metadata: UserFileMetadata | undefined;
  try {
    metadata = Metadata.parseUserFileMetadata({
      ...req.body,
      fileName: req.file?.originalname,
    });
  } catch (e) {
    res.status(400).send("Invalid metadata");
    return;
  }
  const s3File = req.file as any; // Cast to access multer-s3 properties
  const fileId = s3File.key?.split(".")[0];
  if (!fileId) {
    res.status(400).send("Invalid file key");
    return;
  }
  await Metadata.storeUserFileMetadata(fileId, metadata);



  res.status(200).json({
    id: fileId,
    message: "File uploaded successfully to S3!",
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
