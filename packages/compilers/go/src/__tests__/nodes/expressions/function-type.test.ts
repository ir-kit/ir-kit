import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('function type', () => {
  it('type alias', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        {
          name: 'Option',
          type: go.factory.createFunctionType(
            [go.factory.createIdentifier('int')],
            [go.factory.createFunctionReturn(go.factory.createIdentifier('error'))],
          ),
        },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVarDeclaration([
          { name: 'opt', type: go.factory.createIdentifier('Option') },
        ]),
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
        {
          name: 'Handler',
          type: go.factory.createFunctionType(undefined, [
            go.factory.createFunctionReturn(go.factory.createIdentifier('int')),
            go.factory.createFunctionReturn(go.factory.createIdentifier('error')),
          ]),
        },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVarDeclaration([
          { name: 'h', type: go.factory.createIdentifier('Handler') },
        ]),
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
        {
          name: 'Client',
          type: go.factory.createStructType([
            {
              names: ['Editor'],
              type: go.factory.createFunctionType(
                [go.factory.createIdentifier('int')],
                [go.factory.createFunctionReturn(go.factory.createIdentifier('error'))],
              ),
            },
          ]),
        },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
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
