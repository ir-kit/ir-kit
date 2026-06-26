import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('comment', () => {
  it('simple', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createFunctionDeclaration(
        'main',
        undefined,
        undefined,
        [go.factory.createComment('This is a comment')],
        undefined,
        undefined,
        ['This is a leading comment'],
        ['This is a trailing comment'],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple.go');
  });
});
