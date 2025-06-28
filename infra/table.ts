export const table = new sst.aws.Dynamo("UTFileMetadata", {
  fields: {
    id: "string",
  },
  primaryIndex: { hashKey: "id" },
});