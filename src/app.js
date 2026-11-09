import { api } from "./api.js";

// --------------------------------------------------
// 1. DEMO DATA
// --------------------------------------------------

const profiles = [
  ["Aanya", "Product designer", "Koramangala", 28000, "Vegetarian", "Tidy", "Early", "Female"],
  ["Arjun", "Software engineer", "HSR Layout", 30000, "Non-vegetarian", "Tidy", "Flexible", "Male"],
  ["Meera", "Masters student", "Indiranagar", 24000, "Vegetarian", "Very tidy", "Early", "Female"],
  ["Kabir", "Marketing lead", "Bellandur", 32000, "Eggetarian", "Relaxed", "Late", "Male"],
  ["Nisha", "Research analyst", "Whitefield", 26000, "Vegan", "Tidy", "Early", "Female"],
  ["Dev", "UX writer", "BTM Layout", 22000, "Non-vegetarian", "Tidy", "Flexible", "Male"],
  ["Riya", "Architect", "Koramangala", 35000, "Vegetarian", "Very tidy", "Late", "Female"],
  ["Vikram", "Data analyst", "Marathahalli", 21000, "Eggetarian", "Relaxed", "Early", "Male"],
  ["Ishita", "Consultant", "HSR Layout", 33000, "Vegetarian", "Tidy", "Flexible", "Female"],
  ["Samar", "Founder", "Indiranagar", 40000, "Non-vegetarian", "Tidy", "Late", "Male"],
  ["Tara", "Journalist", "Jayanagar", 25000, "Vegetarian", "Tidy", "Early", "Female"],
  ["Neil", "Photographer", "Sarjapur Road", 27000, "Eggetarian", "Relaxed", "Late", "Male"],
  ["Pooja", "Teacher", "JP Nagar", 20000, "Vegetarian", "Very tidy", "Early", "Female"],
  ["Aditya", "Developer", "Whitefield", 29000, "Non-vegetarian", "Tidy", "Flexible", "Male"],
  ["Zoya", "Brand strategist", "Koramangala", 31000, "Vegan", "Tidy", "Late", "Female"]
].map((p, i) => ({
  id: i + 1,
  name: p[0],
  job: p[1],
  area: p[2],
  budget: p[3],
  food: p[4],
  clean: p[5],
  sleep: p[6],
  gender: p[7],
  about: `I'm ${p[0]}, a ${p[1].toLowerCase()} looking for a considerate, communicative home.`
}));

const homes = [
  ["Sunlit 2BHK in Koramangala", "Koramangala", 26000, "2 beds · Furnished"],
  ["Quiet room near HSR Sector 2", "HSR Layout", 18000, "3 beds · Semi-furnished"],
  ["Creative shared home, Indiranagar", "Indiranagar", 32000, "2 beds · Furnished"],
  ["Work-friendly Whitefield apartment", "Whitefield", 21000, "3 beds · Furnished"],
  ["BTM Layout terrace house", "BTM Layout", 17000, "4 beds · Semi-furnished"],
  ["Bellandur lake-view 3BHK", "Bellandur", 29000, "3 beds · Furnished"],
  ["Jayanagar family-friendly flat", "Jayanagar", 20000, "2 beds · Furnished"],
  ["Marathahalli metro-side room", "Marathahalli", 15500, "3 beds · Semi-furnished"]
].map((h, i) => ({
  id: i + 1,
  title: h[0],
  area: h[1],
  rent: h[2],
  meta: h[3]
}));

// --------------------------------------------------
// 2. APPLICATION STATE
// --------------------------------------------------

const readArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const state = {
  page: location.hash.slice(1) || "home",
  demo: localStorage.getItem("hgDemo") === "yes",

  saved: readArray("hgSaved"),
  messages: readArray("hgMessages"),
  expenses: readArray("hgExpenses"),
  chores: readArray("hgChores"),
  connections: readArray("hgConnections"),

  user: null,
  authLoading: false
};

const app = document.querySelector("#app");

const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

