import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('tuple expression', () => {
  it('with labeled elements', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'example',
          value: swift.factory.createTupleExpression([
            { expression: swift.factory.createIntegerLiteral('1'), label: 'x' },
            { expression: swift.factory.createIntegerLiteral('2'), label: 'y' },
          ]),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'tuple-expression.swift');
  });
});
