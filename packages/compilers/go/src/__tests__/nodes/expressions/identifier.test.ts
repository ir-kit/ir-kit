import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('identifier', () => {
  it('simple variable', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createConstDeclaration([{ name: 'value', value: go.factory.createLiteral(10) }]),
        go.factory.createShortVarDeclaration('result', go.factory.createIdentifier('value')),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('result')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple-variable.go');
  });

  it('camelCase variable', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('myVariable', go.factory.createLiteral(123)),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('myVariable')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'camelCase-variable.go');
  });

  it('exported variable', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('ExportedVar', go.factory.createLiteral('exported')),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('ExportedVar')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'exported-variable.go');
  });
});
