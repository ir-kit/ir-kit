import type { SwiftNode } from './nodes/base';

export interface SwiftPrinterOptions {
  /**
   * Maximum line length before the printer wraps elements
   * such as parameters, fields, or list items.
   * Set to `0` to disable wrapping.
   *
   * @default 80
   */
  maxLineLength?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createPrinter(options?: SwiftPrinterOptions) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function printNode(node: SwiftNode): string {
    return 'TODO';
  }

  function printFile(node: SwiftNode): string {
    const parts: Array<string> = [printNode(node), ''];
    return parts.join('\n');
  }

  return {
    printFile,
  };
}

export function printAst(node: SwiftNode): string {
  return JSON.stringify(node, null, 2);
}
