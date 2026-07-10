import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('identifier type', () => {
  it('wraps a generic identifier type in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          pattern: 'value',
          typeAnnotation: swift.factory.createIdentifierType('Box', [
            swift.factory.createIdentifierType('Int'),
          ]),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'identifier-type-generic.swift');
  });

  it('wraps a multi-argument generic identifier type in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          pattern: 'value',
          typeAnnotation: swift.factory.createIdentifierType('Pair', [
            swift.factory.createIdentifierType('String'),
            swift.factory.createIdentifierType('Int'),
          ]),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'identifier-type-generic-multi.swift');
  });
});