function persist() {
  localStorage.setItem("hgDemo", state.demo ? "yes" : "no");
  localStorage.setItem("hgSaved", JSON.stringify(state.saved));
  localStorage.setItem("hgMessages", JSON.stringify(state.messages));
  localStorage.setItem("hgExpenses", JSON.stringify(state.expenses));
  localStorage.setItem("hgChores", JSON.stringify(state.chores));
  localStorage.setItem("hgConnections", JSON.stringify(state.connections));
}

// --------------------------------------------------
// 3. NAVIGATION AND UTILITIES
// --------------------------------------------------

const nav = () => `
  <header class="top">
    <div class="shell">

      <a class="brand" href="#home">
        <span class="brandmark">⌂</span>HomieGo
      </a>

      <nav class="nav">
        <a href="#how">How it works</a>
        <a href="#discover">Discover</a>
        <a href="#properties">Homes</a>
        <a href="#safety">Safety</a>
      </nav>

      <button class="cta" onclick="go('${state.user ? "account" : state.demo ? "dashboard" : "login"}')">
        ${state.user ? "My account" : state.demo ? "My dashboard" : "Sign in"}
      </button>

    </div>
  </header>
`;

const toast = (message) => {
  const element = document.createElement("div");
  element.className = "toast";
  element.textContent = message;
  document.body.append(element);

  setTimeout(() => element.remove(), 2600);
};

function go(page) {
  location.hash = page;
}

window.go = go;

const publicPage = (title, body) => `
  <main class="app-main">
    <div class="shell">

      <div class="title-row">
        <div>
          <h1>${title}</h1>
          <p>HomieGo · Find your people. Find your place.</p>
        </div>
      </div>

      <div class="panel">
        ${body}
      </div>

    </div>
  </main>
`;

// --------------------------------------------------
// 4. HOME PAGE
// --------------------------------------------------

const home = () => `
  <main>

    <section class="hero">
      <div class="shell heroGrid">

        <div>
          <span class="eyebrow">
            Bengaluru shared living, rethought
          </span>

          <h1>
            Your next home starts with the right people.
          </h1>

          <p class="lead">
            Find roommates who match your lifestyle,
            budget and personality. Because sharing
            a home should feel right.
          </p>

          <div class="actions">
            <button class="cta"
              onclick="demo();go('discover')">
              Find my roommate
            </button>

            <button class="ghost"
              onclick="go('properties')">
              Explore homes
            </button>
          </div>

          <p class="trust">
            Demo experience · fictional profiles and listings ·
            no real verification claims
          </p>
        </div>

        <div class="visual">
          <div class="matchcard">
            <strong>92%</strong>
            <p>Compatibility with Aanya</p>
            <div class="bar">
              <i style="width:92%"></i>
            </div>
          </div>

          <div class="house"></div>
          <div class="person"></div>
          <div class="person two"></div>
        </div>

      </div>
    </section>

    <section class="section">
      <div class="shell">

        <span class="eyebrow">
          Designed for better flatshares
        </span>

        <h2>More than a room. A place to belong.</h2>

        <div class="cards">

          <article class="card">
            <span class="num">01</span>
            <h3>Show who you are</h3>
            <p>
              Share the routines, boundaries and small
              habits that make a home work.
            </p>
          </article>

          <article class="card">
            <span class="num">02</span>
            <h3>See the fit</h3>
            <p>
              Clear compatibility explanations help you
              decide before you connect.
            </p>
          </article>

          <article class="card">
            <span class="num">03</span>
            <h3>Live well together</h3>
            <p>
              Keep expenses, chores and household plans
              simple once you move in.
            </p>
          </article>

        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="shell">

        <span class="eyebrow">A thoughtful match</span>

        <h2>Built around everyday compatibility.</h2>

        <p class="sub">
          From sleep schedules to kitchen habits,
          HomieGo helps you talk about the details that matter.
          Scores are guidance, never a prediction or guarantee.
        </p>

        <div class="actions">
          <button class="cta"
            onclick="demo();go('discover')">
            Meet your matches
          </button>

          <button class="ghost" onclick="go('how')">
            See how it works
          </button>
        </div>

      </div>
    </section>

  </main>
`;

// --------------------------------------------------
// 5. DISCOVERY
// --------------------------------------------------

