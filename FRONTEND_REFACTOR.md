# Deal Animation Refactor

## Overview

Extract deal animation logic into a dedicated `DealingBoard` wrapper component. This separates concerns - board components focus on rendering cards, `DealingBoard` handles animation orchestration.

**Key insight:** Use Motion's `initial` and `animate` props. When button is clicked, we set `initialState: "hidden"`. When new cards mount, they start at `initial="hidden"` and Motion automatically animates to `animate="visible"`. No callbacks, no refs, no effect hooks tracking changes.

---

## Step 1: Create DealingBoard Component

**File:** `frontend/src/gameplay/game-board/boards/dealing-board.tsx`

Create new file with:
- `DealInitialState` type: `"hidden" | "visible"`
- `dealBoardVariants` - container animation (stagger children)
- `dealCardVariants` - individual card fly-in animation
- `DealingBoard` component that wraps children in motion wrappers

**Props:**
- `children: ReactNode`
- `initialState: DealInitialState` - controls where cards start on mount
- `className?: string`

**How it works:**
- `initialState="hidden"` → cards mount offscreen, animate in
- `initialState="visible"` → cards appear instantly (no animation)
- `animate` is always `"visible"` - Motion handles the transition

---

## Step 2: Update card-animation-variants.ts

**File:** `frontend/src/gameplay/game-board/cards/card-animation-variants.ts`

Remove deal-related variants from this file since `DealingBoard` now owns them:
- Remove `hidden` variant from `boardVariants`
- Remove deal animation logic (stagger, delayChildren for deal)
- Keep only `visible` and `gameOverReveal` variants

---

## Step 3: Simplify GameCard

**File:** `frontend/src/gameplay/game-board/cards/game-card.tsx`

Remove deal animation awareness:
- Remove `cardIndex` dependency for deal stagger (still needed for cover card rotation)
- Remove outer `motion.div` wrapper that was for deal animation
- Keep `motion.div` wrapper only if needed for other animations
- Card is now purely presentational for its own state (flipped, revealed, etc.)

---

## Step 4: Create Deal Animation Context

**File:** `frontend/src/gameplay/game-board/deal-animation-context.tsx`

Create context to share deal state between button click and board:

```tsx
type DealInitialState = "hidden" | "visible";

interface DealAnimationContextValue {
  initialState: DealInitialState;
  triggerDeal: () => void;  // Sets initialState to "hidden"
  resetDeal: () => void;    // Sets initialState back to "visible"
}

export const DealAnimationContext = createContext<DealAnimationContextValue>(...);
export const DealAnimationProvider = ...
export const useDealAnimation = () => useContext(DealAnimationContext);
```

---

## Step 5: Refactor SpectatorBoard

**File:** `frontend/src/gameplay/game-board/boards/spectator-board.tsx`

### View Component (`SpectatorBoardView`):
- Remove props: `wordsKey`, `dealOnEntry`, `boardAnimationState`
- Add prop: `initialState: DealInitialState`
- Wrap card rendering with `<DealingBoard initialState={initialState}>`
- Remove all `useLayoutEffect` / `useRef` / wordsKey tracking

### Container Component (`SpectatorBoard`):
- Get `initialState` from `useDealAnimation()` context
- Pass it to view
- Remove all deal detection logic

---

## Step 6: Refactor CodebreakerBoard

**File:** `frontend/src/gameplay/game-board/boards/codebreaker-board.tsx`

Same pattern as SpectatorBoard:

### View Component (`CodebreakerBoardView`):
- Remove wordsKey/dealOnEntry logic
- Add `initialState` prop
- Wrap with `<DealingBoard>`

### Container Component (`CodebreakerBoard`):
- Get `initialState` from context
- Pass to view

---

## Step 7: Update Deal/Redeal Button

**File:** Find the deal button component (lobby actions panel or similar)

When deal/redeal button is clicked:
1. Call `triggerDeal()` from context → sets `initialState: "hidden"`
2. Call API to deal cards
3. When API returns, new cards mount with `initial="hidden"` and animate in
4. After animation completes (or on next user action), call `resetDeal()`

---

## Step 8: Wire Up Provider

**File:** Wrap the game page/route with `<DealAnimationProvider>`

Ensure both the deal button and board components are within the provider.

---

## Step 9: Update Board Exports

**File:** `frontend/src/gameplay/game-board/boards/index.ts`

Export the new `DealingBoard` component and `DealInitialState` type.

---

## Step 10: Cleanup

- Remove console.log statements added for debugging
- Remove unused imports (`useLayoutEffect`, `useRef` from boards)
- Verify TypeScript compiles cleanly
- Test deal animation triggers correctly:
  - ✅ First deal from lobby (button click → triggerDeal → API → cards animate in)
  - ✅ Re-deal (same flow)
  - ❌ Page refresh (initialState defaults to "visible" → no animation)
  - ❌ Navigation back to game (same → no animation)

---

## Animation Flow

```
Button Click Flow:
─────────────────
1. User clicks "Deal"
2. triggerDeal() → initialState = "hidden"
3. API call to deal cards
4. New cards arrive, components mount
5. DealingBoard has initial="hidden", animate="visible"
6. Motion animates cards from hidden → visible (staggered fly-in)
7. resetDeal() called → initialState = "visible" (for future mounts)

Page Load Flow:
───────────────
1. Page loads with existing cards
2. initialState = "visible" (default)
3. DealingBoard has initial="visible", animate="visible"
4. Cards appear instantly (no animation)
```

---

## File Summary

| File | Action |
|------|--------|
| `boards/dealing-board.tsx` | **CREATE** - New wrapper component |
| `game-board/deal-animation-context.tsx` | **CREATE** - Context for deal state |
| `cards/card-animation-variants.ts` | **MODIFY** - Remove deal variants |
| `cards/game-card.tsx` | **MODIFY** - Remove deal awareness |
| `boards/spectator-board.tsx` | **MODIFY** - Use DealingBoard + context |
| `boards/codebreaker-board.tsx` | **MODIFY** - Use DealingBoard + context |
| `boards/index.ts` | **MODIFY** - Export DealingBoard |
| Deal button component | **MODIFY** - Call triggerDeal() on click |
| Game page/route | **MODIFY** - Wrap with DealAnimationProvider |

---

## Testing Checklist

- [ ] Deal animation plays when clicking "Deal" from lobby
- [ ] Deal animation plays when clicking "Re-deal" / new round
- [ ] NO animation on page refresh with existing cards
- [ ] NO animation when navigating to game page
- [ ] Game over reveal animation still works
- [ ] Card flip animations still work
- [ ] Spymaster overlay animations still work
