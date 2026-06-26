import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('struct composite literals', () => {
  it('anonymous struct literal', async () => {
    const structType = go.factory.createStructType([
      { names: ['A'], type: go.factory.createIdentifier('int') },
      { names: ['B'], type: go.factory.createIdentifier('string') },
    ]);

    const literal = go.factory.createCompositeLiteral(
      [go.factory.createLiteral(1), go.factory.createLiteral('hi')],
      structType,
    );

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('v', literal),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('v')],
          ),
        ),
      ]),
    ]);

    await assertPrintedMatchesSnapshot(file, 'anonymous.go');
  });

  it('anonymous struct literal with keyed elements', async () => {
    const structType = go.factory.createStructType([
      { names: ['A'], type: go.factory.createIdentifier('int') },
      { names: ['B'], type: go.factory.createIdentifier('string') },
    ]);

    const literal = go.factory.createCompositeLiteral(
      [
        go.factory.createKeyValueExpression(
          go.factory.createIdentifier('A'),
          go.factory.createLiteral(1),
        ),
        go.factory.createKeyValueExpression(
          go.factory.createIdentifier('B'),
          go.factory.createLiteral('hi'),
        ),
      ],
      structType,
    );

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('v', literal),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('v')],
          ),
        ),
      ]),
    ]);

    await assertPrintedMatchesSnapshot(file, 'anonymous-keyed.go');
  });
});
