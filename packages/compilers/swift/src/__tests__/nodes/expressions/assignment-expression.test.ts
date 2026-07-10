import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('assignment expression', () => {
  it('assigns to a mutable variable', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration('run', [], undefined, [
        swift.factory.createVariableDeclaration('var', [
          { name: 'count', value: swift.factory.createIntegerLiteral('0') },
        ]),
        swift.factory.createExpressionStatement(
          swift.factory.createAssignmentExpression(
            swift.factory.createIdentifier('count'),
            swift.factory.createIntegerLiteral('1'),
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'assignment-expression.swift');
  });
});
