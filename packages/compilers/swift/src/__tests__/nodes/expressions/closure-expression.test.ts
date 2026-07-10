import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('closure expression', () => {
  it('with a parameter and a body', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'example',
          value: swift.factory.createClosureExpression(
            ['x'],
            [swift.factory.createExpressionStatement(swift.factory.createIdentifier('x'))],
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'closure-expression.swift');
  });

  it('capture list with weak self', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration('Worker', [
        swift.factory.createFunctionDeclaration('run', [], undefined, []),
        swift.factory.createFunctionDeclaration('schedule', [], undefined, [
          swift.factory.createVariableDeclaration('let', [
            {
              name: 'c',
              value: swift.factory.createClosureExpression(
                [],
                [
                  swift.factory.createExpressionStatement(
                    swift.factory.createFunctionCallExpression(
                      swift.factory.createMemberAccessExpression(
                        swift.factory.createPostfixOperatorExpression(
                          swift.factory.createSelfExpression(),
                          '?',
                        ),
                        'run',
                      ),
                      [],
                    ),
                  ),
                ],
                [{ name: 'self', specifier: 'weak' }],
              ),
            },
          ]),
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'capture-list-weak-self.swift');
  });
});
