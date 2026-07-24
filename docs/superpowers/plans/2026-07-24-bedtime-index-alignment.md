# Bedtime Index Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align all five bedtime descriptions on the same row beneath their corresponding slider numbers.

**Architecture:** Keep the shared `Slider` unchanged. Configure the bedtime slider with a complete 1–5 `indexLabels` map and remove its separate endpoint-description props.

**Tech Stack:** React, Tailwind CSS, Node test runner, Vite.

## Global Constraints

- Do not modify shared `Slider` layout.
- Do not change any other survey slider.
- Preserve the exact five Korean time-range labels.

---

### Task 1: Complete bedtime index mapping

**Files:**
- Modify: `src/pages/Surveys/components/sliderIndexLabels.test.js`
- Modify: `src/pages/Surveys/SurveySleep.jsx`

**Interfaces:**
- Consumes: `Slider`'s existing `indexLabels` prop.
- Produces: one 1–5 bedtime label map rendered in a single row.

- [ ] **Step 1: Update the test to require all five labels and no endpoint-description props**

Assert that the bedtime slider maps values 1 through 5 and does not place `leftDescription` or `rightDescription` before that map.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test src/pages/Surveys/components/sliderIndexLabels.test.js`

Expected: FAIL because values 1 and 5 still use separate description props.

- [ ] **Step 3: Update the bedtime slider props**

Remove `leftDescription` and `rightDescription`; add values 1 and 5 to `indexLabels`.

- [ ] **Step 4: Verify**

Run the focused test, `npm.cmd run build`, and `git diff --check`.

Expected: test and build pass with a clean diff check.
