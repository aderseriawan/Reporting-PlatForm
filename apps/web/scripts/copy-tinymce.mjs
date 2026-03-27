import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const srcDir = resolve(root, "node_modules", "tinymce");
const destDir = resolve(root, "public", "tinymce");

if (!existsSync(srcDir)) {
  console.warn("tinymce package not found, skipping copy");
  process.exit(0);
}

if (!existsSync(resolve(root, "public"))) {
  mkdirSync(resolve(root, "public"), { recursive: true });
}

cpSync(srcDir, destDir, { recursive: true });
console.log("TinyMCE assets copied to public/tinymce");
