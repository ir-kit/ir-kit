import { assertPrintedMatchesSnapshot, f, file, id } from '../utils';

describe('navigation expression', () => {
  it('property access', async () => {
    const node = f.createFunctionDeclaration(
      'name',
      [f.createParameter('user', f.createUserType('User'))],
      undefined,
      undefined,
      f.createNavigationExpression(id('user'), id('name')),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'property-access.kt');
  });

  it('safe call', async () => {
    const node = f.createFunctionDeclaration(
      'length',
      [f.createParameter('text', f.createNullableType(f.createUserType('String')))],
      f.createNullableType(f.createUserType('Int')),
      undefined,
      f.createNavigationExpression(id('text'), id('length'), true),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'safe-call.kt');
  });

  it('chained access', async () => {
    const node = f.createFunctionDeclaration(
      'city',
      [f.createParameter('user', f.createUserType('User'))],
      undefined,
      undefined,
      f.createNavigationExpression(
        f.createNavigationExpression(id('user'), id('address')),
        id('city'),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'chained.kt');
  });
});
