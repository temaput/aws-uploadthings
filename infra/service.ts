import { bucket } from "./storage";
import { table } from "./table";
import { vpc } from "./vpc";

const cluster = new sst.aws.Cluster("Cluster", { vpc });

// Define the containerized service
export const uploaderLegacyService = new sst.aws.Service(
  "UTFileUploaderLegacyService",
  {
    cluster,
    // Link the bucket to give our service IAM permissions to access it
    link: [bucket, table],
    // For local development, this command will be run
    dev: {
      command: "npm run dev",
      directory: "packages/services",
    },
    loadBalancer: {
      rules: [{ listen: "80/http", forward: "3000/http" }],
    },
  }
);
