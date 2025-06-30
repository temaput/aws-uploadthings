import { bucket } from "./storage";
import { table } from "./table";

export const uploaderApi = new sst.aws.ApiGatewayV2("UTFileUploaderApi");

uploaderApi.route("GET /metadata/{id}", {
  link: [table],
  handler: "packages/functions/src/metadata.handler",
  nodejs: {
    install: ["pdf-parse"],
  },
});
uploaderApi.route("POST /upload", {
  link: [bucket, table],
  handler: "packages/functions/src/upload.handler",
  nodejs: {
    install: ["pdf-parse"],
  },
});

bucket.notify({
  notifications: [
    {
      name: "UTFileProcessorTask",
      function: {
        link: [bucket, table],
        handler: "packages/functions/src/process.handler",
        nodejs: {
          install: ["pdf-parse"],
        },
      },
    },
  ],
});
