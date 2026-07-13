import { createReadStream, existsSync, statSync, writeFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { createServer } from "node:http";

const root = resolve("dist");
const host = process.env.HOST ?? "127.0.0.1";
const preferredPort = Number(process.env.PORT ?? 4173);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
]);

function resolveRequestPath(url = "/") {
  const pathname = decodeURIComponent(new URL(url, `http://${host}`).pathname);
  const requestedPath = normalize(join(root, pathname));

  if (requestedPath !== root && !requestedPath.startsWith(`${root}\\`) && !requestedPath.startsWith(`${root}/`)) {
    return null;
  }

  if (existsSync(requestedPath) && statSync(requestedPath).isFile()) {
    return requestedPath;
  }

  const indexPath = join(requestedPath, "index.html");
  if (existsSync(indexPath)) {
    return indexPath;
  }

  return join(root, "index.html");
}

function createPreviewServer() {
  return createServer((request, response) => {
    const filePath = resolveRequestPath(request.url);

    if (!filePath || !existsSync(filePath)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes.get(extname(filePath)) ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  });
}

function listen(port, attemptsLeft = 10) {
  const server = createPreviewServer();

  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
      server.close();
      listen(port + 1, attemptsLeft - 1);
      return;
    }

    throw error;
  });

  server.listen(port, host, () => {
    const url = `http://${host}:${port}/`;
    writeFileSync(".preview-url.txt", `${url}\n`);
    console.log(`Preview server running at ${url}`);
  });
}

listen(preferredPort);