const discover = () => {
  const cards = profiles.map(profileCard).join("");

  return `
    <main class="app-main">
      <div class="shell">

        <div class="title-row">
          <div>
            <h1>Discover people</h1>
            <p>Find a home dynamic that feels right.</p>
          </div>

          <button class="ghost"
            onclick="go('compatibility')">
            How scoring works
          </button>
        </div>

        <div class="notice">
          Demo data only — every profile below is fictional.
        </div>

        <div class="layout">

          <aside class="panel filters">

            <b>Refine your search</b>

            <label>Neighbourhood</label>

            <select id="area" onchange="filterProfiles()">
              <option value="">All Bengaluru</option>
              ${[...new Set(profiles.map(x => x.area))]
                .map(x => `<option>${x}</option>`).join("")}
            </select>

            <label>Maximum monthly budget</label>

            <input
              id="budget"
              type="range"
              min="15000"
              max="40000"
              value="40000"
              oninput="filterProfiles()"
            >

            <span id="budgetLabel">Up to ₹40,000</span>

            <label>Food preference</label>

            <select id="food" onchange="filterProfiles()">
              <option value="">Any</option>
              <option>Vegetarian</option>
              <option>Eggetarian</option>
              <option>Non-vegetarian</option>
              <option>Vegan</option>
            </select>

            <label>Cleanliness</label>

            <select id="clean" onchange="filterProfiles()">
              <option value="">Any</option>
              <option>Tidy</option>
              <option>Very tidy</option>
              <option>Relaxed</option>
            </select>

          </aside>

          <section>
            <div class="profile-grid" id="profiles">
              ${cards}
            </div>
          </section>

        </div>

      </div>
    </main>
  `;
};

function profileCard(profile) {
  const score = compatibilityScore(profile);

  return `
    <article class="profile">

      <div class="avatar">
        ${escapeHtml(profile.name[0])}
      </div>

      <div class="profile-body">

        <div style="display:flex;justify-content:space-between">
          <h3>
            ${escapeHtml(profile.name)},
            ${24 + profile.id % 7}
          </h3>

          <span class="score">${score}% fit</span>
        </div>

        <p class="meta">
          ${escapeHtml(profile.job)} ·
          ${escapeHtml(profile.area)}
        </p>

        <div class="tags">
          <span class="tag">${escapeHtml(profile.food)}</span>
          <span class="tag">${escapeHtml(profile.clean)}</span>
          <span class="tag">${money(profile.budget)}</span>
        </div>

        <p class="meta">
          ${escapeHtml(profile.about)}
        </p>

        <div class="card-actions">

          <button class="small primary"
            onclick="connect(${profile.id})">
            Connect
          </button>

          <button class="small secondary"
            onclick="save(${profile.id})">
            ${state.saved.includes(profile.id) ? "Saved" : "Save"}
          </button>

        </div>

      </div>
    </article>
  `;
}

function compatibilityScore(profile) {
  let score =
    100 -
    Math.min(28, Math.abs(profile.budget - 28000) / 600) -
    ({
      Vegetarian: 0,
      Eggetarian: 5,
      Vegan: 8,
      "Non-vegetarian": 12
    }[profile.food] || 0);

  if (profile.clean === "Relaxed") score -= 8;

  return Math.max(55, Math.round(score));
}

window.filterProfiles = () => {
  const area = document.querySelector("#area").value;
  const budget = Number(document.querySelector("#budget").value);
  const food = document.querySelector("#food").value;
  const clean = document.querySelector("#clean").value;

  document.querySelector("#budgetLabel").textContent =
    `Up to ${money(budget)}`;

  const results = profiles.filter(profile =>
    (!area || profile.area === area) &&
    profile.budget <= budget &&
    (!food || profile.food === food) &&
    (!clean || profile.clean === clean)
  );

  document.querySelector("#profiles").innerHTML =
    results.length
      ? results.map(profileCard).join("")
      : `<div class="empty">
          No profiles match those filters.
          Try widening your search.
        </div>`;
};

window.save = (id) => {
  state.saved.includes(id)
    ? state.saved = state.saved.filter(x => x !== id)
    : state.saved.push(id);

  persist();

  toast(
    state.saved.includes(id)
      ? "Saved to your shortlist"
      : "Removed from saved"
  );
};

