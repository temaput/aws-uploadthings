# File Upload & Metadata Extraction Service

## Objective

Build a service that allows users to upload files, stores them in AWS S3, and triggers a process
to extract metadata (e.g., file size, type, basic text content if a PDF).

## Instructions

1. Create a RESTful API endpoint:
   - Implement a /upload endpoint that accepts file uploads (e.g., PDF, image) and
   user provided metadata, for example: author name, expiration date, etc.
   - Store each file in an S3 bucket and store the user metadata.
   - If the process is successful, return file_id, otherwise an error message.
2. Metadata Extraction with AWS Lambda:
   - Set up a Lambda function to be triggered when a new file is uploaded to the S3
   bucket.
   - The Lambda function should extract additional metadata from the file (e.g., file
   type, size, number of pages if a PDF).
   - Store this metadata in a DynamoDB table with a unique connection to the file.
3. Retrieve Metadata:
   - Implement an additional API endpoint /metadata/{file_id} that allows
   users to retrieve metadata for a specific file by its unique identifier.
   
## Requirements

- Use Node.js for the Lambda functions.
- Deployable on AWS.
- Clear, modular code with comments explaining each step.

## Evaluation Criteria

- Code Structure & Modularity: Evaluate how well components are separated (API
  endpoint, S3 storage, Lambda processing).
- AWS Integration: Ensure correct usage of S3, DynamoDB, and Lambda.
- Error Handling: Look for comprehensive error handling for file uploads, Lambda
  triggers, and metadata retrieval.
- Extra: A README file explaining decisions, challenges faced, and any assumptions
  made.

# Solution

- Use SST to deploy the infra.
- Provide 2 solutions for `/upload` endpoint:
  - Recommended: purely lambda based, leveraging S3 upload mechanisms
  - "Legacy": following the _Instructions_ more precisely: implement `/upload` endpoint that accepts file uploads as a nodejs service instead of lightweight lambda.

## Recommended solution

`/upload` expects userdata including the filename, but not the file itself. It responds with a presigned URL and file id. Frontend is expected to use presigned url to upload the file directly to S3. This leverages fully serverless architecture based on lambdas and api gateway. All upload related functionality is done via S3 service.


## "Legacy" solution

`/upload` expets a multipart form, containing userdata excluding the filename, but including the file itself (as a `file`). It generates the file id and responds with it and success message as soon as the upload is done. Implemented as a ecs service using expressjs and multer-s3 plugin.

## On Code Structure & Modularity
Borrowed from [sst monorepo template](https://github.com/sst/monorepo-template/tree/main)

- `packages/core` deals with metadata extraction and storing.
- `packages/function` contain 3 lambdas and 1 shared module
- `packages/services` contain legacy nodejs service to support multipart form upload
- `infra` contains modularized sst infrastructure definitions, used by `sst.config.ts`
- `Dockerfile` is necessary for deploying a legacy nodejs service to ECS
  
Lambdas and service are supposed to be thin API layers responsible for requests handling. Core supposed to be responsible for core business logic (which is a metadata in this case). AWS sdk is used directly, although could be abstracted in a larger project.

## Data structure
We generate a uuid and use it to produce file keys on S3 and also id a metadata records in DDB. Since we are not using original filenames in S3 we store it as a part of userMetadata. All the extracted metadata is put to extractedMetadata field in DDB.

## Deployment
Run `npm i` and `npm run deploy` from the root. AWS default credentials and region are expected to be provided via `~/.aws/` files



## API Endpoints

Look at the output of deployment command to find your urls

### POST /upload
**Recommended approach**: Returns presigned URL for direct S3 upload

**Request Body:**
```json
{
  "fileName": "document.pdf",
  "author": "John Doe", 
  "expirationDate": "2024-12-31T23:59:59Z"
}
```
**Response:**
```json
{
  "id": "uuid-here",
  "presignedUrl": "https://s3.amazonaws.com/..."
}
```

**Legacy approach**: Send file as a multipart form

### POST /upload (legacy: multipart form)
```json
{
  "file": "[binary]",
  "author": "John Doe", 
  "expirationDate": "2024-12-31T23:59:59Z"
}

```

### GET /metadata/{fileId}
**Response:**
```json
{
  "id": "uuid",
  "userData": { ... },
  "extractedMetadata": {
    "mimeType": "application/pdf",
    "size": 1024,
    "metadata": { "pages": 5, "text": "..." }
  }
}
```