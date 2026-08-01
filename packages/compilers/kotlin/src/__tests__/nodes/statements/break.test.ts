import { assertPrintedMatchesSnapshot, f, file, id } from '../utils';

const call = (name: string, args: Parameters<typeof f.createCallExpression>[1] = []) =>
  f.createCallExpression(id(name), args);
const stmt = (e: Parameters<typeof f.createExpressionStatement>[0]) =>
  f.createExpressionStatement(e);

describe('break statement', () => {
  it('break out of a loop', async () => {
    const node = f.createFunctionDeclaration(
      'scan',
      [f.createParameter('items', f.createUserType('List', [f.createUserType('Int')]))],
      undefined,
      [
        f.createForStatement(
          ['item'],
          id('items'),
          f.createBlock([
            f.createIfStatement(id('done'), f.createBreakStatement()),
            stmt(call('process', [{ expression: id('item') }])),
          ]),
        ),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), 'break.kt');
  });
});
