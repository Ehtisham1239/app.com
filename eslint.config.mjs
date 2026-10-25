import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  { ignores: [".next/**", "artifacts/**", "node_modules/**", "supabase/functions/**"] },
  {
    rules: {
      "@next/next/no-img-element": "off",
      // React Compiler advisories: the data-loading hooks set state from effects on purpose.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
    },
  },
];

export default eslintConfig;
