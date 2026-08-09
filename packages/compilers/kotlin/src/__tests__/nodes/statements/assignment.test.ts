import { assertPrintedMatchesSnapshot, f, file, id } from '../utils';

describe('assignment', () => {
  it('simple and compound assignment', async () => {
    const node = f.createFunctionDeclaration('update', [], undefined, [
      f.createAssignment(id('count'), f.createLiteral('0', 'int')),
      f.createAssignment(id('total'), id('count'), '+='),
    ]);
    await assertPrintedMatchesSnapshot(file([node]), 'assignment.kt');
  });
});
