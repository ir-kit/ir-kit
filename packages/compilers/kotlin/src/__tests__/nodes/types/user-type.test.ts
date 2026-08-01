import { assertPrintedMatchesSnapshot, f, file } from '../utils';

describe('UserType', () => {
  it('simple and generic user types', async () => {
    const id = f.createTypeAlias('Id', f.createUserType('String'));
    const lookup = f.createTypeAlias(
      'Lookup',
      f.createUserType('Map', [f.createUserType('String'), f.createUserType('Int')]),
    );
    await assertPrintedMatchesSnapshot(file([id, lookup]), 'simple-and-generic.kt');
  });

  it('nested generic user types', async () => {
    const nested = f.createTypeAlias(
      'Nested',
      f.createUserType('List', [
        f.createUserType('Map', [
          f.createUserType('String'),
          f.createUserType('List', [f.createUserType('Int')]),
        ]),
      ]),
    );
    await assertPrintedMatchesSnapshot(file([nested]), 'nested.kt');
  });
});
