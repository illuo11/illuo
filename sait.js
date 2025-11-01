/*
Eks Electro Studio — single-file React app (preview-ready)

INSTRUCTIONS:
- This is a demo single-file React component using Tailwind CSS classes.
- **Security note:** Do NOT commit real passwords inside source code. Replace OWNER_* constants with environment-based admin account or set up a real backend and secure database.
- To run: create a React app (Vite / Create React App), install Tailwind, then paste this component into App.jsx. Add Tailwind CDN or setup.

Features implemented in this demo:
- Animated heading and moving texts
- Instagram link
- Reviews (users can leave feedback)
- Language switcher (English / Українська)
- Pricing display: 1 minute = 1€ and bonus text
- Registration with 5% discount on 2nd procedure awarded automatically
- Admin panel (demo) to add posts, photos, contests; run a contest randomizer on chosen date
- Contact information and internal chat mockup
- Simple AI helper stub (client-side mock) that answers simple questions — replace with real AI API
- Active users tracking (basic) and moderation (ban/unban)
- Moderators with privileges and their phone numbers listed in internal chat

Remember: this is a front-end demo. For production you must implement a secure backend (auth, DB, file uploads, payments, moderation logs, rate-limiting, realtime sockets) and never store passwords in client code.
*/

import React, { useEffect, useState, useRef } from "react";

// ---------- Demo admin placeholder (REPLACE in production) ----------
const OWNER_EMAIL = "owner@example.com";
const OWNER_NAME = "Ksenia";
// Do NOT store real passwords in code. Use env vars or secure auth flows.
const DEMO_ADMIN_PASSWORD = "demo_admin_password";

// ---------- Simple i18n strings ----------
const TEXTS = {
  en: {
    title: "eks_electro_studio",
    welcome:
      "Welcome to Eks Electro Studio — professional electrotherapy & beauty",
    price: "Price: 1€ per minute",
    bonus: "Bonus: Stylish VIP treatment available",
    register: "Register",
    login: "Login",
    reviews: "Reviews",
    leaveReview: "Leave a review",
    adminPanel: "Admin Panel",
    addPost: "Add Post / Photo",
    addContest: "Create Contest",
    enterContest: "Enter contest",
    contact: "Contact",
    address: "Alicante, Spain",
    phone: "603 814 038",
  },
  ua: {
    title: "eks_electro_studio",
    welcome: "Ласкаво просимо до Eks Electro Studio — професійні процедури",
    price: "Ціна: 1€ за хвилину",
    bonus: "Бонус: стильна VIP-процедура",
    register: "Реєстрація",
    login: "Увійти",
    reviews: "Відгуки",
    leaveReview: "Залишити відгук",
    adminPanel: "Панель адміністратора",
    addPost: "Додати пост / фото",
    addContest: "Створити конкурс",
    enterContest: "Вписатися в конкурс",
    contact: "Контакти",
    address: "Аліканте, Іспанія",
    phone: "603 814 038",
  },
};

// Utility: unique id
const uid = () => Math.random().toString(36).slice(2, 9);

// Local storage helpers
const load = (k, d) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : d;
  } catch (e) {
    return d;
  }
};
const save = (k, v) => {
  localStorage.setItem(k, JSON.stringify(v));
};

