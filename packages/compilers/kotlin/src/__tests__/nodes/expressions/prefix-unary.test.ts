import { assertPrintedMatchesSnapshot, f, file, id } from '../utils';

describe('prefix unary expression', () => {
  it('logical negation', async () => {
    const node = f.createFunctionDeclaration(
      'invert',
      [f.createParameter('flag', f.createUserType('Boolean'))],
      f.createUserType('Boolean'),
      undefined,
      f.createPrefixUnaryExpression('!', id('flag')),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'negation.kt');
  });

  it('unary minus', async () => {
    const node = f.createFunctionDeclaration(
      'negate',
      [f.createParameter('n', f.createUserType('Int'))],
      f.createUserType('Int'),
      undefined,
      f.createPrefixUnaryExpression('-', id('n')),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'unary-minus.kt');
  });
});
