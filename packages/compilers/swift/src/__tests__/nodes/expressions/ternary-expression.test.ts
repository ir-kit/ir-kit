import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('ternary expression', () => {
  it('selects between two values', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'example',
          value: swift.factory.createTernaryExpression(
            swift.factory.createIdentifier('flag'),
            swift.factory.createIntegerLiteral('1'),
            swift.factory.createIntegerLiteral('2'),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'ternary-expression.swift');
  });
});
