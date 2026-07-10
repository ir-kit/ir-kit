import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('function call expression', () => {
  it('with labeled and unlabeled arguments', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'example',
          value: swift.factory.createFunctionCallExpression(
            swift.factory.createIdentifier('greet'),
            [
              { expression: swift.factory.createStringLiteral('world') },
              { expression: swift.factory.createIntegerLiteral('2'), label: 'times' },
            ],
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'function-call-expression.swift');
  });
});
