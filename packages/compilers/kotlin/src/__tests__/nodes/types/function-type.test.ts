import { assertPrintedMatchesSnapshot, f, file } from '../utils';

describe('FunctionType', () => {
  it('plain and named parameter function types', async () => {
    const predicate = f.createTypeAlias(
      'Predicate',
      f.createFunctionType([{ type: f.createUserType('Int') }], f.createUserType('Boolean')),
    );
    const handler = f.createTypeAlias(
      'Handler',
      f.createFunctionType(
        [
          { name: 'event', type: f.createUserType('String') },
          { name: 'count', type: f.createUserType('Int') },
        ],
        f.createUserType('Unit'),
      ),
    );
    await assertPrintedMatchesSnapshot(file([predicate, handler]), 'plain-and-named.kt');
  });

  it('receiver function type', async () => {
    const builder = f.createTypeAlias(
      'Builder',
      f.createFunctionType([], f.createUserType('Unit'), f.createUserType('StringBuilder')),
    );
    await assertPrintedMatchesSnapshot(file([builder]), 'receiver.kt');
  });
});
