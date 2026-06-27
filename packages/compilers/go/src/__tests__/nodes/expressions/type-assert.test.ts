import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('type assertion', () => {
  it('asserts a concrete type', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVariableStatement(
          undefined,
          go.factory.createVariableDeclarationList(
            [
              go.factory.createVariableDeclaration(
                'i',
                go.factory.createIdentifier('any'),
                go.factory.createLiteral('hello'),
              ),
            ],
            go.NodeFlags.Var,
          ),
        ),
        go.factory.createShortVarDeclaration(
          's',
          go.factory.createTypeAssertExpression(
            go.factory.createIdentifier('i'),
            go.factory.createIdentifier('string'),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('s')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'type-assert.go');
  });
});
