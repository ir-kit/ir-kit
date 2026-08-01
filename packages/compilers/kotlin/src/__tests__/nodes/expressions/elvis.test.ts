import { assertPrintedMatchesSnapshot, f, file, id } from '../utils';

describe('elvis expression', () => {
  it('default value', async () => {
    const node = f.createFunctionDeclaration(
      'name',
      [f.createParameter('user', f.createNullableType(f.createUserType('User')))],
      f.createUserType('String'),
      undefined,
      f.createElvisExpression(
        f.createNavigationExpression(id('user'), id('name'), true),
        f.createStringLiteral([{ text: 'anon' }]),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'default-value.kt');
  });

  it('fallback literal', async () => {
    const node = f.createFunctionDeclaration(
      'count',
      [],
      undefined,
      undefined,
      f.createElvisExpression(id('size'), f.createLiteral('0', 'int')),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'fallback.kt');
  });
});
