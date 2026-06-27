import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('source file', () => {
  it('simple', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('a', go.factory.createLiteral(1)),
        go.factory.createShortVarDeclaration('b', go.factory.createLiteral(2)),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [
              go.factory.createBinaryExpression(
                go.factory.createIdentifier('a'),
                '+',
                go.factory.createIdentifier('b'),
              ),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple.go');
  });

  it('with custom package name', async () => {
    const file = go.factory.createSourceFile('mypackage', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [
            go.factory.createVariableDeclaration(
              'greeting',
              go.factory.createIdentifier('string'),
              go.factory.createLiteral('Hello, World!'),
            ),
          ],
          go.NodeFlags.Const,
        ),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('greeting')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-package-name.go');
  });
});
