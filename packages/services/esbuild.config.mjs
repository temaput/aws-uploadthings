import esbuild from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";

const isWatch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: ["src/upload-legacy.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "dist/upload-legacy.js",
  plugins: [nodeExternalsPlugin()],
  external: ["@aws-sdk/client-dynamodb", "@aws-sdk/lib-dynamodb", "pdf-parse", "@aws-sdk/client-s3"],
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(buildOptions);
} 