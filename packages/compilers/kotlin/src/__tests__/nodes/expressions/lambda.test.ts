import { assertPrintedMatchesSnapshot, f, file, id } from '../utils';

describe('lambda expression', () => {
  it('implicit it parameter', async () => {
    const node = f.createFunctionDeclaration(
      'evens',
      [],
      undefined,
      undefined,
      f.createCallExpression(
        f.createNavigationExpression(id('numbers'), id('filter')),
        undefined,
        undefined,
        f.createLambdaExpression([
          f.createExpressionStatement(
            f.createBinaryExpression(id('it'), '>', f.createLiteral('0', 'int')),
          ),
        ]),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'implicit-it.kt');
  });

  it('explicit parameters', async () => {
    const node = f.createFunctionDeclaration(
      'total',
      [],
      undefined,
      undefined,
      f.createCallExpression(
        f.createNavigationExpression(id('numbers'), id('fold')),
        [{ expression: f.createLiteral('0', 'int') }],
        undefined,
        f.createLambdaExpression(
          [f.createExpressionStatement(f.createBinaryExpression(id('acc'), '+', id('n')))],
          [{ name: 'acc' }, { name: 'n' }],
        ),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'explicit-parameters.kt');
  });
});
