import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('generics (type parameters)', () => {
  it('generic type with instantiation', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        {
          name: 'Stack',
          type: go.factory.createArrayType(go.factory.createIdentifier('T')),
          typeParameters: [{ constraint: go.factory.createIdentifier('any'), names: ['T'] }],
        },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          's',
          go.factory.createCompositeLiteral(
            [],
            go.factory.createGenericType(go.factory.createIdentifier('Stack'), [
              go.factory.createIdentifier('int'),
            ]),
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
    await assertPrintedMatchesSnapshot(file, 'generic-type.go');
  });

  it('generic function with constraints', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createFunctionDeclaration(
        'lookup',
        [
          go.factory.createFunctionParameter(
            ['m'],
            go.factory.createMapType(
              go.factory.createIdentifier('K'),
              go.factory.createIdentifier('V'),
            ),
          ),
          go.factory.createFunctionParameter(['key'], go.factory.createIdentifier('K')),
        ],
        [go.factory.createFunctionReturn(go.factory.createIdentifier('V'))],
        [
          go.factory.createReturnStatement(
            go.factory.createIndexExpression(
              go.factory.createIdentifier('m'),
              go.factory.createIdentifier('key'),
            ),
          ),
        ],
        undefined,
        [
          { constraint: go.factory.createIdentifier('comparable'), names: ['K'] },
          { constraint: go.factory.createIdentifier('any'), names: ['V'] },
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'generic-function.go');
  });

  it('grouped type parameter names with multi-argument instantiation', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        {
          name: 'Pair',
          type: go.factory.createStructType([
            { names: ['First'], type: go.factory.createIdentifier('T') },
            { names: ['Second'], type: go.factory.createIdentifier('U') },
          ]),
          typeParameters: [{ constraint: go.factory.createIdentifier('any'), names: ['T', 'U'] }],
        },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVarDeclaration([
          {
            name: 'p',
            type: go.factory.createGenericType(go.factory.createIdentifier('Pair'), [
              go.factory.createIdentifier('string'),
              go.factory.createIdentifier('int'),
            ]),
          },
        ]),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('p')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'grouped-type-params.go');
  });
});
