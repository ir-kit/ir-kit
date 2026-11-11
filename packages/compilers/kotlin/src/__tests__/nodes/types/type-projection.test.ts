import { assertPrintedMatchesSnapshot, f, file } from '../utils';

describe('TypeProjection', () => {
  it('out and in variance type arguments', async () => {
    const producer = f.createTypeAlias(
      'Producer',
      f.createUserType('Array', [f.createTypeProjection('out', f.createUserType('String'))]),
    );
    const consumer = f.createTypeAlias(
      'Consumer',
      f.createUserType('MutableList', [f.createTypeProjection('in', f.createUserType('Number'))]),
    );
    await assertPrintedMatchesSnapshot(file([producer, consumer]), 'out-and-in.kt');
  });
});
