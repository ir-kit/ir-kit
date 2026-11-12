import type { BuiltFile } from "./build.js";

export interface GradleOptions {
  group?: string;
  version?: string;
  jacksonVersion?: string;
}

export function buildGradleFile(opts: GradleOptions = {}): BuiltFile {
  const jackson = opts.jacksonVersion ?? "2.17.2";
  return {
    path: "build.gradle.kts",
    content: `plugins {
    \`java-library\`
}

group = "${opts.group ?? "com.example"}"
version = "${opts.version ?? "0.1.0"}"

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}

repositories {
    mavenCentral()
}

dependencies {
    api("com.fasterxml.jackson.core:jackson-databind:${jackson}")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:${jackson}")
}
`,
  };
}

export function settingsGradleFile(projectName: string): BuiltFile {
  return {
    path: "settings.gradle.kts",
    content: `rootProject.name = "${projectName}"\n`,
  };
}
