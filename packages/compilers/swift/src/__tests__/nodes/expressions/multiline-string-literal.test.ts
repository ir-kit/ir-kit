import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('multiline string literal', () => {
  it('bound to a property', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          initializer: swift.factory.createMultilineStringLiteral(['Line one', 'Line two']),
          pattern: 'doc',
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'bound-to-property.swift');
  });
});
