import type { TypeCtx as IRTypeCtx } from "@ir-kit/openapi";

import type { GoDecl } from "../../go-dsl/decl/types.js";

export type TypeCtx = IRTypeCtx<GoDecl>;
