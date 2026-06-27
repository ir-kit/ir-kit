import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('block statement', () => {
  it('empty block', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('empty', undefined, undefined, undefined),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createLiteral('ok')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'empty.go');
  });

  it('single statement block', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(
        'single',
        undefined,
        [go.factory.createFunctionReturn(go.factory.createIdentifier('int'))],
        [
          go.factory.createShortVarDeclaration('x', go.factory.createLiteral(0)),
          go.factory.createAssignment(
            [go.factory.createIdentifier('x')],
            [go.factory.createLiteral(1)],
          ),
          go.factory.createReturnStatement(go.factory.createIdentifier('x')),
        ],
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createCallExpression(go.factory.createIdentifier('single'), [])],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'single-statement.go');
  });

  it('multiple statements block', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(
        'multiple',
        undefined,
        [go.factory.createFunctionReturn(go.factory.createIdentifier('int'))],
        [
          go.factory.createShortVarDeclaration('x', go.factory.createLiteral(5)),
          go.factory.createShortVarDeclaration('y', go.factory.createLiteral(10)),
          go.factory.createShortVarDeclaration('result', go.factory.createLiteral(0)),
          go.factory.createAssignment(
            [go.factory.createIdentifier('result')],
            [
              go.factory.createBinaryExpression(
                go.factory.createIdentifier('x'),
                '+',
                go.factory.createIdentifier('y'),
              ),
            ],
          ),
          go.factory.createReturnStatement(go.factory.createIdentifier('result')),
        ],
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createCallExpression(go.factory.createIdentifier('multiple'), [])],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'multiple-statements.go');
  });
});
