import { Configuration } from "webpack";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const webpackConfig: Configuration = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
      "@game": path.resolve(__dirname, "../src/features/gameplay/*"),
      "@pages": path.resolve(__dirname, "../src/pages/*"),
      "@style": path.resolve(__dirname, "../src/style/*"),
      "@test": path.resolve(__dirname, "../test/*"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/, /\.d\.ts$/],
        use: "ts-loader",
      },
    ],
  },
};

export default webpackConfig;
