import { APIGatewayProxyResultV2 } from "aws-lambda";

export function successResponse(
  body: unknown,
  statusCode: number = 200
): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };
}

export function errorResponse(
  body: unknown,
  statusCode: number = 400
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };
}
