import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Resource } from "sst";
import { z } from "zod";
import { createRequire } from "module";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const userFileMetadataSchema = z.object({
  fileName: z.string(),
  author: z.string(),
  expirationDate: z.string().date(),
});

export type UserFileMetadata = z.infer<typeof userFileMetadataSchema>;

export namespace Metadata {
  // Create a require function that is relative to the current file
  const require = createRequire(import.meta.url);

  // Use the old require to load the CJS module
  const pdfParse = require("pdf-parse");

  export function getFileExtension(fileName: string) {
    return fileName.split(".").pop();
  }

  export function identifyMimeType(fileName: string) {
    const extension = getFileExtension(fileName);
    switch (extension) {
      case "pdf":
        return "application/pdf";
      case "jpg":
        return "image/jpeg";
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      default:
        return "application/octet-stream";
    }
  }

  export function parseUserFileMetadata(data: unknown) {
    return userFileMetadataSchema.parse(data);
  }

  export async function storeUserFileMetadata(
    id: string,
    userData: UserFileMetadata
  ) {
    await ddb.send(
      new PutCommand({
        TableName: Resource.UTFileMetadata.name,
        Item: {
          id,
          userData,
        },
      })
    );
  }

  export async function extractMetadata(key: string) {
    const extension = getFileExtension(key);
    const mimeType = identifyMimeType(key);
    const s3 = new S3Client({});
    const command = new GetObjectCommand({
      Bucket: Resource.UTFiles.name,
      Key: key,
    });
    const response = await s3.send(command);
    const size = response.ContentLength;

    let metadata: unknown = null;
    if (mimeType === "application/pdf") {
      const file = await response.Body?.transformToByteArray();
      if (file) {
        metadata = await pdfParse(Buffer.from(file));
      }
    }
    return {
      mimeType,
      size,
      metadata,
    };
  }

  export async function storeExtractedMetadata(
    key: string,
    extractedMetadata: Awaited<ReturnType<typeof extractMetadata>>
  ) {
    const id = key.split(".")[0];
    await ddb.send(
      new UpdateCommand({
        TableName: Resource.UTFileMetadata.name,
        Key: { id },
        UpdateExpression: "SET extractedMetadata = :extractedMetadata",
        ExpressionAttributeValues: {
          ":extractedMetadata": extractedMetadata,
        },
      })
    );
  }

  export async function getExtractedMetadata(id: string) {
    const command = new GetCommand({
      TableName: Resource.UTFileMetadata.name,
      Key: { id },
    });
    const response = await ddb.send(command);
    return response.Item;
  }
}
