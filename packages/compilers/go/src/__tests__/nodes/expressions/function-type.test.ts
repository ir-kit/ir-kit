import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('function type', () => {
  it('type alias', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec(
          'Option',
          go.factory.createFunctionType(
            [go.factory.createIdentifier('int')],
            [go.factory.createFunctionReturn(go.factory.createIdentifier('error'))],
          ),
        ),
      ]),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createVariableStatement(
          undefined,
          go.factory.createVariableDeclarationList(
            [go.factory.createVariableDeclaration('opt', go.factory.createIdentifier('Option'))],
            go.NodeFlags.Var,
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('opt')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'type-alias.go');
  });

  it('multiple return values', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec(
          'Handler',
          go.factory.createFunctionType(undefined, [
            go.factory.createFunctionReturn(go.factory.createIdentifier('int')),
            go.factory.createFunctionReturn(go.factory.createIdentifier('error')),
          ]),
        ),
      ]),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createVariableStatement(
          undefined,
          go.factory.createVariableDeclarationList(
            [go.factory.createVariableDeclaration('h', go.factory.createIdentifier('Handler'))],
            go.NodeFlags.Var,
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('h')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'multiple-return-values.go');
  });

  it('struct field', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec(
          'Client',
          go.factory.createStructType([
            {
              names: ['Editor'],
              type: go.factory.createFunctionType(
                [go.factory.createIdentifier('int')],
                [go.factory.createFunctionReturn(go.factory.createIdentifier('error'))],
              ),
            },
          ]),
        ),
      ]),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'c',
          go.factory.createCompositeLiteral([], go.factory.createIdentifier('Client')),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('c')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'struct-field.go');
  });
});
