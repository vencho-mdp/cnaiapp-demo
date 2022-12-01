export default {
  fallback: true,

  server: {
    port: process.env.PORT || 3000,
  },

  loading: {
    height: "6px",
  },

  components: [{ path: "~/components", global: true }],

  head: {
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
      { "http-equiv": "pragma", content: "no-cache" },
      {
        hid: "description",
        name: "description",
        content:
          "Página oficial de la aplicación del Colegio Nacional Doctor Arturo Illia",
      },
    ],
    link: [{ rel: "icon", type: "image/png", href: "/icon.png" }],
  },

  serverMiddleware: ["~/api/index.js"],

  tailwindcss: {
    viewer: false,
  },

  css: [
    "~/assets/css/transitions.css",
    "~/assets/css/default_text_color.css",
    "~/assets/css/scrollbar.css",
    "~/assets/css/tailwind_abstractions.css",
  ],

  plugins: [
    "~/plugins/local-storage",
    "~/plugins/vuelidate",
    { src: "~/plugins/v-calendar", mode: "client" },
    "~/plugins/axios",
    { src: "~/plugins/pwa-update.js", mode: "client" },
    { src: "~/plugins/error-reporting.js" },
    { src: "~/plugins/directives.js" },
  ],

  buildModules: ["@nuxtjs/tailwindcss", "@nuxtjs/pwa", "@nuxtjs/google-fonts"],

  modules: [
    "@nuxtjs/axios",
    "vue2-editor/nuxt",
    [
      "nuxt-mail",
      {
        message: {
          to: "beniciocardozomdp@gmail.com",
        },
        smtp: {
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
          },
        },
      },
    ],
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    ["nuxt-umami"],
  ],

  umami: {
    websiteId: "1de5c508-bc4f-47e7-b689-05baa109e902",
    scriptUrl: "http://200.0.183.27:4000/umami.js",
  },

  sitemap: {
    gzip: true,
    exclude: ["/dashboard", "/dashboard/**"],
    i18n: false,
  },

  robots: {
    UserAgent: "*",
    Disallow: "/dashboard",
    Sitemap: process.env.BASE_URL + "/sitemap.xml",
  },

  axios: {
    baseUrl: process.env.BASE_URL,
  },

  pwa: {
    workbox: {
      offlineStrategy: "NetworkOnly",
      offline: false,
    },
    manifest: {
      name: "Colegio Nacional Doctor Arturo Illia",
      lang: "es",
    },
  },

  googleFonts: {
    families: {
      Lato: [300, 400, 500, 600, 700],
    },
    overwriting: true,
  },

  build: {
    terser: {
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
    loaders: {
      vue: {
        compilerModules: [
          {
            preTransformNode(astEl) {
              if (process.env.NODE_ENV === "production") {
                const { attrsMap, attrsList } = astEl;
                ["data-test"].forEach((attribute) => {
                  if (attrsMap[attribute]) {
                    delete attrsMap[attribute];
                    const index = attrsList.findIndex(
                      (x) => x.name === attribute
                    );
                    attrsList.splice(index, 1);
                  }
                });
              }
              return astEl;
            },
          },
        ],
      },
    },
    babel: {
      // envName: server, client, modern
      presets() {
        return [
          [
            "@nuxt/babel-preset-app",
            {
              corejs: { version: 3 },
            },
          ],
        ];
      },
    },
    splitChunks: {
      layouts: true,
      pages: true,
      commons: true,
    },
  },
};
