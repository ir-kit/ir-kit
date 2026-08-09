import { assertPrintedMatchesSnapshot, f, file, id } from '../utils';

const call = (name: string, args: Parameters<typeof f.createCallExpression>[1] = []) =>
  f.createCallExpression(id(name), args);
const stmt = (e: Parameters<typeof f.createExpressionStatement>[0]) =>
  f.createExpressionStatement(e);

describe('try expression', () => {
  it('try catch finally', async () => {
    const node = f.createFunctionDeclaration('safe', [], undefined, [
      f.createTryExpression(
        f.createBlock([stmt(call('risky'))]),
        [
          {
            body: f.createBlock([stmt(call('handle', [{ expression: id('e') }]))]),
            parameter: f.createParameter('e', f.createUserType('Exception')),
          },
        ],
        f.createBlock([stmt(call('cleanup'))]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file([node]), 'try-catch-finally.kt');
  });

  it('multiple catch clauses', async () => {
    const node = f.createFunctionDeclaration(
      'parse',
      [f.createParameter('input', f.createUserType('String'))],
      undefined,
      [
        f.createTryExpression(
          f.createBlock([stmt(call('decode', [{ expression: id('input') }]))]),
          [
            {
              body: f.createBlock([stmt(call('fallback'))]),
              parameter: f.createParameter('e', f.createUserType('NumberFormatException')),
            },
            {
              body: f.createBlock([stmt(call('reset'))]),
              parameter: f.createParameter('e', f.createUserType('IllegalStateException')),
            },
          ],
        ),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), 'multi-catch.kt');
  });
});
