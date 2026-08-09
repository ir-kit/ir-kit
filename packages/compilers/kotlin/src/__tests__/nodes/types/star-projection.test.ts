import { assertPrintedMatchesSnapshot, f, file } from '../utils';

describe('StarProjection', () => {
  it('star projection as type argument', async () => {
    const anyList = f.createTypeAlias(
      'AnyList',
      f.createUserType('List', [f.createStarProjection()]),
    );
    const anyMap = f.createTypeAlias(
      'AnyMap',
      f.createUserType('Map', [f.createUserType('String'), f.createStarProjection()]),
    );
    await assertPrintedMatchesSnapshot(file([anyList, anyMap]), 'star-projection.kt');
  });
});
