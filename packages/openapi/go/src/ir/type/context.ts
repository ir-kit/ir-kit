import type { TypeCtx as IRTypeCtx } from "@ir-kit/openapi";

import type { GoDecl } from "../../ast/index.js";

export type TypeCtx = IRTypeCtx<GoDecl>;
