/**
 * phone-launcher-theme / Tailwind v3 adapter
 *
 * Maps the tokens onto a Tailwind v3 preset so you get utilities like
 * bg-ph-accent, shadow-ph-device, rounded-ph-icon, text-ph-h1.
 *
 * There is not one literal value in this file. Every entry is a var()
 * reference to a custom property declared in tokens.css, which stays the
 * single source of truth. Change a value there and both Tailwind versions
 * follow.
 *
 * Because the values are var() references, tokens.css has to be loaded for
 * anything here to resolve. Import it at the top of your stylesheet:
 *
 *   @import "./path/to/tokens/tokens.css";
 *   @tailwind base;
 *   @tailwind components;
 *   @tailwind utilities;
 *
 * Then in tailwind.config.js:
 *
 *   module.exports = {
 *     presets: [require("./path/to/tokens/preset.js")],
 *     content: ["./src/**\/*.{html,js,jsx,ts,tsx}"],
 *   };
 *
 * VERIFICATION. Compiled with the Tailwind v3 CLI (tailwindcss 3.4.17,
 * Node 24.14.0) against a bare project importing tokens.css and this preset,
 * with an HTML source listing one utility per entry. All 68 entries generate.
 *
 * One known limit of the var() approach: Tailwind's slash opacity modifiers
 * cannot compute against a variable. This was compiled rather than assumed:
 * on 3.4.17, bg-ph-accent/50 and text-ph-ink/75 generate no rule at all
 * while plain bg-ph-accent generates normally, so the failure is silent. If
 * you need a translucent accent, declare the alpha variant as its own token
 * in tokens.css.
 *
 * The length: hint that v4's adapter documents at length applies here too in
 * bracket form, compiled on 3.4.17: border-[var(--ph-border-width)] sets
 * border-color while border-[length:var(--ph-border-width)] sets border-width.
 * The question mostly does not come up on v3, because borderWidth is a
 * first-class theme key and this preset uses it.
 *
 * On Tailwind v4, use theme.css instead. This file is v3 only.
 */

const v = (name) => `var(--${name})`;

module.exports = {
  theme: {
    extend: {
      colors: {
        "ph-ground": v("ph-ground"),
        "ph-stage": v("ph-stage"),
        "ph-scene": v("ph-scene"),
        "ph-surface": v("ph-surface"),
        "ph-chrome": v("ph-chrome"),
        "ph-surface-muted": v("ph-surface-muted"),
        "ph-ink": v("ph-ink"),
        "ph-ink-muted": v("ph-ink-muted"),
        "ph-accent": v("ph-accent"),
        "ph-accent-ink": v("ph-accent-ink"),
        "ph-destructive": v("ph-destructive"),
        "ph-destructive-ink": v("ph-destructive-ink"),
        "ph-success": v("ph-fill-success"),
        "ph-info": v("ph-fill-info"),
        "ph-warning": v("ph-fill-warning"),
        "ph-danger": v("ph-fill-danger"),
        "ph-border": v("ph-border"),
        "ph-border-strong": v("ph-border-strong"),
      },

      boxShadow: {
        "ph-sm": v("ph-shadow-sm"),
        "ph-raised": v("ph-shadow-raised"),
        "ph-device": v("ph-shadow-device"),
      },

      borderRadius: {
        "ph-tight": v("ph-radius-tight"),
        ph: v("ph-radius"),
        "ph-icon": v("ph-radius-icon"),
        "ph-sheet": v("ph-radius-sheet"),
        "ph-screen": v("ph-radius-screen"),
        "ph-device": v("ph-radius-device"),
        "ph-pill": v("ph-radius-pill"),
      },

      borderWidth: {
        ph: v("ph-border-width"),
      },

      fontFamily: {
        "ph-sans": v("ph-font-sans"),
        "ph-mono": v("ph-font-mono"),
      },

      fontWeight: {
        "ph-body": v("ph-weight-body"),
        "ph-medium": v("ph-weight-medium"),
        "ph-bold": v("ph-weight-bold"),
        "ph-display": v("ph-weight-display"),
      },

      fontSize: {
        "ph-display": v("ph-text-display"),
        "ph-h1": v("ph-text-h1"),
        "ph-h2": v("ph-text-h2"),
        "ph-h3": v("ph-text-h3"),
        "ph-lead": v("ph-text-lead"),
        "ph-body": v("ph-text-body"),
        "ph-sm": v("ph-text-sm"),
        "ph-xs": v("ph-text-xs"),
      },

      lineHeight: {
        "ph-tight": v("ph-leading-tight"),
        "ph-snug": v("ph-leading-snug"),
        "ph-body": v("ph-leading-body"),
      },

      letterSpacing: {
        "ph-tight": v("ph-tracking-tight"),
        "ph-wide": v("ph-tracking-wide"),
      },

      spacing: {
        "ph-1": v("ph-space-1"),
        "ph-2": v("ph-space-2"),
        "ph-3": v("ph-space-3"),
        "ph-4": v("ph-space-4"),
        "ph-6": v("ph-space-6"),
        "ph-8": v("ph-space-8"),
        "ph-12": v("ph-space-12"),
        "ph-16": v("ph-space-16"),

        "ph-statusbar": v("ph-statusbar-height"),
        "ph-dock": v("ph-dock-height"),
        "ph-sheet-header": v("ph-sheet-header"),
        "ph-plate": v("ph-app-plate"),
        "ph-cell": v("ph-app-cell"),
        "ph-gap": v("ph-app-gap"),
        "ph-bezel": v("ph-bezel"),
        "ph-indicator-w": v("ph-indicator-width"),
        "ph-indicator-h": v("ph-indicator-height"),
      },

      maxWidth: {
        "ph-device": v("ph-device-width"),
        "ph-measure": v("ph-measure"),
      },

      transitionTimingFunction: {
        ph: v("ph-ease"),
      },
    },
  },
};
