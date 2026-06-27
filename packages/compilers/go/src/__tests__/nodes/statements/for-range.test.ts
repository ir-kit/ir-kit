import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('for range statement', () => {
  it('no targets: for range xs', async () => {
    const arrayType = go.factory.createArrayType(go.factory.createIdentifier('int'), '...');
    const xs = go.factory.createCompositeLiteral(
      [go.factory.createLiteral(1), go.factory.createLiteral(2)],
      arrayType,
    );
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createForRangeStatement(xs, [
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier('fmt'),
                go.factory.createIdentifier('Println'),
              ),
              [go.factory.createLiteral('ok')],
            ),
          ),
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'no-targets.go');
  });

  it('single target: for v := range xs', async () => {
    const sliceType = go.factory.createArrayType(go.factory.createIdentifier('int'));
    const xs = go.factory.createCompositeLiteral(
      [go.factory.createLiteral(3), go.factory.createLiteral(4)],
      sliceType,
    );
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createForRangeStatement(
          xs,
          [
            go.factory.createExpressionStatement(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('fmt'),
                  go.factory.createIdentifier('Println'),
                ),
                [go.factory.createIdentifier('v')],
              ),
            ),
          ],
          ['v'],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'single-target.go');
  });

  it('two targets: for i, v := range xs', async () => {
    const sliceType = go.factory.createArrayType(go.factory.createIdentifier('int'));
    const xs = go.factory.createCompositeLiteral(
      [go.factory.createLiteral(5), go.factory.createLiteral(6)],
      sliceType,
    );
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createForRangeStatement(
          xs,
          [
            go.factory.createExpressionStatement(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('fmt'),
                  go.factory.createIdentifier('Println'),
                ),
                [go.factory.createIdentifier('i'), go.factory.createIdentifier('v')],
              ),
            ),
          ],
          ['i', 'v'],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'two-targets.go');
  });
});
