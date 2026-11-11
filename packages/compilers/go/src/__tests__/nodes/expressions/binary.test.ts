import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('binary expression', () => {
  it('addition', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'sum',
          go.factory.createBinaryExpression(
            go.factory.createLiteral(5),
            '+',
            go.factory.createLiteral(3),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('sum')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'addition.go');
  });

  it('subtraction', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'difference',
          go.factory.createBinaryExpression(
            go.factory.createLiteral(10),
            '-',
            go.factory.createLiteral(4),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('difference')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'subtraction.go');
  });

  it('multiplication', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'product',
          go.factory.createBinaryExpression(
            go.factory.createLiteral(6),
            '*',
            go.factory.createLiteral(7),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('product')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'multiplication.go');
  });

  it('with variables', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration(
          ['a', 'b'],
          [go.factory.createLiteral(1), go.factory.createLiteral(10)],
        ),
        go.factory.createShortVarDeclaration(
          'result',
          go.factory.createBinaryExpression(
            go.factory.createIdentifier('a'),
            '+',
            go.factory.createIdentifier('b'),
          ),
        ),
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
    await assertPrintedMatchesSnapshot(file, 'with-variables.go');
  });

  it('nested expressions', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'complex',
          go.factory.createBinaryExpression(
            go.factory.createBinaryExpression(
              go.factory.createLiteral(2),
              '*',
              go.factory.createLiteral(3),
            ),
            '+',
            go.factory.createLiteral(4),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('complex')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'nested-expressions.go');
  });
});
