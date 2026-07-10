import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('tuple type', () => {
  it('wraps unlabeled elements in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'value',
          type: swift.factory.createTupleType([
            { type: swift.factory.createIdentifierType('Int') },
            { type: swift.factory.createIdentifierType('String') },
          ]),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'tuple-type.swift');
  });

  it('wraps labeled elements in a binding annotation', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'value',
          type: swift.factory.createTupleType([
            { label: 'x', type: swift.factory.createIdentifierType('Int') },
            { label: 'y', type: swift.factory.createIdentifierType('Int') },
          ]),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'tuple-type-labeled.swift');
  });
});
