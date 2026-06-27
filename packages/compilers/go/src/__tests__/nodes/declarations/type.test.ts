import { go } from '../../..';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('type declaration', () => {
  it('basic', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration('UserID', go.factory.createIdentifier('int')),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVarDeclaration([
          {
            name: 'id',
            type: go.factory.createIdentifier('UserID'),
            value: go.factory.createLiteral(123),
          },
        ]),
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
});