window.connect = (id) => {
  if (!state.connections.includes(id)) {
    state.connections.push(id);
  }

  persist();

  toast(`Demo connection request sent to ${profiles[id - 1].name}`);
};

window.demo = () => {
  state.demo = true;
  persist();
  toast("Demo mode enabled");
};

// --------------------------------------------------
// 6. PROPERTY DEMO
// --------------------------------------------------

const properties = () => `
  <main class="app-main">
    <div class="shell">

      <div class="title-row">
        <div>
          <h1>Explore homes</h1>
          <p>Independent demo property listings in Bengaluru.</p>
        </div>

        <button class="cta"
          onclick="toast('Demo listings cannot be published publicly.')">
          List a home
        </button>
      </div>

      <div class="notice">
        Demonstration listings only.
        They are not available properties.
      </div>

      <div class="list">

        ${homes.map(home => `
          <article class="listing">

            <div class="homepic"></div>

            <div>
              <h3>${escapeHtml(home.title)}</h3>

              <p>
                ${escapeHtml(home.area)} ·
                ${escapeHtml(home.meta)}
              </p>

              <div class="tags">
                <span class="tag">Wi-Fi</span>
                <span class="tag">Move-in ready</span>
                <span class="tag">Demo listing</span>
              </div>
            </div>

            <div class="money">
              ${money(home.rent)}
              <br>
              <small style="color:#68726c;font-weight:400">
                / month
              </small>
            </div>

          </article>
        `).join("")}

      </div>
    </div>
  </main>
`;

// --------------------------------------------------
// 7. COMPATIBILITY DEMO
// --------------------------------------------------

const compatibility = () => {
  const categories = [
    ["Lifestyle", 92],
    ["Cleanliness", 96],
    ["Sleeping habits", 88],
    ["Financial fit", 94],
    ["Food preferences", 90],
    ["Social habits", 85],
    ["Work schedules", 91],
    ["Personal boundaries", 95]
  ];

  return `
    <main class="app-main">
      <div class="shell">

        <div class="title-row">
          <div>
            <h1>Compatibility, explained</h1>
            <p>
              A transparent demo comparison between you and Aanya.
            </p>
          </div>
        </div>

        <div class="compat">

          <section class="panel">
            <span class="eyebrow">Your overall fit</span>

            <div class="bigscore">92%</div>

            <h3>Strong everyday alignment</h3>

            <p class="sub">
              Your budgets overlap, you both value a tidy home,
              and your routines are comfortably aligned.
              This score is a conversation starter—not a
              scientific prediction.
            </p>

            <div class="notice">
              No dealbreakers detected in this demo comparison.
            </div>
          </section>

          <section class="panel">

            ${categories.map(category => `
              <div class="row">
                <span>${category[0]}</span>
                <b>${category[1]}%</b>
              </div>

              <div class="bar">
                <i style="width:${category[1]}%"></i>
              </div>
            `).join("")}

          </section>

        </div>
      </div>
    </main>
  `;
};

// --------------------------------------------------
// 8. DEMO DASHBOARD
// --------------------------------------------------

const dashboard = () => `
  <main class="app-main">
    <div class="shell">

      <div class="title-row">
        <div>
          <h1>Good evening, Priya</h1>
          <p>Here’s what’s moving in your home search.</p>
        </div>
      </div>

      <div class="notice">
        You are viewing the fictional HomieGo demo dashboard.
      </div>

      <div class="cards">

        <article class="card">
          <span class="num">YOUR TOP MATCH</span>
          <h3>92% with Aanya</h3>
          <p>Similar budgets, routines and shared-space expectations.</p>

          <button class="small primary"
            onclick="go('discover')">
            View match
          </button>
        </article>

        <article class="card">
          <span class="num">CONNECTIONS</span>

          <h3>
            ${state.connections.length} pending request${state.connections.length === 1 ? "" : "s"}
          </h3>

          <p>Start with a thoughtful introduction and take your time.</p>

          <button class="small secondary"
            onclick="go('messages')">
            Open messages
          </button>
        </article>

        <article class="card">
          <span class="num">HOUSEHOLD</span>

          <h3>
            ${money(state.expenses.reduce((sum, expense) => sum + expense.amount, 0))}
            tracked
          </h3>

          <p>Manage upcoming shared costs and chores in one calm place.</p>

          <button class="small secondary"
            onclick="go('household')">
            Open household
          </button>
        </article>

      </div>
    </div>
  </main>
`;

