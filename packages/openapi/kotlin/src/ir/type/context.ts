import type { TypeCtx as IRTypeCtx } from "@ir-kit/openapi";

import type { KtDecl } from "../../ast/index.js";

export type TypeCtx = IRTypeCtx<KtDecl>;
