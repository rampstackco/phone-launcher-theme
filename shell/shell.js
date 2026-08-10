/* ==========================================================================
   phone-launcher-theme / shell.js
   --------------------------------------------------------------------------
   The whole shell in one file. Vanilla JS, zero dependencies, and the page
   must remain fully readable without it: everything here is enhancement.
   The contract with shell.css is the `ph-live` class on <html>; every
   behavior and every piece of ARIA this script adds is added here, at
   enhance time, so the plain document never claims semantics it cannot
   honor.

   What the script does, in order:
     1. flips the document into live mode
     2. registers every [data-ph-app] and gives it dialog semantics
     3. injects the back control and the home bar (a control that does
        nothing must not exist, so they cannot be static markup)
     4. turns app and in-content anchors into openers
     5. opens and closes: one app at a time, which is what a phone does
     6. runs the wallpaper switcher in the status bar
     7. binds Escape to closing the open app
     8. runs the status bar clock

   Focus is managed at the two moments it can be lost: opening an app moves
   focus into the sheet, and closing one returns focus to the icon that
   opened it. There is no focus trap anywhere: Tab always walks the whole
   document, and both the closed sheets and the covered home screen leave
   the tab order via display:none.

   One thing this file deliberately does not have is the pilot's window
   stack. A phone shows one app, so there is no pile to raise, no minimize,
   and no topVisible() distinction to get wrong. Escape has exactly one
   thing it can mean here.
   ========================================================================== */

