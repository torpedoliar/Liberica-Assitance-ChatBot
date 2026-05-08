import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { Mode, Message, AppState } from '../types';

export const useSessions = (
    messages: Record<Mode, Message[]>,
    appState: AppState,
    currentMode: Mode,
    showSafetyModal: boolean
) => {
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<any>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setSessionUser(user);
        
        let userIsAdmin = user.email?.toLowerCase() === 'yohanesoctav@gmail.com';
        if (!userIsAdmin && user.email) {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', user.email.toLowerCase()));
            userIsAdmin = adminDoc.exists();
          } catch (e) {
            // Ignore if permission denied
          }
        }
        setIsAdminUser(userIsAdmin);

        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            lastLogin: serverTimestamp()
          }, { merge: true });

          const docRef = doc(db, 'users', user.uid, 'sessions', 'latest');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const msgLengths = Object.values(data.messages ? JSON.parse(data.messages) : {}).reduce((acc: number, cur: any) => acc + (cur as any[]).length, 0) as number;
            
            if (msgLengths > 0) {
              setPendingSessionData(data);
              if (!showSafetyModal) {
                setShowRestoreModal(true);
              }
            } else {
              setIsSessionLoaded(true);
            }
          } else {
            setIsSessionLoaded(true);
          }
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.GET, 'users');
          } catch (e) {
            // Error was thrown by handleFirestoreError, catch it to prevent Script error.
          }
          setIsSessionLoaded(true);
        }
      } else {
        setSessionUser(null);
        setSavedSessions([]);
        setCurrentSessionId(null);
        setIsSessionLoaded(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!showSafetyModal && pendingSessionData) {
      setShowRestoreModal(true);
    } else if (!showSafetyModal && !pendingSessionData) {
      setIsSessionLoaded(true);
    }
  }, [showSafetyModal, pendingSessionData]);

  const fetchSavedSessions = async () => {
    if (!sessionUser) return;
    try {
      const q = query(collection(db, 'users', sessionUser.uid, 'sessions'), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      let sessions = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.id !== 'latest');
      
      // Sort pinned to top
      sessions.sort((a: any, b: any) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
        
      setSavedSessions(sessions);
    } catch (err) {
      console.error("Failed to fetch sessions: ", err);
    }
  };

  useEffect(() => {
    if (sessionUser) {
      fetchSavedSessions();
    }
  }, [sessionUser]);

  const saveSession = async (messagesData: any, stateData: any, mode: string) => {
    if (!sessionUser) return;
    try {
      const msgsArrays: any[] = Object.values(messagesData);
      const hasMessages = msgsArrays.some(arr => arr.length > 0);
      if (!hasMessages) return;

      const sessionsRef = collection(db, 'users', sessionUser.uid, 'sessions');
      
      let sessionId = currentSessionId;
      if (!sessionId) {
        // Enforce limits before adding
        const q = query(sessionsRef, orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(q);
        const allSessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })).filter(s => s.id !== 'latest');
        
        const unpinned = allSessions.filter(s => !s.isPinned);
        if (unpinned.length >= 5) {
          // Delete oldest unpinned sessions if it goes above the limit
          // Reverse order is older first since we order by desc
          const sessionsToDelete = unpinned.slice(4); // Keep the newest 4, this new one makes 5
          for (const old of sessionsToDelete) {
            await deleteDoc(doc(db, 'users', sessionUser.uid, 'sessions', old.id));
          }
        }

        const newDocRef = doc(sessionsRef);
        sessionId = newDocRef.id;
        setCurrentSessionId(sessionId);
        
        // Auto-generate title based on first message
        const allMsgs = msgsArrays.flat();
        const firstUserMsg = allMsgs.find(m => m && m.role === 'user');
        const title = firstUserMsg ? firstUserMsg.text.substring(0, 30) + '...' : "Chat Baru";

        await setDoc(newDocRef, {
          title,
          currentMode: mode,
          messages: JSON.stringify(messagesData),
          appState: JSON.stringify(stateData),
          updatedAt: serverTimestamp(),
          isPinned: false
        });
        
        // We only fetch on creation so history updates without excessive querying
        fetchSavedSessions();
      } else {
        const docRef = doc(db, 'users', sessionUser.uid, 'sessions', sessionId);

        await setDoc(docRef, {
          currentMode: mode,
          messages: JSON.stringify(messagesData),
          appState: JSON.stringify(stateData),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        fetchSavedSessions();
      }
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'users');
      } catch (e) {
        console.error("Firestore error handled: ", e);
      }
    }
  };

  const togglePinSession = async (session: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!sessionUser) return;
    try {
      const isCurrentlyPinned = session.isPinned || false;
      
      if (!isCurrentlyPinned) {
        // Check pin limit
        const pinnedCount = savedSessions.filter(s => s.isPinned).length;
        if (pinnedCount >= 3) {
          alert("Maksimal 3 obrolan yang dapat dipin.");
          return;
        }
      }

      await setDoc(doc(db, 'users', sessionUser.uid, 'sessions', session.id), {
        isPinned: !isCurrentlyPinned,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      fetchSavedSessions();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'users');
      } catch (e) {
        console.error("Firestore pin error: ", e);
      }
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Error during login:', err);
    }
  };

  useEffect(() => {
    if (isSessionLoaded && sessionUser) {
      const timeoutId = setTimeout(() => {
        saveSession(messages, appState, currentMode);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, appState, currentMode, isSessionLoaded, sessionUser]);

  return {
    sessionUser,
    isAdminUser,
    savedSessions,
    isSessionLoaded,
    pendingSessionData,
    currentSessionId,
    setCurrentSessionId,
    showRestoreModal,
    setShowRestoreModal,
    setPendingSessionData,
    setIsSessionLoaded,
    handleLogin,
    fetchSavedSessions,
    saveSession,
    togglePinSession
  };
};
