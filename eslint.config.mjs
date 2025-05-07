import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // Disable exhaustive-deps warning for useEffect
      "react-hooks/exhaustive-deps": "off",

      // Allow raw <img> usage (not recommended, but you asked)
      "@next/next/no-img-element": "off",

      // Allow unescaped entities like `'`
      "react/no-unescaped-entities": "off",

      // Allow empty object types in TypeScript
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];

export default eslintConfig;
