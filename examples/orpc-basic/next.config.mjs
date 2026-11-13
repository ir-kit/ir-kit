import withTtsc from "@ttsc/unplugin/next";

/** @type {import('next').NextConfig} */
export default withTtsc(
  {},
  { plugins: [{ transform: "typia/lib/transform" }] },
);