(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;

  /* 1. Live mode. Everything shell.css does differently, it does under this
     class. If the script fails to run, this line never happens and the page
     stays a page. */
  root.classList.add("ph-live");

  var device = doc.querySelector(".ph-device");
  var byId = {};
  var current = null; // the open app, or null for the home screen

  var ICON_BACK =
    '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" ' +
    'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
    'stroke-linejoin="round"><path d="M10 3L5 8l5 5"/></svg>';
  var ICON_WALL =
    '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" ' +
    'stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" ' +
    'stroke-linecap="round">' +
    '<rect x="2.5" y="3.5" width="15" height="13" rx="2"/>' +
    '<circle cx="7.2" cy="8.2" r="1.4"/>' +
    '<path d="M4.5 14.5l4-4.5 3 3 2.5-2.5 3.5 4"/></svg>';

  /* ------------------------------------------------------------------
     2 + 3. Register apps, add dialog semantics, inject controls.
     Non-modal dialogs: role="dialog" names the pattern, aria-modal is
     deliberately absent. Nothing traps, and the status bar stays reachable
     behind the sheet, so claiming modality would be a lie about the one
     thing screen reader users would act on.
     ------------------------------------------------------------------ */
  var appEls = doc.querySelectorAll("[data-ph-app]");
  Array.prototype.forEach.call(appEls, function (el) {
    var title = el.querySelector(".ph-sheet-title");
    if (title && !title.id) title.id = el.id + "-title";

    el.setAttribute("role", "dialog");
    if (title) el.setAttribute("aria-labelledby", title.id);
    el.tabIndex = -1;

    var body = el.querySelector(".ph-sheet-body");
    if (body) {
      /* The scroll region has to be keyboard-scrollable, which means
         focusable. It borrows the app's name so a screen reader says what
         it is scrolling. */
      body.tabIndex = 0;
      if (title) body.setAttribute("aria-labelledby", title.id);
      body.setAttribute("role", "region");
    }

    var app = { el: el, id: el.id, opener: null };
    byId[el.id] = app;

    var name = title ? title.textContent.trim() : el.id;

    var slot = el.querySelector("[data-ph-controls]");
    if (slot) {
      var back = doc.createElement("button");
      back.type = "button";
      back.className = "ph-back";
      back.setAttribute("aria-label", "Close " + name);
      back.innerHTML = ICON_BACK + "<span>Back</span>";
      back.addEventListener("click", function () {
        close(app);
      });
      slot.appendChild(back);
    }

    /* The home bar. Same job as the back control, at the other end of the
       screen, because on a phone the top-left corner is the furthest point
       from a thumb. */
    var foot = el.querySelector("[data-ph-home]");
    if (foot) {
      var home = doc.createElement("button");
      home.type = "button";
      home.className = "ph-home-btn";
      home.setAttribute("aria-label", "Close " + name + " and go home");
      home.innerHTML = '<span class="ph-home-bar"></span>';
      home.addEventListener("click", function () {
        close(app);
      });
      foot.appendChild(home);
    }
  });

  /* ------------------------------------------------------------------
     4. Anchors become openers. Any link to #<app-id>, wherever it is (the
     grid, the dock, inside another app), opens that app.
     ------------------------------------------------------------------ */
  doc.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var app = byId[a.getAttribute("href").slice(1)];
    if (!app) return;
    e.preventDefault();
    open(app, a);
  });

  /* ------------------------------------------------------------------
     5. Open and close. One app at a time: opening a second one closes the
     first without ceremony, exactly as tapping an icon inside an app would.
     ------------------------------------------------------------------ */
  function open(app, opener) {
    if (current && current !== app) {
      current.el.classList.remove("ph-open");
    }
    if (opener) app.opener = opener;
    current = app;
    if (device) device.classList.add("ph-app-open");
    app.el.classList.add("ph-open");
    app.el.focus({ preventScroll: true });
  }

  function close(app) {
    app.el.classList.remove("ph-open");
    if (current === app) current = null;
    if (device) device.classList.remove("ph-app-open");

    /* Never a dead end: focus returns to the icon that opened the app, and
       the home screen is what is behind it. The fallback matters because
       the opener may have been a link inside another app. */
    if (app.opener && isVisible(app.opener)) {
      app.opener.focus();
    } else {
      var first = doc.querySelector(".ph-apps .ph-app");
      if (first) first.focus();
    }
  }

  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  /* ------------------------------------------------------------------
     6. Wallpaper. The screen ground is a wallpaper slot; this script's
     whole involvement is one attribute on the body and one status bar
     button. All the styling lives in shell.css under body[data-wallpaper].
     The enhanced home screen defaults to the scene; the plain document gets
     the quiet field from plain CSS because this line never runs.
     Per-session only, no storage: a demo phone should greet everyone the
     same way.
     ------------------------------------------------------------------ */
  var WALLPAPERS = ["scene", "quiet"];
  doc.body.setAttribute("data-wallpaper", WALLPAPERS[0]);

  var tray = doc.querySelector("[data-ph-tray]");
  if (tray) {
    var wallBtn = doc.createElement("button");
    wallBtn.type = "button";
    wallBtn.className = "ph-status-btn";
    wallBtn.innerHTML = ICON_WALL;
    var labelWall = function () {
      wallBtn.setAttribute(
        "aria-label",
        "Switch wallpaper, now " + doc.body.getAttribute("data-wallpaper")
      );
    };
    labelWall();
    wallBtn.addEventListener("click", function () {
      var cur = doc.body.getAttribute("data-wallpaper");
      var next = WALLPAPERS[(WALLPAPERS.indexOf(cur) + 1) % WALLPAPERS.length];
      doc.body.setAttribute("data-wallpaper", next);
      labelWall();
    });
    tray.appendChild(wallBtn);
  }

  /* ------------------------------------------------------------------
     7. Escape closes the open app. One key, one rule, and here there is
     only ever one thing it could close.
     ------------------------------------------------------------------ */
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (current) close(current);
  });

  /* ------------------------------------------------------------------
     8. The clock. A phone without a clock is a screenshot.
     ------------------------------------------------------------------ */
  var clock = doc.querySelector("[data-ph-clock]");
  if (clock) {
    var tick = function () {
      var d = new Date();
      var h = String(d.getHours());
      var m = String(d.getMinutes());
      clock.textContent =
        (h.length < 2 ? "0" + h : h) + ":" + (m.length < 2 ? "0" + m : m);
    };
    tick();
    setInterval(tick, 30000);
  }

  /* Boot: the home screen. No app opens itself, because a phone that boots
     into an app is a phone somebody left open, and because the first thing
     worth seeing here is the launcher. */
})();
