# i18n audit — 2026-04-26T13:22:07.020Z

**389 hardcoded strings** across 68 files.

## Breakdown by kind

- `jsx-text`: 310
- `prop:aria-label`: 67
- `prop:title`: 9
- `prop:placeholder`: 3

## Top 20 affected files

| File | Count |
|---|---|
| `src/components/TkxThemeBuilder.tsx` | 27 |
| `src/components/TkxForm.tsx` | 23 |
| `src/components/TkxDatePicker.tsx` | 22 |
| `src/components/TkxDataGrid.tsx` | 18 |
| `src/components/TkxVideoPlayer.tsx` | 17 |
| `src/components/TkxPlayground.tsx` | 16 |
| `src/components/TkxImageEditor.tsx` | 13 |
| `src/components/TkxCommand.tsx` | 12 |
| `src/components/TkxDropdown.tsx` | 11 |
| `src/components/TkxQuantumForm.tsx` | 11 |
| `src/components/TkxSelect.tsx` | 11 |
| `src/components/TkxMarkdown.tsx` | 10 |
| `src/components/TkxToast.tsx` | 10 |
| `src/components/TkxImage.tsx` | 9 |
| `src/components/TkxCarousel.tsx` | 8 |
| `src/components/TkxChat.tsx` | 8 |
| `src/components/TkxPhoneInput.tsx` | 8 |
| `src/components/TkxTable.tsx` | 8 |
| `src/components/TkxPagination.tsx` | 7 |
| `src/components/TkxColorPicker.tsx` | 6 |

## Sample findings (first 50)

| File | Line | Kind | Value |
|---|---|---|---|
| `src/components/TkxAccordion.tsx` | 174 | JSX text | `(null);
  const innerRef = useRef` |
| `src/components/TkxAccordion.tsx` | 298 | JSX text | `normalizeInitial(defaultOpen)
  );

  const openIds: Set` |
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
| `src/components/TkxAutocomplete.tsx` | 133 | JSX text | `(null);
  const wrapperRef = useRef` |
| `src/components/TkxAutocomplete.tsx` | 242 | JSX text | `= 0 && activeIndex` |
| `src/components/TkxAutocomplete.tsx` | 299 | JSX text | `Loading...` |
| `src/components/TkxAutocomplete.tsx` | 301 | JSX text | `) : filtered.length === 0 ? (` |
| `src/components/TkxAutocomplete.tsx` | 380 | JSX text | `,
          document.body,
        )
      : null;

  return (` |
| `src/components/TkxBottomNav.tsx` | 128 | prop `aria-label` | `Bottom navigation` |
| `src/components/TkxBottomNav.tsx` | 139 | prop `aria-label` | `Navigation tabs` |
| `src/components/TkxBreadcrumb.tsx` | 79 | prop `aria-label` | `Show hidden breadcrumb items` |
| `src/components/TkxBreadcrumb.tsx` | 308 | prop `aria-label` | `Breadcrumb` |
| `src/components/TkxBreadcrumb.tsx` | 96 | JSX text | `&hellip;` |
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
| `src/components/TkxChat.tsx` | 282 | prop `aria-label` | `Message input` |
| `src/components/TkxChat.tsx` | 296 | prop `aria-label` | `Send message` |
| `src/components/TkxChat.tsx` | 331 | prop `aria-label` | `Chat messages` |
| `src/components/TkxChat.tsx` | 142 | JSX text | `) : (avatarAssistant ??` |
| `src/components/TkxChat.tsx` | 208 | JSX text | `(null);
  const textareaRef = useRef` |
