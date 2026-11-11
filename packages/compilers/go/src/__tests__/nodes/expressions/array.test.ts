import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('arrays and slices', () => {
  it('fixed array composite literal [3]int{10,20,30}', async () => {
    const arrayType = go.factory.createArrayType(
      go.factory.createIdentifier('int'),
      go.factory.createLiteral(3),
    );
    const lit = go.factory.createCompositeLiteral(
      [go.factory.createLiteral(10), go.factory.createLiteral(20), go.factory.createLiteral(30)],
      arrayType,
    );
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration('arr', lit),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('arr')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'fixed-array.go');
  });

  it('slice composite literal []int{1,2,3}', async () => {
    const sliceType = go.factory.createArrayType(go.factory.createIdentifier('int'));
    const lit = go.factory.createCompositeLiteral(
      [go.factory.createLiteral(1), go.factory.createLiteral(2), go.factory.createLiteral(3)],
      sliceType,
    );
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration('arr', lit),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('arr')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'slice.go');
  });

  it('elided length composite literal [...]int{4,5}', async () => {
    const elidedType = go.factory.createArrayType(go.factory.createIdentifier('int'), '...');
    const lit = go.factory.createCompositeLiteral(
      [go.factory.createLiteral(4), go.factory.createLiteral(5)],
      elidedType,
    );
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration('arr', lit),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('arr')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'elided.go');
  });
});
