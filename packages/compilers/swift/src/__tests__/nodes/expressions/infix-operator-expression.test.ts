import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('infix operator expression', () => {
  it('adds two operands', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'example',
          value: swift.factory.createInfixOperatorExpression(
            swift.factory.createIntegerLiteral('1'),
            '+',
            swift.factory.createIntegerLiteral('2'),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'infix-operator-expression.swift');
  });
});
