import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import fs from 'fs';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDevelopment = process.env.NODE_ENV !== 'production';

function readEnvFile(name) {
  const file = path.resolve(__dirname, name);
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const eq = line.indexOf('=');
        return [line.slice(0, eq).trim(), line.slice(eq + 1).trim()];
      }),
  );
}

const fileEnv = readEnvFile('.env');

const RESERVED_ENV_KEYS = new Set(['NODE_ENV', 'PUBLIC_PATH']);

// Relative by default: the build must open from file:// and from any Pages subpath.
const publicPath = process.env.PUBLIC_PATH || fileEnv.PUBLIC_PATH || 'auto';

const inlinedEnv = Object.fromEntries(
  Object.entries(fileEnv)
    .filter(([key]) => !RESERVED_ENV_KEYS.has(key))
    .map(([key, value]) => [`process.env.${key}`, JSON.stringify(process.env[key] ?? value)]),
);

export default {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.[contenthash].js',
    publicPath,
    clean: true,
  },
  devServer: {
    static: './dist',
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  module: {
    rules: [
      { test: /\.(svg|png|jpe?g|webp)$/, type: 'asset/resource', generator: { filename: 'img/[name].[contenthash][ext]' } },
      { test: /\.woff2?$/, type: 'asset/resource', generator: { filename: 'fonts/[name][ext]' } },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: isDevelopment ? ['react-refresh/babel'] : [],
          },
        },
      },
      {
        test: /\.module\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                namedExport: false,
                exportLocalsConvention: 'as-is',
                localIdentName: isDevelopment
                  ? '[name]__[local]--[hash:base64:5]'
                  : '[hash:base64]',
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
    }),
    new webpack.DefinePlugin({
      ...inlinedEnv,
      'process.env.PUBLIC_PATH': JSON.stringify(publicPath),
    }),
    !isDevelopment && new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash].css' }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
};
