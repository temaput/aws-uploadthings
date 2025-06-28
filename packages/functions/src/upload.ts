import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { Metadata, UserFileMetadata } from "@aws-uploadthings/core/metadata";
import { errorResponse, successResponse } from "./shared";

const s3 = new S3Client({});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // Get data from the event, generate uuid, save to ddb, generate presigned url, return url
  const data = event.body;
  let metadata: UserFileMetadata;
  try {
    metadata = Metadata.parseUserFileMetadata(JSON.parse(data ?? "{}"));
  } catch (error) {
    console.error("Error parsing user file metadata:", error);
    return errorResponse({ error });
  }
  const uuid = crypto.randomUUID();
  await Metadata.storeUserFileMetadata(uuid, metadata);

  const extension = Metadata.getFileExtension(metadata.fileName);
  const command = new PutObjectCommand({
    Bucket: Resource.UTFiles.name,
    Key: `${uuid}.${extension}`,
    ContentType: Metadata.identifyMimeType(metadata.fileName),
  });
  const presignedUrl = await getSignedUrl(s3, command, {
    expiresIn: 60 * 60, // 1 hour
  });

  return successResponse({ id: uuid, presignedUrl });
};
