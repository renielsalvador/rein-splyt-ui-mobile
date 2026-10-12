import {MockBackend} from '../src/lib/backend/mockBackend';

async function setUp() {
  const backend = new MockBackend();
  const suffix = Math.random().toString(36).slice(2, 8);
  const session = await backend.signUp({
    displayName: 'Owner',
    email: `owner-${suffix}@example.com`,
    password: 'password123',
  });
  const event = await backend.createEvent(session.user.id, {
    name: 'Trip',
    currency: 'PHP',
    icon: 'trip',
  });
  return {backend, event};
}

describe('setMemberRole', () => {
  it('promotes a member to admin', async () => {
    const {backend, event} = await setUp();
    const member = await backend.addManualMember(event.id, 'Kim');

    const updated = await backend.setMemberRole(event.id, member.id, 'admin');

    expect(updated.role).toBe('admin');
  });

  it('refuses to demote the only owner', async () => {
    const {backend, event} = await setUp();
    const summary = await backend.getEventSummary(event.id);
    const owner = summary.members.find(item => item.role === 'owner');

    await expect(backend.setMemberRole(event.id, owner!.id, 'member')).rejects.toThrow(
      'Assign another owner before changing this one.',
    );
  });

  it('rejects an unknown member', async () => {
    const {backend, event} = await setUp();

    await expect(backend.setMemberRole(event.id, 'missing', 'admin')).rejects.toThrow(
      'Member not found.',
    );
  });
});
