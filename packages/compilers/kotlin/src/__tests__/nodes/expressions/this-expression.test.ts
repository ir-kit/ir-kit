import { assertPrintedMatchesSnapshot, f, file } from '../utils';

describe('this expression', () => {
  it('this reference', async () => {
    const node = f.createFunctionDeclaration(
      'self',
      [],
      undefined,
      undefined,
      f.createThisExpression(),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'this-reference.kt');
  });

  it('qualified this', async () => {
    const node = f.createFunctionDeclaration(
      'outer',
      [],
      undefined,
      undefined,
      f.createThisExpression('Container'),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'qualified-this.kt');
  });
});
