// This test runner is generated as per the Phase 0: TDD instructions.
// It verifies the Dirty Dozen payloads against the rules. To actually run this,
// you would need the Firebase Emulators installed.

import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import * as fs from 'fs';

let testEnv: any;
beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: 'demo-liberica-assistance',
        firestore: {
            rules: fs.readFileSync('./firestore.rules', 'utf8'),
        },
    });
});

afterAll(async () => {
    await testEnv.cleanup();
});

describe('Firestore Rules - Shadow/Spoofing/Denial Tests', () => {
    it('Payload 1: Should deny creation with missing title', async () => {
        const alice = testEnv.authenticatedContext('alice');
        await assertFails(alice.firestore().doc('users/alice/sessions/session1').set({
            currentMode: 'chat',
            messages: '[]',
            appState: '{}',
            updatedAt: testEnv.firestore.FieldValue.serverTimestamp(),
            // missing title and isPinned
        }));
    });

    it('Payload 3: Should deny update with ghost field', async () => {
        const alice = testEnv.authenticatedContext('alice');
        await assertFails(alice.firestore().doc('users/alice/sessions/session1').update({
            isVerified: true,
            updatedAt: testEnv.firestore.FieldValue.serverTimestamp(),
        }));
    });

    it('Payload 4: Should deny updating another user\'s session', async () => {
        const bob = testEnv.authenticatedContext('bob');
        await assertFails(bob.firestore().doc('users/alice/sessions/session1').update({
            title: 'Hacked',
            updatedAt: testEnv.firestore.FieldValue.serverTimestamp(),
        }));
    });

    it('Payload 10: Should deny client-side timestamps', async () => {
        const alice = testEnv.authenticatedContext('alice');
        await assertFails(alice.firestore().doc('users/alice/sessions/session1').set({
            currentMode: 'chat',
            messages: '[]',
            appState: '{}',
            title: 'Test',
            isPinned: false,
            updatedAt: new Date(), // Error: must use server timestamp
        }));
    });
});
