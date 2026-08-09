import { assertPrintedMatchesSnapshot, f, file, id } from '../utils';

const call = (name: string, args: Parameters<typeof f.createCallExpression>[1] = []) =>
  f.createCallExpression(id(name), args);
const stmt = (e: Parameters<typeof f.createExpressionStatement>[0]) =>
  f.createExpressionStatement(e);
const str = (text: string) => f.createStringLiteral([{ text }]);

describe('if statement', () => {
  it('if else with blocks', async () => {
    const node = f.createFunctionDeclaration(
      'classify',
      [f.createParameter('n', f.createUserType('Int'))],
      undefined,
      [
        f.createIfStatement(
          f.createBinaryExpression(id('n'), '>', f.createLiteral('0', 'int')),
          f.createBlock([stmt(call('println', [{ expression: str('positive') }]))]),
          f.createBlock([stmt(call('println', [{ expression: str('negative') }]))]),
        ),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), 'if-else.kt');
  });

  it('single-line guard', async () => {
    const node = f.createFunctionDeclaration(
      'notify',
      [f.createParameter('enabled', f.createUserType('Boolean'))],
      undefined,
      [
        f.createIfStatement(
          f.createPrefixUnaryExpression('!', id('enabled')),
          f.createReturnStatement(),
        ),
        stmt(call('send')),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), 'guard.kt');
  });
});
