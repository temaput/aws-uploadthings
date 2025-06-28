import { Metadata } from "@aws-uploadthings/core/metadata";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { errorResponse, successResponse } from "./shared";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // Get metadata for a given id
  const id = event.pathParameters?.id;
  if (!id) {
    return errorResponse({ error: "Missing id" });
  }
  const metadata = await Metadata.getExtractedMetadata(id);
  if (!metadata) {
    return errorResponse({ error: "Metadata not found" }, 404);
  }
  return successResponse(metadata);
};
