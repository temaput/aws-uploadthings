import { bucket } from "./storage";
import { table } from "./table";

export const uploaderApi = new sst.aws.ApiGatewayV2("UTFileUploaderApi");

uploaderApi.route("GET /metadata/{id}", {
  link: [table],
  handler: "packages/functions/src/metadata.handler",
});
uploaderApi.route("POST /upload", {
  link: [bucket, table],
  handler: "packages/functions/src/upload.handler",
});

export const notification = bucket.notify({
  notifications: [
    {
      name: "UTFileProcessorTask",
      function: {
        link: [bucket, table],
        handler: "packages/functions/src/process.handler",
      },
    },
  ],
});
