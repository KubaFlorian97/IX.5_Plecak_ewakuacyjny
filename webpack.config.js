const path = require("path");
const fs = require("fs");
const process = require("process");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ZpePortUpdatePlugin = require("./scripts/zpe-port-update-check-plugin");
const DefinePlugin = require("webpack").DefinePlugin;
const PACKAGE = require("./package.json");

const ZPE_PORT = path.resolve(__dirname, "./packages/zpe-port/dist");
const PATHS = {
    STATIC: path.resolve(__dirname, "./static"),
    SRC: path.resolve(__dirname, "./src"),
    BUILD: path.resolve(__dirname, "./build"),
    DEPLOY: path.resolve(__dirname, "./dist_beta"),
    PACKAGE: path.resolve(__dirname, "./packages"),
    EMULATOR: path.resolve(ZPE_PORT, "emulator"),
    EDITOR: path.resolve(ZPE_PORT, "editor"),
    PORT: ZPE_PORT,
    DATA: path.resolve(__dirname, "./data"),
    PATHNAME: `prev/`,
    ASSETS: `/assets/`
};

module.exports = function (env, argv) {
    const IS_DEV = env.development ? true : false;
    const IS_DEPLOY = env.deploy ? true : false;
    const IS_BUILD = env.production && !env.deploy ? true : false;
    const SERVER_PORT = env.port || 8080;
    const MODE = IS_DEV ? "development" : "production";

    return {
        mode: MODE,
        devtool: IS_DEV ? "cheap-module-source-map" : false,
        entry: {
            entry: path.resolve(PATHS.SRC, "main.ts")
        },
        output: {
            libraryTarget: "amd",
            path: IS_DEV
                ? path.resolve(PATHS.BUILD, PATHS.PATHNAME)
                : IS_DEPLOY
                  ? PATHS.DEPLOY
                  : PATHS.BUILD,
            filename: "entry.js",
            clean: {
                keep: /.git|.github|.gitignore|README.md/
            }
        },
        externals: {
            // jquery: "jquery:3"
        },
        resolve: {
            alias: {
                "~": path.join(PATHS.SRC),
                "@": path.join(PATHS.PACKAGE)
            },
            modules: ["packages", "node_modules", "src"],
            extensions: [".ts", ".tsx", ".js", ".jsx"]
        },
        devServer: {
            static: [
                {
                    directory: path.resolve(PATHS.STATIC),
                    // publicPath: `/${PATHS.PATHNAME}`,
                    publicPath: "/assets/"
                },
                {
                    directory: path.resolve(PATHS.EMULATOR),
                    publicPath: `/${PATHS.PATHNAME}`
                }
            ],
            open: false,
            hot: false,
            host: "0.0.0.0",
            port: SERVER_PORT,
            server: {
                // type: "https",
                // options: {
                //     key: "./ssl/localhost-key.pem",
                //     cert: "./ssl/localhost-cert.pem",
                //     passphrase: "webpack-dev-server"
                // }
            },
            setupMiddlewares: (middlewares, devServer) => {
                if (!devServer) {
                    throw new Error("webpack-dev-server is not defined");
                }

                devServer.app.get(["/", "/index.html"], (req, res) => {
                    res.redirect(
                        301,
                        path.join(`${PATHS.PATHNAME}`, "/index.html")
                    );
                });

                devServer.app.get("/favicon.png", (req, res) => {
                    const faviconFile = path.resolve(
                        PATHS.EMULATOR,
                        "favicon.png"
                    );
                    res.sendFile(faviconFile);
                });

                devServer.app.get(`/engine.json`, (req, res) => {
                    if (IS_DEV && env.engine) {
                        const engineFile = path.resolve(PATHS.DATA, env.engine);
                        res.sendFile(engineFile);
                    } else {
                        const defaultEngineFile = path.resolve(
                            PATHS.STATIC,
                            "engine.json"
                        );
                        res.sendFile(defaultEngineFile);
                    }
                });

                devServer.app.get(`/savedata.json`, (req, res) => {
                    const savedataFile = path.resolve(
                        PATHS.DATA,
                        env.savedata || "savedata.json"
                    );
                    if (fs.existsSync(savedataFile)) {
                        res.sendFile(savedataFile);
                    } else {
                        console.log(
                            "\x1b[35m[devServerMid] Savedata file not found, returning null:",
                            savedataFile,
                            "\x1b[0m"
                        );
                        res.send("null");
                    }
                });

                return middlewares;
            }
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true
                    },
                    exclude: /node_modules/
                },
                {
                    test: /\.css$/i,
                    use: [
                        IS_DEV || IS_BUILD
                            ? {
                                  loader: "style-loader",
                                  options: {
                                      injectType: "singletonStyleTag",
                                      insert: "body"
                                  }
                              }
                            : {
                                  loader: MiniCssExtractPlugin.loader,
                                  options: {
                                      publicPath: PATHS.PATHNAME
                                  }
                              },
                        {
                            loader: "css-loader",
                            options: {
                                url: false,
                                modules: {
                                    mode: "local",
                                    localIdentName: "[local]__[hash:base64:6]"
                                }
                            }
                        },
                        IS_DEV || IS_BUILD
                            ? {
                                  loader: "postcss-loader",
                                  options: {
                                      postcssOptions: {
                                          plugins: [
                                              [
                                                  "postcss-scopify",
                                                  { scope: ":global(.p3056)" }
                                              ],
                                              [
                                                  "postcss-url",
                                                  {
                                                      url: (asset) => {
                                                          if (
                                                              asset.url.startsWith(
                                                                  "data:"
                                                              )
                                                          ) {
                                                              return asset.url;
                                                          }
                                                          return `${PATHS.ASSETS}${asset.url}`;
                                                      }
                                                  }
                                              ]
                                          ]
                                      }
                                  }
                              }
                            : null
                    ]
                }
            ]
        },
        plugins: [
            new ZpePortUpdatePlugin(),

            new MiniCssExtractPlugin({
                filename: "[name].css"
            }),

            new DefinePlugin({
                __MODE__: JSON.stringify(MODE)
            }),

            new CopyPlugin({
                patterns: [
                    {
                        from: PATHS.STATIC,
                        to: "./",
                        info: { minimized: true },
                        globOptions: {
                            ignore: ["*.DS_Store"]
                        }
                    },
                    ...(IS_DEPLOY
                        ? [
                              {
                                  from: path.resolve(PATHS.EDITOR, "editor.js"),
                                  to: "./editor.js",
                                  info: { minimized: true }
                              }
                          ]
                        : []),
                    ...(IS_DEV || IS_BUILD
                        ? [
                              {
                                  from: path.resolve(PATHS.EDITOR),
                                  to: "./",
                                  info: { minimized: true },
                                  filter: async (resourcePath) => {
                                      const relativePath = path.relative(
                                          PATHS.EMULATOR,
                                          resourcePath
                                      );
                                      return ![
                                          "favicon.png",
                                          ".DS_Store"
                                      ].includes(relativePath);
                                  }
                              },
                              {
                                  from: path.resolve(PATHS.EMULATOR),
                                  to: "./",
                                  info: { minimized: true },
                                  filter: async (resourcePath) => {
                                      const relativePath = path.relative(
                                          PATHS.EMULATOR,
                                          resourcePath
                                      );
                                      return ![
                                          "index.html",
                                          "favicon.png",
                                          ".DS_Store"
                                      ].includes(relativePath);
                                  }
                              }
                          ]
                        : []),
                    ...(IS_BUILD
                        ? [
                              {
                                  from: path.resolve(
                                      PATHS.DATA,
                                      "savedata.json"
                                  ),
                                  to: "./",
                                  info: { minimized: true }
                              }
                          ]
                        : [])
                ]
            }),
            IS_DEV || IS_BUILD
                ? new HtmlWebpackPlugin({
                      inject: false,
                      minify: false,
                      title: `${PACKAGE.name} ${PACKAGE.version} - Development`,
                      favicon: path.resolve(PATHS.EMULATOR, "favicon.png"),
                      template: path.resolve(PATHS.EMULATOR, "index.html"),
                      filename: IS_DEV
                          ? path.join(PATHS.PATHNAME, "index.html")
                          : "index.html"
                  })
                : null
        ],
        optimization: {
            minimize: false
        },
        performance: {
            hints: false
        }
    };
};