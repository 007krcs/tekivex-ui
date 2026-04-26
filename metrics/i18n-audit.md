# i18n audit — 2026-04-26T19:01:11.489Z

**420 hardcoded strings** across 72 files.

## Breakdown by kind

- `jsx-text`: 347
- `prop:aria-label`: 59
- `prop:title`: 9
- `prop:placeholder`: 5

## Top 20 affected files

| File | Count |
|---|---|
| `src/components/TkxThemeBuilder.tsx` | 27 |
| `src/components/TkxForm.tsx` | 23 |
| `src/components/TkxDatePicker.tsx` | 22 |
| `src/components/TkxDataGrid.tsx` | 18 |
| `src/components/TkxVideoPlayer.tsx` | 17 |
| `src/components/TkxPlayground.tsx` | 16 |
| `src/components/TkxCheckout.tsx` | 14 |
| `src/components/TkxImageEditor.tsx` | 13 |
| `src/components/TkxCommand.tsx` | 11 |
| `src/components/TkxQuantumForm.tsx` | 11 |
| `src/components/TkxSelect.tsx` | 11 |
| `src/components/TkxDropdown.tsx` | 10 |
| `src/components/TkxMarkdown.tsx` | 10 |
| `src/components/TkxImage.tsx` | 9 |
| `src/components/TkxSortable.tsx` | 9 |
| `src/components/TkxCarousel.tsx` | 8 |
| `src/components/TkxChat.tsx` | 8 |
| `src/components/TkxPhoneInput.tsx` | 8 |
| `src/components/TkxTable.tsx` | 8 |
| `src/components/TkxToast.tsx` | 8 |

## Sample findings (first 50)

| File | Line | Kind | Value |
|---|---|---|---|
| `src/components/TkxAccordion.tsx` | 174 | JSX text | `(null);
  const innerRef = useRef` |
| `src/components/TkxAccordion.tsx` | 298 | JSX text | `normalizeInitial(defaultOpen)
  );

  const openIds: Set` |
| `src/components/TkxAddressInput.tsx` | 249 | prop `aria-label` | `Matching post offices` |
| `src/components/TkxAddressInput.tsx` | 288 | prop `placeholder` | `Address line 1` |
| `src/components/TkxAddressInput.tsx` | 297 | prop `placeholder` | `Address line 2 (optional)` |
| `src/components/TkxAddressInput.tsx` | 100 | JSX text | `([]);
    const [loading, setLoading] = useState(false);
    const [error, setEr` |
| `src/components/TkxAddressInput.tsx` | 207 | JSX text | `PIN code` |
| `src/components/TkxAddressInput.tsx` | 225 | JSX text | `City` |
| `src/components/TkxAddressInput.tsx` | 236 | JSX text | `State` |
| `src/components/TkxAffix.tsx` | 51 | JSX text | `(null);
  const fixedRef = useRef` |
| `src/components/TkxAIChatBubble.tsx` | 218 | prop `title` | `Copy message` |
| `src/components/TkxAIThinking.tsx` | 120 | JSX text | `,
    pulse:` |
| `src/components/TkxAIThinking.tsx` | 121 | JSX text | `,
    wave:` |
| `src/components/TkxAIThinking.tsx` | 122 | JSX text | `,
    orbit:` |
| `src/components/TkxAIThinking.tsx` | 154 | JSX text | `⚛ Quantum AI · Amplitude Amplification` |
| `src/components/TkxAlert.tsx` | 82 | prop `aria-label` | `Dismiss alert` |
| `src/components/TkxAlert.tsx` | 26 | JSX text | `),
  success: (` |
| `src/components/TkxAlert.tsx` | 31 | JSX text | `),
  warning: (` |
| `src/components/TkxAlert.tsx` | 36 | JSX text | `),
  danger: (` |
| `src/components/TkxAnchor.tsx` | 173 | prop `aria-label` | `Anchor navigation` |
| `src/components/TkxAnchor.tsx` | 53 | JSX text | `void;
  theme: ReturnType` |
| `src/components/TkxAppBar.tsx` | 203 | prop `aria-label` | `Main navigation` |
| `src/components/TkxAppBar.tsx` | 242 | prop `aria-label` | `Main navigation` |
| `src/components/TkxAppBar.tsx` | 74 | JSX text | `setIsMobile(window.innerWidth` |
| `src/components/TkxAutocomplete.tsx` | 136 | JSX text | `(null);
  const wrapperRef = useRef` |
| `src/components/TkxAutocomplete.tsx` | 245 | JSX text | `= 0 && activeIndex` |
| `src/components/TkxAutocomplete.tsx` | 302 | JSX text | `Loading...` |
| `src/components/TkxAutocomplete.tsx` | 304 | JSX text | `) : filtered.length === 0 ? (` |
| `src/components/TkxAutocomplete.tsx` | 383 | JSX text | `,
          document.body,
        )
      : null;

  return (` |
| `src/components/TkxBottomNav.tsx` | 128 | prop `aria-label` | `Bottom navigation` |
| `src/components/TkxBottomNav.tsx` | 139 | prop `aria-label` | `Navigation tabs` |
| `src/components/TkxBreadcrumb.tsx` | 99 | JSX text | `&hellip;` |
| `src/components/TkxCaptcha.tsx` | 55 | JSX text | `void;
  /** Optional className applied to the host` |
| `src/components/TkxCaptcha.tsx` | 56 | JSX text | `. */
  className?: string;
  /** Optional inline style applied to the host` |
| `src/components/TkxCaptcha.tsx` | 139 | JSX text | `(null);
  const widgetIdRef = useRef` |
| `src/components/TkxCaptcha.tsx` | 140 | JSX text | `(null);
  const tokenRef = useRef` |
| `src/components/TkxCaptcha.tsx` | 299 | JSX text | `[TkxCaptcha test mode — auto-verifying with TEST_TOKEN]` |
| `src/components/TkxCarousel.tsx` | 343 | prop `aria-label` | `Content carousel` |
| `src/components/TkxCarousel.tsx` | 425 | prop `aria-label` | `Slide indicators` |
| `src/components/TkxCarousel.tsx` | 479 | prop `aria-label` | `Slide thumbnails` |
| `src/components/TkxCarousel.tsx` | 112 | JSX text | `)
      ) : isPrev ? (` |
| `src/components/TkxCarousel.tsx` | 165 | JSX text | `(null);
  const autoPlayRef = useRef` |
| `src/components/TkxCarousel.tsx` | 166 | JSX text | `(null);

  // Drag / swipe state
  const dragStartRef = useRef` |
| `src/components/TkxCarousel.tsx` | 169 | JSX text | `(null);
  const dragDeltaRef = useRef` |
| `src/components/TkxCarousel.tsx` | 332 | JSX text | `0;
  const canNext = loop \|\| currentIdx` |
| `src/components/TkxCascader.tsx` | 82 | JSX text | `(null);
  const dropdownRef = useRef` |
| `src/components/TkxCascader.tsx` | 83 | JSX text | `(null);
  const [open, setOpen] = useState(false);
  const [hoverPath, setHoverP` |
| `src/components/TkxCascader.tsx` | 223 | JSX text | `,
        document.body,
      )
    : null;

  return (` |
| `src/components/TkxChat.tsx` | 97 | prop `aria-label` | `Assistant is thinking` |
| `src/components/TkxChat.tsx` | 178 | prop `aria-label` | `Error` |
