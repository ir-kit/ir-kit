import { assertPrintedMatchesSnapshot, f, file, id } from '../utils';

describe('binary expression', () => {
  it('arithmetic precedence', async () => {
    const node = f.createFunctionDeclaration(
      'sum',
      [],
      undefined,
      undefined,
      f.createBinaryExpression(id('a'), '+', f.createBinaryExpression(id('b'), '*', id('c'))),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'arithmetic.kt');
  });

  it('logical conjunction', async () => {
    const node = f.createFunctionDeclaration(
      'valid',
      [],
      undefined,
      undefined,
      f.createBinaryExpression(
        f.createBinaryExpression(id('a'), '>=', f.createLiteral('0', 'int')),
        '&&',
        f.createBinaryExpression(id('a'), '<=', f.createLiteral('100', 'int')),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'logical.kt');
  });

  it('range operator', async () => {
    const node = f.createFunctionDeclaration(
      'span',
      [],
      undefined,
      undefined,
      f.createBinaryExpression(f.createLiteral('1', 'int'), '..', f.createLiteral('10', 'int')),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'range.kt');
  });
});
