# Sleep Slider Time Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render time-range labels below values 2, 3, and 4 of the SurveySleep bedtime slider.

**Architecture:** Add an optional `indexLabels` mapping to the shared Slider. Reuse the existing percentage positioning formula in a dedicated label row, and opt in only from the bedtime Slider instance.

**Tech Stack:** React 19, Node.js built-in test runner, Tailwind CSS, ESLint, Vite

## Global Constraints

- Show `10시~11시` below 2.
- Show `11시~12시` below 3.
- Show `12시~1시` below 4.
- Do not change spacing for Slider instances without `indexLabels`.
- Keep labels non-wrapping and visually secondary.

---

### Task 1: Optional slider index labels

**Files:**
- Modify: `src/pages/Surveys/components/Slider.jsx`
- Create: `src/pages/Surveys/components/sliderIndexLabels.test.js`
- Modify: `src/pages/Surveys/SurveySleep.jsx`

- [ ] Write a failing source test that checks `Slider` accepts `indexLabels`, renders `indexLabels[item]` with `text-[10px]` and `whitespace-nowrap`, and SurveySleep passes the exact 2·3·4 mapping.
- [ ] Run `node --test src/pages/Surveys/components/sliderIndexLabels.test.js` and verify failure.
- [ ] Add `indexLabels` to Slider props and render a positioned row only when `Object.keys(indexLabels).length > 0`.
- [ ] Pass `indexLabels={{ 2: '10시~11시', 3: '11시~12시', 4: '12시~1시' }}` to the bedtime Slider.
- [ ] Run `node --test src/pages/Surveys/components/sliderIndexLabels.test.js src/pages/Surveys/surveyPageLayout.test.js`.
- [ ] Run `npm.cmd run lint` and `npm.cmd run build`.
- [ ] Review with `git diff --check` and commit the three task files.
