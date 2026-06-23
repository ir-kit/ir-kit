import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('source file', () => {
  it('simple', async () => {
    const file = swift.factory.createSourceFile([]);
    await assertPrintedMatchesSnapshot(file, 'simple.swift');
  });
});