// --------------------------------------------------
// 9. DEMO MESSAGES
// --------------------------------------------------

const messages = () => `
  <main class="app-main">
    <div class="shell">

      <div class="title-row">
        <div>
          <h1>Messages</h1>
          <p>Demo messages are stored only in this browser.</p>
        </div>
      </div>

      <section class="panel chat">

        <aside class="convos">
          <div class="convo">
            <b>Aanya</b>
            <br>
            <span class="meta">Looking forward to chatting!</span>
          </div>
        </aside>

        <div class="thread">

          <div class="bubble">
            Hi Priya! I noticed we have similar home routines.
            How flexible is your move-in date?
          </div>

          ${state.messages.map(message => `
            <div class="bubble mine">
              ${escapeHtml(message)}
            </div>
          `).join("")}

          <div class="send">

            <input
              id="message"
              placeholder="Write a message"
              onkeydown="if(event.key==='Enter')sendMessage()"
            >

            <button class="cta" onclick="sendMessage()">
              Send
            </button>

          </div>

        </div>
      </section>

    </div>
  </main>
`;

window.sendMessage = () => {
  const input = document.querySelector("#message");
  const value = input.value.trim();

  if (!value) return;

  state.messages.push(value);
  persist();

  render();
};

// --------------------------------------------------
// 10. DEMO HOUSEHOLD
// --------------------------------------------------

const household = () => {
  const total = state.expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const owed = total / 3;

  const openChores = state.chores.filter(chore => !chore.done).length;

  return `
    <main class="app-main">
      <div class="shell">

        <div class="title-row">
          <div>
            <h1>Our household</h1>
            <p>Shared living tools for you, Aanya and Arjun.</p>
          </div>
        </div>

        <div class="notice">
          Fictional demo household. Data is not shared with other users.
        </div>

        <div class="tabs">
          <button class="active">Overview</button>
          <button onclick="go('expenses')">Expenses</button>
          <button onclick="go('chores')">Chores</button>
        </div>

        <div class="cards">

          <article class="card">
            <span class="num">THIS MONTH</span>
            <h3>${money(total)} shared spend</h3>
            <p>Each person's equal share is ${money(owed)}.</p>

            <button class="small primary"
              onclick="go('expenses')">
              Add expense
            </button>
          </article>

          <article class="card">
            <span class="num">CHORES</span>
            <h3>${openChores} open task${openChores === 1 ? "" : "s"}</h3>
            <p>Make home care visible, fair and easy to rotate.</p>

            <button class="small secondary"
              onclick="go('chores')">
              Manage chores
            </button>
          </article>

          <article class="card">
            <span class="num">NEXT UP</span>
            <h3>Rent reminder</h3>
            <p>
              Due 1 December · add reminders in the
              production calendar integration.
            </p>
          </article>

        </div>
      </div>
    </main>
  `;
};

// --------------------------------------------------
// 11. DEMO EXPENSES
// --------------------------------------------------

const expenses = () => `
  <main class="app-main">
    <div class="shell">

      <div class="title-row">
        <div>
          <h1>Shared expenses</h1>
          <p>Equal split across three household members.</p>
        </div>
      </div>

      <div class="notice">
        Demo expenses are stored only in this browser.
      </div>

      <div class="compat">

        <section class="panel form">
          <h3>Add an expense</h3>

          <label>What was it for?</label>
          <input id="expenseName" placeholder="e.g. Internet">

          <label>Amount (₹)</label>
          <input id="expenseAmount" type="number" min="1" placeholder="600">

          <button class="cta"
            style="margin-top:14px"
            onclick="addExpense()">
            Add shared expense
          </button>
        </section>

        <section class="panel">

          <h3>Expense history</h3>

          <table class="table">
            <tr>
              <th>Expense</th>
              <th>Total</th>
              <th>Each share</th>
            </tr>

            ${state.expenses.map(expense => `
              <tr>
                <td>${escapeHtml(expense.name)}</td>
                <td>${money(expense.amount)}</td>
                <td>${money(expense.amount / 3)}</td>
              </tr>
            `).join("") || `
              <tr>
                <td colspan="3">No expenses added yet.</td>
              </tr>
            `}

          </table>

        </section>

      </div>
    </div>
  </main>
`;

