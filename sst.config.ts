/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "aws-uploadthings",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const storage = await import("./infra/storage");
    const api = await import("./infra/api");
    const sercvice = await import("./infra/service");
    const table = await import("./infra/table");

    return {
      UTFiles: storage.bucket.name,
      UploaderApi: api.uploaderApi.url,
      UploaderLegacyService: sercvice.uploaderLegacyService.url,
      UTFileMetadata: table.table.name,
    };
  },
});
