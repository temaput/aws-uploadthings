import { Metadata } from "@aws-uploadthings/core/metadata";
import { S3Handler } from "aws-lambda";

export const handler: S3Handler = async (event) => {
  // Process uploaded files
  for (const record of event.Records) {
    const key = record.s3.object.key;
    const metadata = await Metadata.extractMetadata(key);
    await Metadata.storeExtractedMetadata(key, metadata);
  }
};
