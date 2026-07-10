import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('macro expansion expression', () => {
  it('freestanding macro with argument', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'u',
          value: swift.factory.createMacroExpansionExpression('URL', [
            { expression: swift.factory.createStringLiteral('https://x.com') },
          ]),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'freestanding-macro.swift');
  });
});
