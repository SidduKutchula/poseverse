import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(app, server) {
  const viteConfigPath = path.resolve(__dirname, "../vite.config.js");
  
  // Dynamically import vite.config.js or parse it
  let viteConfig = {};
  try {
    const configModule = await import("../vite.config.js");
    viteConfig = configModule.default || configModule;
  } catch (error) {
    console.warn("Failed to dynamically import vite.config.js, using defaults:", error.message);
  }

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(__dirname, "../client/index.html");

      // Reload the index.html from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      
      // Point index.html to the entry main.jsx
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.jsx?v=${Date.now()}"`
      );
      
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

export function serveStatic(app) {
  const distPath = path.resolve(__dirname, "../dist/public");
  
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}. Make sure to build the client first.`
    );
  }

  app.use(express.static(distPath));

  app.use("*", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
