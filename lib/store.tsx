import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AVATAR_COLORS } from './theme';
import { Category, Draft, Notice, Priority, Role, User, DesignSpec } from './types';
import { SEED_NOTICES, SEED_USERS } from './seed';

const K = {
  users: '@crestwood/users',
  notices: '@crestwood/notices',
  session: '@crestwood/session',
  drafts: '@crestwood/drafts',
  bookmarks: '@crestwood/bookmarks',
  reads: '@crestwood/reads',
};

export const uid = (p = 'id') =>
  `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

type Map<T> = Record<string, T>;

export interface NoticeInput {
  title: string;
  body: string;
  category: Category;
  priority: Priority;
  images: string[];
  design: DesignSpec | null;
  pinned: boolean;
}

interface AppCtx {
  booted: boolean;
  user: User | null;
  users: User[];
  notices: Notice[];
  drafts: Draft[];
  bookmarks: string[];
  reads: string[];
  unreadCount: number;
  toastMsg: string | null;
  toast: (msg: string) => void;
  login: (email: string, password: string) => Promise<string | null>;
  register: (d: { name: string; email: string; password: string; role: Role; subject?: string }) => Promise<string | null>;
  logout: () => void;
  reload: () => Promise<void>;
  createNotice: (d: NoticeInput) => Notice | null;
  updateNotice: (id: string, patch: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  togglePin: (id: string) => void;
  toggleLike: (id: string) => void;
  markViewed: (id: string) => void;
  toggleBookmark: (id: string) => void;
  saveDraft: (d: Draft) => void;
  deleteDraft: (id: string) => void;
  setUserRole: (userId: string, role: Role) => void;
  removeUser: (userId: string) => void;
  canDelete: (n: Notice) => boolean;
  canEdit: (n: Notice) => boolean;
}

const Ctx = createContext<AppCtx | null>(null);

export const useApp = (): AppCtx => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside provider');
  return v;
};

const read = async <T,>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [draftsMap, setDraftsMap] = useState<Map<Draft[]>>({});
  const [bookmarksMap, setBookmarksMap] = useState<Map<string[]>>({});
  const [readsMap, setReadsMap] = useState<Map<string[]>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const boot = useCallback(async () => {
    const [su, sn, sd, sb, sr, sessionId] = await Promise.all([
      read<User[] | null>(K.users, null),
      read<Notice[] | null>(K.notices, null),
      read<Map<Draft[]>>(K.drafts, {}),
      read<Map<string[]>>(K.bookmarks, {}),
      read<Map<string[]>>(K.reads, {}),
      read<string | null>(K.session, null),
    ]);
    const u = su && su.length ? su : SEED_USERS;
    const n = sn && sn.length ? sn : SEED_NOTICES;
    if (!su) write(K.users, u);
    if (!sn) write(K.notices, n);
    setUsers(u);
    setNotices(n);
    setDraftsMap(sd);
    setBookmarksMap(sb);
    setReadsMap(sr);
    if (sessionId) setUser(u.find((x) => x.id === sessionId) ?? null);
    setBooted(true);
  }, []);

  useEffect(() => {
    boot();
  }, [boot]);

  useEffect(() => { if (booted) write(K.users, users); }, [users, booted]);
  useEffect(() => { if (booted) write(K.notices, notices); }, [notices, booted]);
  useEffect(() => { if (booted) write(K.drafts, draftsMap); }, [draftsMap, booted]);
  useEffect(() => { if (booted) write(K.bookmarks, bookmarksMap); }, [bookmarksMap, booted]);
  useEffect(() => { if (booted) write(K.reads, readsMap); }, [readsMap, booted]);
  useEffect(() => { if (booted) write(K.session, user ? user.id : null); }, [user, booted]);

  const toast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const stored = await read<User[] | null>(K.users, null);
      const pool = stored && stored.length ? stored : users;
      const found = pool.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!found) return 'No account found with that email.';
      if (found.password !== password) return 'Incorrect password. Try again.';
      setUsers(pool);
      setUser(found);
      return null;
    },
    [users]
  );

  const register = useCallback(
    async (d: { name: string; email: string; password: string; role: Role; subject?: string }) => {
      const email = d.email.trim().toLowerCase();
      if (!d.name.trim()) return 'Please enter your full name.';
      if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address.';
      if (d.password.length < 6) return 'Password must be at least 6 characters.';
      if (users.some((u) => u.email.toLowerCase() === email)) return 'An account with this email already exists.';
      const nu: User = {
        id: uid('u'),
        name: d.name.trim(),
        email,
        password: d.password,
        role: d.role,
        color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        subject: d.subject?.trim() || undefined,
        createdAt: Date.now(),
      };
      setUsers((p) => [...p, nu]);
      setUser(nu);
      return null;
    },
    [users]
  );

  const logout = useCallback(() => setUser(null), []);

  const reload = useCallback(async () => {
    const [su, sn] = await Promise.all([
      read<User[] | null>(K.users, null),
      read<Notice[] | null>(K.notices, null),
    ]);
    if (su && su.length) setUsers(su);
    if (sn && sn.length) setNotices(sn);
  }, []);

  const createNotice = useCallback(
    (d: NoticeInput): Notice | null => {
      if (!user || user.role === 'student') return null;
      const n: Notice = {
        id: uid('n'),
        title: d.title.trim(),
        body: d.body.trim(),
        category: d.category,
        priority: d.priority,
        images: d.images,
        design: d.design,
        authorId: user.id,
        authorName: user.name,
        authorRole: user.role,
        createdAt: Date.now(),
        pinned: user.role === 'admin' ? d.pinned : false,
        likes: [],
        views: [],
      };
      setNotices((p) => [n, ...p]);
      return n;
    },
    [user]
  );

  const updateNotice = useCallback((id: string, patch: Partial<Notice>) => {
    setNotices((p) => p.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }, []);

  const deleteNotice = useCallback((id: string) => {
    setNotices((p) => p.filter((n) => n.id !== id));
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotices((p) => p.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  }, []);

  const toggleLike = useCallback(
    (id: string) => {
      if (!user) return;
      setNotices((p) =>
        p.map((n) => {
          if (n.id !== id) return n;
          const has = n.likes.includes(user.id);
          return { ...n, likes: has ? n.likes.filter((x) => x !== user.id) : [...n.likes, user.id] };
        })
      );
    },
    [user]
  );

  const markViewed = useCallback(
    (id: string) => {
      if (!user) return;
      setNotices((p) =>
        p.map((n) =>
          n.id === id && !n.views.includes(user.id) ? { ...n, views: [...n.views, user.id] } : n
        )
      );
      setReadsMap((p) => {
        const cur = p[user.id] ?? [];
        if (cur.includes(id)) return p;
        return { ...p, [user.id]: [...cur, id] };
      });
    },
    [user]
  );

  const toggleBookmark = useCallback(
    (id: string) => {
      if (!user) return;
      setBookmarksMap((p) => {
        const cur = p[user.id] ?? [];
        const has = cur.includes(id);
        return { ...p, [user.id]: has ? cur.filter((x) => x !== id) : [id, ...cur] };
      });
    },
    [user]
  );

  const saveDraft = useCallback(
    (d: Draft) => {
      if (!user) return;
      setDraftsMap((p) => {
        const cur = p[user.id] ?? [];
        const exists = cur.some((x) => x.id === d.id);
        const next = exists ? cur.map((x) => (x.id === d.id ? d : x)) : [d, ...cur];
        return { ...p, [user.id]: next };
      });
    },
    [user]
  );

  const deleteDraft = useCallback(
    (id: string) => {
      if (!user) return;
      setDraftsMap((p) => ({ ...p, [user.id]: (p[user.id] ?? []).filter((x) => x.id !== id) }));
    },
    [user]
  );

  const setUserRole = useCallback((userId: string, role: Role) => {
    setUsers((p) => p.map((u) => (u.id === userId ? { ...u, role } : u)));
    setNotices((p) => p.map((n) => (n.authorId === userId ? { ...n, authorRole: role } : n)));
    setUser((cur) => (cur && cur.id === userId ? { ...cur, role } : cur));
  }, []);

  const removeUser = useCallback((userId: string) => {
    setUsers((p) => p.filter((u) => u.id !== userId));
    setNotices((p) => p.filter((n) => n.authorId !== userId));
  }, []);

  const canDelete = useCallback(
    (n: Notice) => !!user && (user.role === 'admin' || n.authorId === user.id),
    [user]
  );
  const canEdit = useCallback(
    (n: Notice) => !!user && user.role !== 'student' && (user.role === 'admin' || n.authorId === user.id),
    [user]
  );

  const drafts = user ? draftsMap[user.id] ?? [] : [];
  const bookmarks = user ? bookmarksMap[user.id] ?? [] : [];
  const reads = user ? readsMap[user.id] ?? [] : [];
  const unreadCount = user ? notices.filter((n) => !reads.includes(n.id)).length : 0;

  const value = useMemo<AppCtx>(
    () => ({
      booted, user, users, notices, drafts, bookmarks, reads, unreadCount, toastMsg, toast,
      login, register, logout, reload,
      createNotice, updateNotice, deleteNotice, togglePin, toggleLike, markViewed, toggleBookmark,
      saveDraft, deleteDraft, setUserRole, removeUser, canDelete, canEdit,
    }),
    [booted, user, users, notices, drafts, bookmarks, reads, unreadCount, toastMsg, toast,
      login, register, logout, reload, createNotice, updateNotice, deleteNotice, togglePin,
      toggleLike, markViewed, toggleBookmark, saveDraft, deleteDraft, setUserRole, removeUser,
      canDelete, canEdit]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
