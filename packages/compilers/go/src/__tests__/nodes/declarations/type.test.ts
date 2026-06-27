import { go } from '../../..';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('type declaration', () => {
  it('basic', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec('UserID', go.factory.createIdentifier('int')),
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVariableStatement(
          undefined,
          go.factory.createVariableDeclarationList(
            [
              go.factory.createVariableDeclaration(
                'id',
                go.factory.createIdentifier('UserID'),
                go.factory.createLiteral(123),
              ),
            ],
            go.NodeFlags.Var,
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('id')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'basic.go');
  });

  it('grouped type block', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec('UserID', go.factory.createIdentifier('int')),
        go.factory.createTypeSpec('Celsius', go.factory.createIdentifier('float64')),
        go.factory.createTypeSpec('Name', go.factory.createIdentifier('string')),
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVariableStatement(
          undefined,
          go.factory.createVariableDeclarationList(
            [
              go.factory.createVariableDeclaration(
                'id',
                go.factory.createIdentifier('UserID'),
                go.factory.createLiteral(1),
              ),
            ],
            go.NodeFlags.Var,
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('id')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'grouped-type.go');
  });
});