window.addExpense = () => {
  const name = document.querySelector("#expenseName").value.trim();
  const amount = Number(document.querySelector("#expenseAmount").value);

  if (!name || !Number.isFinite(amount) || amount <= 0) {
    return toast("Add an expense name and valid amount");
  }

  state.expenses.push({ name, amount });

  persist();
  render();

  toast("Demo expense added");
};

// --------------------------------------------------
// 12. DEMO CHORES
// --------------------------------------------------

const chores = () => `
  <main class="app-main">
    <div class="shell">

      <div class="title-row">
        <div>
          <h1>Household chores</h1>
          <p>Make commitments clear without the awkwardness.</p>
        </div>
      </div>

      <div class="notice">
        Demo chores are stored only in this browser.
      </div>

      <div class="compat">

        <section class="panel form">

          <h3>Add a chore</h3>

          <label>Chore</label>
          <input id="choreName" placeholder="e.g. Take out recycling">

          <label>Assign to</label>

          <select id="chorePerson">
            <option>Priya</option>
            <option>Aanya</option>
            <option>Arjun</option>
          </select>

          <button class="cta"
            style="margin-top:14px"
            onclick="addChore()">
            Assign chore
          </button>

        </section>

        <section class="panel">

          <h3>Current rotation</h3>

          <div class="list">

            ${state.chores.map((chore, index) => `
              <div class="convo">

                <b>${escapeHtml(chore.name)}</b>

                <br>

                <span class="meta">
                  Assigned to ${escapeHtml(chore.person)}
                </span>

                <button class="small secondary"
                  style="float:right"
                  onclick="finishChore(${index})">
                  ${chore.done ? "Completed" : "Mark done"}
                </button>

              </div>
            `).join("") || `
              <div class="empty">No chores assigned yet.</div>
            `}

          </div>

        </section>

      </div>
    </div>
  </main>
`;

window.addChore = () => {
  const name = document.querySelector("#choreName").value.trim();
  const person = document.querySelector("#chorePerson").value;

  if (!name) return toast("Add a chore first");

  state.chores.push({
    name,
    person,
    done: false
  });

  persist();
  render();
};

window.finishChore = (index) => {
  if (!state.chores[index]) return;

  state.chores[index].done = true;

  persist();
  render();

  toast("Chore marked complete");
};

// --------------------------------------------------
// 13. LOGIN PAGE
// --------------------------------------------------

const login = () => publicPage(
  "Welcome to HomieGo",
  `
    <div class="compat">

      <section>
        <span class="eyebrow">Your next chapter starts here</span>

        <h2 style="margin-bottom:9px">
          Find your people. Find your place.
        </h2>

        <p class="sub">
          Sign in to discover compatible roommates
          and make shared living better.
        </p>

        <button class="ghost"
          onclick="go('register')">
          Create an account
        </button>

        <p class="meta" style="margin-top:20px">
          New to HomieGo? Registration is free.
        </p>
      </section>

      <section class="form">

        <h3>Sign in</h3>

        <form onsubmit="handleLogin(event)">

          <label>Email address</label>

          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            autocomplete="email"
            required
          >

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Your password"
            autocomplete="current-password"
            required
          >

          <button
            class="cta"
            type="submit"
            style="margin-top:18px;width:100%">
            Sign in
          </button>

        </form>

        <p class="meta" style="margin-top:15px">
          Don't have an account?
          <a href="#register">Register here</a>
        </p>

        <div class="notice" style="margin-top:20px">
          Prefer exploring first?

          <button class="small secondary"
            onclick="demo();go('discover')">
            Explore demo
          </button>
        </div>

      </section>

    </div>
  `
);

// --------------------------------------------------
// 14. REGISTRATION PAGE
// --------------------------------------------------