export default function App() {
  const [lang, setLang] = useState("ua");
  const t = TEXTS[lang];

  // Users / auth (very simplified demo, client-side)
  const [user, setUser] = useState(load("app_user", null));
  const [users, setUsers] = useState(load("app_users", []));
  const [banned, setBanned] = useState(load("app_banned", []));

  // Posts
  const [posts, setPosts] = useState(load("app_posts", []));

  // Reviews
  const [reviews, setReviews] = useState(load("app_reviews", []));

  // Contests
  const [contests, setContests] = useState(load("app_contests", []));

  // Moderators
  const [mods, setMods] = useState(
    load("app_mods", [{ name: "Moderator1", phone: "603814038" }])
  );

  // Active users tracking (very simple): track open tabs via storage
  const [activeCount, setActiveCount] = useState(0);
  useEffect(() => {
    const id = uid();
    localStorage.setItem("active_" + id, Date.now());
    const tick = () => {
      // remove old
      Object.keys(localStorage).forEach((k) => {
        if (
          k.startsWith("active_") &&
          Date.now() - localStorage.getItem(k) > 1000 * 60 * 5
        )
          localStorage.removeItem(k);
      });
      setActiveCount(
        Object.keys(localStorage).filter((k) => k.startsWith("active_")).length
      );
      localStorage.setItem("active_" + id, Date.now());
    };
    const iv = setInterval(tick, 2000);
    tick();
    window.addEventListener("storage", tick);
    return () => {
      clearInterval(iv);
      window.removeEventListener("storage", tick);
      localStorage.removeItem("active_" + id);
    };
  }, []);

  // Save on changes
  useEffect(() => save("app_users", users), [users]);
  useEffect(() => save("app_posts", posts), [posts]);
  useEffect(() => save("app_reviews", reviews), [reviews]);
  useEffect(() => save("app_contests", contests), [contests]);
  useEffect(() => save("app_banned", banned), [banned]);
  useEffect(() => save("app_mods", mods), [mods]);
  useEffect(() => save("app_user", user), [user]);

  // Auth handlers (demo)
  function register({ email, name, password }) {
    if (users.find((u) => u.email === email)) return alert("User exists");
    const newU = {
      id: uid(),
      email,
      name,
      password,
      purchases: [],
      role: "user",
    };
    setUsers((prev) => [...prev, newU]);
    setUser({ id: newU.id, email, name, role: "user" });
    alert("Registered — you have access to support chat.");
  }
  function login({ email, password }) {
    // allow demo admin login too
    if (email === OWNER_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      setUser({
        id: "owner",
        email: OWNER_EMAIL,
        name: OWNER_NAME,
        role: "owner",
      });
      return;
    }
    const u = users.find((x) => x.email === email && x.password === password);
    if (!u) return alert("Invalid");
    if (banned.includes(u.id)) return alert("You are banned");
    setUser({ id: u.id, email: u.email, name: u.name, role: u.role || "user" });
  }
  function logout() {
    setUser(null);
  }

  // Purchase simulation: price 1€ per minute
  function purchase(minutes) {
    if (!user) {
      alert("Please register or login");
      return;
    }
    const price = minutes * 1; // euros
    // record purchase
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              purchases: [
                ...(u.purchases || []),
                { id: uid(), minutes, price, date: Date.now() },
              ],
            }
          : u
      )
    );
    // check for second procedure discount: if user had one purchase before, apply 5% on this one
    const u = users.find((x) => x.id === user.id) || {};
    const prevCount = (u.purchases || []).length;
    let finalPrice = price;
    if (prevCount >= 1) {
      finalPrice = +(price * 0.95).toFixed(2);
      alert("Applied 5% discount on this procedure!");
    }
    alert(`Charged ${finalPrice}€ for ${minutes} minutes`);
  }

  // Admin actions
  function addPost({ title, body, image }) {
    setPosts((prev) => [
      { id: uid(), title, body, image, date: Date.now() },
      ...prev,
    ]);
  }
  function addContest({ title, date }) {
    setContests((prev) => [
      { id: uid(), title, date, entries: [], winner: null, drawn: false },
      ...prev,
    ]);
  }
  function enterContest(contestId, name) {
    setContests((prev) =>
      prev.map((c) =>
        c.id === contestId
          ? { ...c, entries: [...c.entries, { id: uid(), name }] }
          : c
      )
    );
  }
  function drawContest(contestId) {
    setContests((prev) =>
      prev.map((c) => {
        if (c.id !== contestId) return c;
        if (c.entries.length === 0) return { ...c, drawn: true, winner: null };
        const r = c.entries[Math.floor(Math.random() * c.entries.length)];
        return { ...c, drawn: true, winner: r };
      })
    );
  }

  // Reviews
  function addReview({ name, text, rating }) {
    setReviews((prev) => [
      { id: uid(), name, text, rating, date: Date.now() },
      ...prev,
    ]);
  }

  // Moderation
  function banUser(userId) {
    setBanned((prev) => [...prev, userId]);
  }
  function unbanUser(userId) {
    setBanned((prev) => prev.filter((x) => x !== userId));
  }

  // Mock AI bot (replace with API call)
  function askBot(q) {
    // very naive answers
    const lq = q.toLowerCase();
    if (lq.includes("price") || lq.includes("ціна"))
      return `Price is 1€ per minute. Second procedure gets 5% discount.`;
    if (lq.includes("hours") || lq.includes("години"))
      return `We work by appointment. Contact ${t.phone}`;
    return `Hi! This is a demo AI helper. For detailed info contact support.`;
  }

  // Internal chat (very minimal) — messages stored in localStorage
  const [chatMessages, setChatMessages] = useState(
    load("app_chat", [
      {
        id: uid(),
        from: "system",
        text: "Welcome to internal chat",
        time: Date.now(),
      },
    ])
  );
  useEffect(() => save("app_chat", chatMessages), [chatMessages]);
  function sendChat(from, text) {
    setChatMessages((prev) => [
      ...prev,
      { id: uid(), from, text, time: Date.now() },
    ]);
  }

  // small UI pieces
  const [showAdmin, setShowAdmin] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", body: "", image: "" });
  const [newContest, setNewContest] = useState({ title: "", date: "" });
  const [regForm, setRegForm] = useState({ email: "", name: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [reviewForm, setReviewForm] = useState({
    name: "",
    text: "",
    rating: 5,
  });
  const [botQ, setBotQ] = useState("");
  const [botA, setBotA] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight uppercase flex items-center gap-4">
            <span className="inline-block animate-marquee whitespace-nowrap">
              {t.title} — {t.welcome}
            </span>
          </h1>
          <div className="mt-2 flex gap-3 items-center">
            <a
              href="https://www.instagram.com/eks_electro_studio?igsh=dGVqYmpzbmtrcTZq"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Instagram
            </a>
            <span className="px-3 py-1 bg-white/10 rounded">{t.price}</span>
            <span className="px-3 py-1 bg-white/10 rounded">{t.bonus}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded bg-white/10 p-2"
          >
            <option value="en">EN</option>
            <option value="ua">UA</option>
          </select>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-sm">
                {user.name} ({user.role})
              </div>
              <button onClick={logout} className="px-3 py-1 bg-red-600 rounded">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdmin(false)}
                className="px-3 py-1 bg-green-600 rounded"
              >
                {t.register}
              </button>
              <button
                onClick={() => setShowAdmin(true)}
                className="px-3 py-1 bg-blue-600 rounded"
              >
                {t.login}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: main content */}
        <section className="md:col-span-2 space-y-6">
          <div className="p-6 bg-white/5 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold">{t.welcome}</h2>
            <p className="mt-3">
              {t.price} — 1€ / min. Second procedure discount: 5% automatically
              applied.
            </p>
            <div className="mt-4 flex gap-3">
              <input
                type="number"
                placeholder="minutes"
                id="minutes"
                className="p-2 rounded bg-white/5"
              />
              <button
                onClick={() => {
                  const m = parseInt(
                    document.getElementById("minutes").value || 0
                  );
                  if (!m) return alert("Please enter minutes");
                  purchase(m);
                }}
                className="px-4 py-2 bg-yellow-500 rounded"
              >
                Pay
              </button>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl">
            <h3 className="text-xl font-semibold">{t.reviews}</h3>
            <div className="mt-4 space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="p-3 bg-white/3 rounded">
                  {" "}
                  <strong>{r.name}</strong> — {r.text}{" "}
                  <div className="text-xs text-white/70">
                    {new Date(r.date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <input
                value={reviewForm.name}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Name"
                className="p-2 rounded bg-white/5 mr-2"
              />
              <input
                value={reviewForm.text}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, text: e.target.value }))
                }
                placeholder="Review"
                className="p-2 rounded bg-white/5 mr-2"
              />
              <button
                onClick={() => {
                  if (!reviewForm.name || !reviewForm.text)
                    return alert("Fill");
                  addReview(reviewForm);
                  setReviewForm({ name: "", text: "", rating: 5 });
                }}
                className="px-3 py-1 bg-indigo-600 rounded"
              >
                {t.leaveReview}
              </button>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl">
            <h3 className="text-xl font-semibold">Posts & Contests</h3>
            <div className="mt-4 space-y-4">
              {posts.map((p) => (
                <article key={p.id} className="p-3 bg-white/3 rounded">
                  {" "}
                  <h4 className="font-bold">{p.title}</h4> <p>{p.body}</p>{" "}
                  {p.image && (
                    <img
                      src={p.image}
                      alt="post"
                      className="w-48 mt-2 rounded"
                    />
                  )}
                </article>
              ))}
            </div>
            <div className="mt-6">
              <h4 className="font-semibold">Contests</h4>
              {contests.map((c) => (
                <div key={c.id} className="p-3 bg-white/3 rounded mt-2">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-bold">{c.title}</div>
                      <div className="text-sm">Date: {c.date}</div>
                      <div className="text-sm">Entries: {c.entries.length}</div>
                      <div className="text-sm">
                        Winner:{" "}
                        {c.winner
                          ? c.winner.name
                          : c.drawn
                          ? "No winner"
                          : "TBD"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        placeholder="Your name"
                        id={"entry_" + c.id}
                        className="p-2 rounded bg-white/5"
                      />
                      <button
                        onClick={() => {
                          const name = document.getElementById(
                            "entry_" + c.id
                          ).value;
                          if (!name) return alert("Enter name");
                          enterContest(c.id, name);
                          alert("You entered");
                        }}
                        className="px-3 py-1 bg-green-600 rounded"
                      >
                        {t.enterContest}
                      </button>
                      {user && user.role !== "user" && (
                        <button
                          onClick={() => drawContest(c.id)}
                          className="px-3 py-1 bg-purple-600 rounded"
                        >
                          Draw winner now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right: sidebar / admin & contact */}
        <aside className="space-y-6">
          <div className="p-4 bg-white/5 rounded-2xl">
            <h4 className="font-bold">{t.contact}</h4>
            <div className="mt-2">{t.phone}</div>
            <div>{t.address}</div>
            <div className="mt-2">
              Email: contact@eks_electro_studio.example
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl">
            <h4 className="font-bold">Internal Chat</h4>
            <div className="h-40 overflow-auto bg-white/3 p-2 rounded mt-2">
              {chatMessages.map((m) => (
                <div key={m.id} className="text-sm mb-2">
                  <strong>{m.from}:</strong> {m.text}
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                placeholder="Message"
                id="chat_in"
                className="p-2 rounded bg-white/5 flex-1"
              />
              <button
                onClick={() => {
                  const v = document.getElementById("chat_in").value;
                  if (!v) return;
                  sendChat(user ? user.name : "guest", v);
                  document.getElementById("chat_in").value = "";
                }}
                className="px-3 py-1 bg-blue-600 rounded"
              >
                Send
              </button>
            </div>
            <div className="mt-3 text-xs">
              Moderators: {mods.map((m) => `${m.name} (${m.phone})`).join(", ")}
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl">
            <h4 className="font-bold">AI Helper</h4>
            <input
              value={botQ}
              onChange={(e) => setBotQ(e.target.value)}
              placeholder="Ask a question"
              className="p-2 rounded bg-white/5 w-full"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setBotA(askBot(botQ))}
                className="px-3 py-1 bg-indigo-600 rounded"
              >
                Ask
              </button>
            </div>
            {botA && (
              <div className="mt-2 p-2 bg-white/3 rounded text-sm">{botA}</div>
            )}
          </div>

          <div className="p-4 bg-white/5 rounded-2xl">
            <h4 className="font-bold">Admin / Moderation</h4>
            <div className="text-sm">Active visitors: {activeCount}</div>
            <div className="mt-2">
              <button
                onClick={() => {
                  const email = prompt(
                    "Admin email for demo login (use owner@example.com to login as owner)"
                  );
                  const pass = prompt("Password");
                  if (email && pass) {
                    login({ email, password: pass });
                  }
                }}
                className="px-3 py-1 bg-yellow-600 rounded"
              >
                Demo Login
              </button>
            </div>
            {user && user.role !== "user" && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    const name = prompt("Post title");
                    const body = prompt("Post body");
                    addPost({ title: name, body, image: "" });
                  }}
                  className="px-3 py-1 bg-green-600 rounded mr-2"
                >
                  {t.addPost}
                </button>
                <button
                  onClick={() => {
                    const title = prompt("Contest title");
                    const date = prompt("Contest date (YYYY-MM-DD)");
                    if (title && date) addContest({ title, date });
                  }}
                  className="px-3 py-1 bg-purple-600 rounded"
                >
                  {t.addContest}
                </button>
              </div>
            )}

            <div className="mt-3">
              <h5 className="font-semibold">Users</h5>
              <div className="max-h-40 overflow-auto mt-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex justify-between items-center p-2 bg-white/3 rounded mb-2"
                  >
                    <div>
                      <div className="font-bold">
                        {u.name} ({u.email})
                      </div>
                      <div className="text-xs">
                        Purchases: {(u.purchases || []).length}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {banned.includes(u.id) ? (
                        <button
                          onClick={() => unbanUser(u.id)}
                          className="px-2 py-1 bg-green-500 rounded"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => banUser(u.id)}
                          className="px-2 py-1 bg-red-600 rounded"
                        >
                          Ban
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Auth modal area */}
      {showAdmin ? (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white/5 p-6 rounded-2xl w-96">
            <h3 className="font-bold text-xl">{t.login}</h3>
            <input
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full p-2 mt-3 rounded bg-white/5"
            />
            <input
              placeholder="Password"
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, password: e.target.value }))
              }
              className="w-full p-2 mt-3 rounded bg-white/5"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  login(loginForm);
                  setShowAdmin(false);
                }}
                className="px-3 py-1 bg-blue-600 rounded"
              >
                Login
              </button>
              <button
                onClick={() => {
                  register(regForm);
                  setShowAdmin(false);
                }}
                className="px-3 py-1 bg-green-600 rounded"
              >
                Register
              </button>
            </div>
            <div className="mt-3 text-sm">
              Or use demo owner: email <code>owner@example.com</code>, password{" "}
              <code>demo_admin_password</code> (replace in production).
            </div>
          </div>
        </div>
      ) : (
        // register modal (simple inline)
        <div className="fixed bottom-4 left-4 bg-white/5 p-4 rounded-lg">
          <div className="font-semibold">Quick Register</div>
          <input
            placeholder="Name"
            value={regForm.name}
            onChange={(e) =>
              setRegForm((f) => ({ ...f, name: e.target.value }))
            }
            className="p-2 mt-2 rounded bg-white/5 w-56"
          />
          <input
            placeholder="Email"
            value={regForm.email}
            onChange={(e) =>
              setRegForm((f) => ({ ...f, email: e.target.value }))
            }
            className="p-2 mt-2 rounded bg-white/5 w-56"
          />
          <input
            placeholder="Password"
            type="password"
            value={regForm.password}
            onChange={(e) =>
              setRegForm((f) => ({ ...f, password: e.target.value }))
            }
            className="p-2 mt-2 rounded bg-white/5 w-56"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => register(regForm)}
              className="px-3 py-1 bg-green-600 rounded"
            >
              {t.register}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0%) } 100% { transform: translateX(-50%) } }
        .animate-marquee { display:inline-block; animation: marquee 18s linear infinite }
      `}</style>
    </div>
  );
}
