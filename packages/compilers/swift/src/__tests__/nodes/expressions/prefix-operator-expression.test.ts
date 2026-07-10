import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('prefix operator expression', () => {
  it('negates an operand', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          initializer: swift.factory.createPrefixOperatorExpression(
            '-',
            swift.factory.createIdentifier('value'),
          ),
          pattern: 'example',
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'prefix-operator-expression.swift');
  });
});