const register = () => publicPage(
  "Create your HomieGo account",
  `
    <div class="compat">

      <section>
        <span class="eyebrow">Welcome home</span>

        <h2>Start with who you are.</h2>

        <p class="sub">
          Create your account to find roommates
          who fit your lifestyle.
        </p>
      </section>

      <section class="form">

        <h3>Create account</h3>

        <form onsubmit="handleRegister(event)">

          <label>First name</label>

          <input
            name="first_name"
            placeholder="Your first name"
            maxlength="80"
            autocomplete="given-name"
            required
          >

          <label>Email address</label>

          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            autocomplete="email"
            required
          >

          <label>Password</label>

          <input
            type="password"
            name="password"
            minlength="10"
            maxlength="128"
            autocomplete="new-password"
            placeholder="At least 10 characters"
            required
          >

          <button
            class="cta"
            type="submit"
            style="margin-top:18px;width:100%">
            Create account
          </button>

        </form>

        <p class="meta" style="margin-top:15px">
          Already registered?
          <a href="#login">Sign in</a>
        </p>

      </section>

    </div>
  `
);

// --------------------------------------------------
// 15. AUTHENTICATION HANDLERS
// --------------------------------------------------

window.handleLogin = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const button = form.querySelector("button[type='submit']");

  const formData = new FormData(form);

  const payload = {
    email: formData.get("email").trim(),
    password: formData.get("password")
  };

  button.disabled = true;
  button.textContent = "Signing in...";

  try {
    await api.auth.login(payload);

    state.user = await api.auth.me();

    state.demo = false;
    persist();

    toast(`Welcome back, ${state.user.first_name}`);

    go("account");

  } catch (error) {
    toast(error.message || "Login failed");

    button.disabled = false;
    button.textContent = "Sign in";
  }
};

window.handleRegister = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const button = form.querySelector("button[type='submit']");

  const formData = new FormData(form);

  const payload = {
    first_name: formData.get("first_name").trim(),
    email: formData.get("email").trim(),
    password: formData.get("password")
  };

  button.disabled = true;
  button.textContent = "Creating account...";

  try {
    await api.auth.register(payload);

    state.user = await api.auth.me();

    state.demo = false;
    persist();

    toast("Your HomieGo account is ready!");

    go("account");

  } catch (error) {
    toast(error.message || "Registration failed");

    button.disabled = false;
    button.textContent = "Create account";
  }
};

// --------------------------------------------------
// 16. AUTHENTICATED ACCOUNT PAGE
// --------------------------------------------------

const account = () => {
  if (!state.user) {
    return login();
  }

  const user = state.user;

  return publicPage(
    "Your HomieGo account",
    `
      <span class="eyebrow">Account information</span>

      <h2>
        Welcome, ${escapeHtml(user.first_name)}
      </h2>

      <p class="sub">
        ${escapeHtml(user.occupation || "Occupation not added")}
      </p>

      <div class="row">
        <span>Account status</span>
        <b>Authenticated</b>
      </div>

      <div class="row">
        <span>Neighbourhood</span>
        <b>${escapeHtml(user.neighbourhood || "Not added yet")}</b>
      </div>

      <div class="row">
        <span>Monthly budget</span>
        <b>
          ${user.budget != null
            ? money(user.budget)
            : "Not added yet"}
        </b>
      </div>

      <button class="ghost"
        style="margin-top:20px"
        onclick="logout()">
        Sign out
      </button>
    `
  );
};

window.logout = () => {
  api.auth.logout();

  state.user = null;
  state.demo = false;

  persist();

  toast("You have signed out");

  go("home");
};

// --------------------------------------------------
// 17. SESSION RESTORATION
// --------------------------------------------------

async function restoreSession() {
  if (!api.auth.isAuthenticated()) {
    return;
  }

  state.authLoading = true;

  try {
    state.user = await api.auth.me();
  } catch (error) {
    api.auth.logout();
    state.user = null;
  } finally {
    state.authLoading = false;
    render();
  }
}

// --------------------------------------------------
// 18. SAFETY
// --------------------------------------------------

