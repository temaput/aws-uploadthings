/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
/* deno-fmt-ignore-file */

declare module "sst" {
  export interface Resource {
    "UTFileMetadata": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "UTFileUploaderApi": {
      "type": "sst.aws.ApiGatewayV2"
      "url": string
    }
    "UTFileUploaderLegacyService": {
      "service": string
      "type": "sst.aws.Service"
      "url": string
    }
    "UTFiles": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "Vpc": {
      "type": "sst.aws.Vpc"
    }
  }
}
/// <reference path="sst-env.d.ts" />

import "sst"
export {}