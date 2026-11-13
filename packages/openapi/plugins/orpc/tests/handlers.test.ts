import { describe, expect, it } from "vitest";

import {
  buildFile,
  type FileGenContext,
  patchFile,
} from "../src/generators/handlers/ast.js";

const base: FileGenContext = {
  tag: "pet",
  procedures: ["addPet", "getPet"],
  implementer: { name: "os", from: "../server.gen" },
  mode: "stub",
  clientName: "client",
};

describe("buildFile", () => {
  it("writes stub handlers", () => {
    expect(buildFile(base)).toBe(`import { ORPCError } from '@orpc/server';
import { os } from '../server.gen';

const pet = {
  addPet: os.pet.addPet.handler(async () => {
    throw new ORPCError('NOT_IMPLEMENTED');
  }),
  getPet: os.pet.getPet.handler(async () => {
    throw new ORPCError('NOT_IMPLEMENTED');
  })
};

export default pet;
`);
  });

  it("writes proxy and faker handlers", () => {
    const proxy = buildFile({
      ...base,
      mode: "proxy",
      proxyConfig: { clientImport: { name: "client", from: "../client" } },
    });
    expect(proxy).toContain("import { client } from '../client';");
    expect(proxy).toContain(
      "addPet: os.pet.addPet.handler(async ({ input }) => client.pet.addPet(input)),",
    );

    const faker = buildFile({
      ...base,
      mode: "faker",
      fakerFactoryNames: new Map([["addPet", "mockAddPetResponse"]]),
      fakerGenImport: "../faker.gen",
    });
    expect(faker).toContain(
      "import { mockAddPetResponse } from '../faker.gen';",
    );
    expect(faker).toContain(
      "addPet: os.pet.addPet.handler(async () => mockAddPetResponse()),",
    );
    expect(faker).toContain(
      "getPet: os.pet.getPet.handler(async () => mockGetPet())",
    );
  });

  it("renames handler objects named after reserved words", () => {
    expect(buildFile({ ...base, tag: "default" })).toContain(
      "export default defaultHandlers;",
    );
  });
});

describe("patchFile", () => {
  it("appends missing handlers in the file's own indent and keeps user code", () => {
    const source = `import { os } from "../server.gen";

// héllo
export const pet = {
\taddPet: os.pet.addPet.handler(async () => ({ id: 1 })),
};

export default pet;
`;
    expect(
      patchFile(source, base, ["getPet"]),
    ).toBe(`import { os } from "../server.gen";

// héllo
export const pet = {
\taddPet: os.pet.addPet.handler(async () => ({ id: 1 })),

\tgetPet: os.pet.getPet.handler(async () => {
\t\tthrow new ORPCError('NOT_IMPLEMENTED');
\t}),
};

export default pet;
`);
  });

  it("adds the comma a last property without one needs", () => {
    const source = `const pet = {\n  addPet: 1\n};\n`;
    expect(patchFile(source, { ...base, mode: "faker" }, ["getPet"])).toBe(
      `const pet = {\n  addPet: 1,\n\n  getPet: os.pet.getPet.handler(async () => mockGetPet()),\n};\n`,
    );
  });

  it("leaves files without the handler object alone", () => {
    expect(patchFile("export {};\n", base, ["getPet"])).toBe("export {};\n");
  });
});
