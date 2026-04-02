import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import scrape from "website-scraper";
import WebsiteScraperExistingDirectoryPlugin from "website-scraper-existing-directory";

const siteUrls = [
  "https://www.groundedwithin.ca/",
  "https://www.groundedwithin.ca/blank",
  "https://www.groundedwithin.ca/blank-1",
  "https://www.groundedwithin.ca/blank-2",
  "https://www.groundedwithin.ca/blank-3",
  "https://www.groundedwithin.ca/blank-4",
  "https://www.groundedwithin.ca/blank-5",
  "https://www.groundedwithin.ca/blank-6",
];

const allowedHostnames = new Set([
  "www.groundedwithin.ca",
  "groundedwithin.ca",
  "static.wixstatic.com",
  "static.parastorage.com",
  "siteassets.parastorage.com",
  "pages.parastorage.com",
  "staticorigin.wixstatic.com",
  "www-groundedwithin-ca.filesusr.com",
]);

const siteRoot = path.resolve("www.groundedwithin.ca");

await scrape({
  urls: siteUrls.map((url) => ({ url })),
  directory: ".",
  recursive: false,
  maxDepth: 1,
  prettifyUrls: true,
  filenameGenerator: "bySiteStructure",
  requestConcurrency: 8,
  plugins: [new WebsiteScraperExistingDirectoryPlugin()],
  urlFilter: (resourceUrl) => {
    try {
      const parsedUrl = new URL(resourceUrl);
      return allowedHostnames.has(parsedUrl.hostname);
    } catch {
      return false;
    }
  },
});

const internalSitePattern = /href=(["'])(https?:\/\/(?:www\.)?groundedwithin\.ca([^"'#?]*)([^"']*))\1/gi;

function toLocalHref(fromHtmlPath, targetUrl) {
  const fromDir = path.dirname(fromHtmlPath);
  const url = new URL(targetUrl);
  const targetPathname = url.pathname === "/" ? "" : url.pathname.replace(/^\/+/, "");
  const targetDir = path.join(siteRoot, targetPathname);
  let relativePath = path.relative(fromDir, targetDir).replace(/\\/g, "/");

  if (!relativePath) {
    relativePath = ".";
  }

  if (!relativePath.startsWith(".")) {
    relativePath = `./${relativePath}`;
  }

  if (!relativePath.endsWith("/")) {
    relativePath = `${relativePath}/`;
  }

  return `${relativePath}${url.search}${url.hash}`;
}

async function walkHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkHtmlFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }

  return files;
}

for (const htmlFile of await walkHtmlFiles(siteRoot)) {
  const html = await readFile(htmlFile, "utf8");
  const rewritten = html.replace(internalSitePattern, (_match, quote, absoluteUrl) => {
    const localHref = toLocalHref(htmlFile, absoluteUrl);
    return `href=${quote}${localHref}${quote}`;
  });

  if (rewritten !== html) {
    await writeFile(htmlFile, rewritten);
  }
}

await writeFile(
  "index.html",
  `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=./www.groundedwithin.ca/">
    <title>Grounded Within Mirror</title>
    <script>
      window.location.replace("./www.groundedwithin.ca/");
    </script>
  </head>
  <body>
    <p><a href="./www.groundedwithin.ca/">Open the mirrored site</a></p>
  </body>
</html>
`,
);
