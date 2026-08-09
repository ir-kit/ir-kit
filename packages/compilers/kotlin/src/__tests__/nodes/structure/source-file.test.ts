import { kt } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('source file', () => {
  it('simple', async () => {
    const file = kt.factory.createSourceFile([], kt.factory.createPackageHeader('com.example'));
    await assertPrintedMatchesSnapshot(file, 'simple.kt');
  });
});
