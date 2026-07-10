import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('multiline string literal', () => {
  it('bound to a property', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'doc',
          value: swift.factory.createMultilineStringLiteral(['Line one', 'Line two']),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'bound-to-property.swift');
  });
});
