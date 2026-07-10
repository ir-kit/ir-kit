import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('dictionary literal expression', () => {
  it('bound to a constant', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'example',
          value: swift.factory.createDictionaryLiteral([
            {
              key: swift.factory.createStringLiteral('a'),
              value: swift.factory.createIntegerLiteral('1'),
            },
            {
              key: swift.factory.createStringLiteral('b'),
              value: swift.factory.createIntegerLiteral('2'),
            },
          ]),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'dictionary-literal.swift');
  });
});
