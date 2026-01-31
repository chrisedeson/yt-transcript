import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Rule: Block process.env in client components
  // This catches the most common mistake. The server-only package
  // provides the hard build-time guarantee, but this lint rule
  // catches it earlier in the dev workflow.
  {
    files: ["app/**/*.tsx", "app/**/*.ts", "components/**/*.tsx", "components/**/*.ts", "lib/**/*.tsx", "lib/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "MemberExpression[object.object.name='process'][object.property.name='env']",
          message: "Do not use process.env in client-accessible files. Use server-only lib/config/env.ts instead. If this is a Server Component (no 'use client'), you can suppress this warning."
        }
      ]
    }
  },
]);

export default eslintConfig;