const safety = () => publicPage(
  "Safety centre",
  `
    <h3>Your safety comes first.</h3>

    <div class="cards">

      <article class="card">
        <h3>Keep it in-app</h3>
        <p>
          Use messages and connections first.
          Don't share your home address or financial details too early.
        </p>
      </article>

      <article class="card">
        <h3>Meet thoughtfully</h3>
        <p>
          Meet in a public place, tell someone you trust,
          and take your time before committing.
        </p>
      </article>

      <article class="card">
        <h3>Report concerns</h3>
        <p>
          Demo reporting is illustrative only.
          Production reporting requires moderation operations.
        </p>

        <button class="small secondary"
          onclick="toast('Demo report recorded locally — no moderation team is notified.')">
          Report a profile
        </button>
      </article>

    </div>
  `
);

// --------------------------------------------------
// 19. ONBOARDING DEMO
// --------------------------------------------------

const onboarding = () => publicPage(
  "Tell us about home",
  `
    <span class="eyebrow">Step 2 of 4</span>

    <h2>Location & budget</h2>

    <div class="bar">
      <i style="width:50%"></i>
    </div>

    <div class="form"
      style="margin-top:20px;max-width:620px">

      <label>Preferred neighbourhood</label>

      <select>
        <option>Koramangala</option>
        <option>HSR Layout</option>
        <option>Indiranagar</option>
        <option>Whitefield</option>
      </select>

      <label>Monthly budget</label>

      <input type="number" value="28000">

      <label>Move-in date</label>

      <input type="date">

      <button class="cta"
        style="margin-top:17px"
        onclick="toast('This demo onboarding is not connected to the backend yet.')">
        Save and continue
      </button>

    </div>
  `
);

// --------------------------------------------------
// 20. SETTINGS
// --------------------------------------------------

const settings = () => publicPage(
  "Settings",
  `
    <h3>Demo controls</h3>

    <p class="sub">
      The demo's data remains in this browser.
    </p>

    <button class="ghost" onclick="resetDemoData()">
      Reset demo data
    </button>
  `
);

window.resetDemoData = () => {
  [
    "hgDemo",
    "hgSaved",
    "hgMessages",
    "hgExpenses",
    "hgChores",
    "hgConnections"
  ].forEach(key => localStorage.removeItem(key));

  state.demo = false;
  state.saved = [];
  state.messages = [];
  state.expenses = [];
  state.chores = [];
  state.connections = [];

  toast("Demo data reset");

  go("home");
};

// --------------------------------------------------
// 21. HOW IT WORKS
// --------------------------------------------------

const how = () => publicPage(
  "How HomieGo works",
  `
    <div class="cards">

      <article class="card">
        <span class="num">01</span>
        <h3>Build your living profile</h3>
        <p>
          Capture your budget, routines,
          boundaries and home preferences.
        </p>
      </article>

      <article class="card">
        <span class="num">02</span>
        <h3>Explore compatible people</h3>
        <p>
          Use filters and transparent compatibility
          context to find a fit.
        </p>
      </article>

      <article class="card">
        <span class="num">03</span>
        <h3>Make a home work</h3>
        <p>
          Connect, chat and organise day-to-day shared living.
        </p>
      </article>

    </div>
  `
);

// --------------------------------------------------
// 22. ROUTING AND RENDERING
// --------------------------------------------------

function render() {
  state.page = location.hash.slice(1) || "home";

  const pages = {
    home,
    how,
    discover,
    properties,
    compatibility,
    dashboard,
    messages,
    household,
    expenses,
    chores,
    login,
    register,
    account,
    safety,
    onboarding,
    settings
  };

  const page = pages[state.page] || home;

  const content = page();

  app.innerHTML = `
    ${nav()}

    ${content}

    <footer class="footer">
      <div class="shell">

        <div class="brand" style="color:white">
          <span class="brandmark">⌂</span>HomieGo
        </div>

        <p>
          Find your people. Find your place.
          Demonstration product · Privacy and terms
          require legal review before commercial launch.
        </p>

      </div>
    </footer>
  `;
}

window.addEventListener("hashchange", render);

// Initial rendering.
render();

// Restore authenticated account after page refresh.
restoreSession();