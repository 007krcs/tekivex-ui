/**
 * WAI-ARIA 1.2 conformance rules, encoded from the W3C specification.
 *
 * Source of truth: https://www.w3.org/TR/wai-aria-1.2/#role_definitions
 * (role definitions, required/supported/prohibited states and properties,
 * required context role, and required owned elements).
 *
 * These are the machine-checkable structural rules. They complement axe-core,
 * which under jsdom cannot evaluate anything layout- or paint-dependent.
 */

/** Every concrete role name defined by WAI-ARIA 1.2. */
export const VALID_ROLES = new Set([
  'alert', 'alertdialog', 'application', 'article', 'associationlist',
  'associationlistitemkey', 'associationlistitemvalue', 'banner', 'blockquote',
  'button', 'caption', 'cell', 'checkbox', 'code', 'columnheader', 'combobox',
  'comment', 'complementary', 'contentinfo', 'definition', 'deletion', 'dialog',
  'directory', 'document', 'emphasis', 'feed', 'figure', 'form', 'generic',
  'grid', 'gridcell', 'group', 'heading', 'img', 'insertion', 'link', 'list',
  'listbox', 'listitem', 'log', 'main', 'mark', 'marquee', 'math', 'menu',
  'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'meter',
  'navigation', 'none', 'note', 'option', 'paragraph', 'presentation',
  'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
  'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider',
  'spinbutton', 'status', 'strong', 'subscript', 'suggestion', 'superscript',
  'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox', 'time',
  'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem',
]);

/** Abstract roles — MUST NOT appear in author markup (ARIA 1.2 section 5.4). */
export const ABSTRACT_ROLES = new Set([
  'command', 'composite', 'input', 'landmark', 'range', 'roletype', 'section',
  'sectionhead', 'select', 'structure', 'widget', 'window',
]);

/** Required states/properties per role. */
export const REQUIRED_PROPS: Record<string, string[]> = {
  checkbox: ['aria-checked'],
  combobox: ['aria-expanded'],
  menuitemcheckbox: ['aria-checked'],
  menuitemradio: ['aria-checked'],
  option: ['aria-selected'],
  radio: ['aria-checked'],
  scrollbar: ['aria-controls', 'aria-valuenow'],
  slider: ['aria-valuenow'],
  switch: ['aria-checked'],
};

/**
 * Properties explicitly PROHIBITED on a role (ARIA 1.2 "Prohibited States and
 * Properties"). This is the class that produced the `aria-selected` on
 * `menuitem` defect found in the earlier APG audit.
 */
export const PROHIBITED_PROPS: Record<string, string[]> = {
  // Naming prohibited: name comes from content, or the role takes no name.
  generic: ['aria-label', 'aria-labelledby'],
  caption: ['aria-label', 'aria-labelledby'],
  code: ['aria-label', 'aria-labelledby'],
  deletion: ['aria-label', 'aria-labelledby'],
  emphasis: ['aria-label', 'aria-labelledby'],
  insertion: ['aria-label', 'aria-labelledby'],
  paragraph: ['aria-label', 'aria-labelledby'],
  presentation: ['aria-label', 'aria-labelledby'],
  none: ['aria-label', 'aria-labelledby'],
  strong: ['aria-label', 'aria-labelledby'],
  subscript: ['aria-label', 'aria-labelledby'],
  superscript: ['aria-label', 'aria-labelledby'],
  // menuitem supports neither selection nor checked state.
  menuitem: ['aria-selected', 'aria-checked'],
  tabpanel: ['aria-selected'],
  listitem: ['aria-selected'],
  button: ['aria-selected', 'aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  link: ['aria-selected', 'aria-checked'],
  textbox: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-selected'],
  searchbox: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
};

/** Roles whose ancestor chain must contain one of the listed roles. */
export const REQUIRED_CONTEXT: Record<string, string[]> = {
  columnheader: ['row'],
  gridcell: ['row'],
  menuitem: ['menu', 'menubar', 'group'],
  menuitemcheckbox: ['menu', 'menubar', 'group'],
  menuitemradio: ['menu', 'menubar', 'group'],
  option: ['listbox', 'group'],
  row: ['grid', 'rowgroup', 'table', 'treegrid'],
  rowgroup: ['grid', 'table', 'treegrid'],
  rowheader: ['row'],
  tab: ['tablist'],
  treeitem: ['tree', 'group'],
};

/** Roles that must expose a non-empty accessible name. */
export const NAME_REQUIRED = new Set([
  'button', 'checkbox', 'combobox', 'dialog', 'alertdialog', 'heading', 'link',
  'listbox', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'meter', 'option',
  'progressbar', 'radio', 'radiogroup', 'searchbox', 'slider', 'spinbutton',
  'switch', 'tab', 'textbox', 'tree', 'treegrid', 'treeitem',
]);

/** aria-* attributes whose value is a space-separated list of element ids. */
export const IDREF_PROPS = [
  'aria-activedescendant', 'aria-controls', 'aria-describedby', 'aria-details',
  'aria-errormessage', 'aria-flowto', 'aria-labelledby', 'aria-owns',
];

/** Enumerated attributes and their permitted token values. */
export const ENUM_VALUES: Record<string, string[]> = {
  'aria-autocomplete': ['inline', 'list', 'both', 'none'],
  'aria-checked': ['true', 'false', 'mixed', 'undefined'],
  'aria-current': ['page', 'step', 'location', 'date', 'time', 'true', 'false'],
  'aria-expanded': ['true', 'false', 'undefined'],
  'aria-haspopup': ['false', 'true', 'menu', 'listbox', 'tree', 'grid', 'dialog'],
  'aria-invalid': ['grammar', 'false', 'spelling', 'true'],
  'aria-live': ['assertive', 'off', 'polite'],
  'aria-orientation': ['horizontal', 'vertical', 'undefined'],
  'aria-pressed': ['true', 'false', 'mixed', 'undefined'],
  'aria-relevant': ['additions', 'all', 'removals', 'text'],
  'aria-selected': ['true', 'false', 'undefined'],
  'aria-sort': ['ascending', 'descending', 'none', 'other'],
};

/** Attributes whose value must parse as a boolean. */
export const BOOLEAN_PROPS = [
  'aria-atomic', 'aria-busy', 'aria-disabled', 'aria-modal', 'aria-multiline',
  'aria-multiselectable', 'aria-readonly', 'aria-required',
];

/** Attributes whose value must parse as a number. */
export const NUMERIC_PROPS = [
  'aria-colcount', 'aria-colindex', 'aria-colspan', 'aria-level',
  'aria-posinset', 'aria-rowcount', 'aria-rowindex', 'aria-rowspan',
  'aria-setsize', 'aria-valuemax', 'aria-valuemin', 'aria-valuenow',
];

/** Every aria-* attribute defined in ARIA 1.2 — anything else is a typo. */
export const VALID_ARIA_ATTRS = new Set([
  'aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-braillelabel',
  'aria-brailleroledescription', 'aria-busy', 'aria-checked', 'aria-colcount',
  'aria-colindex', 'aria-colindextext', 'aria-colspan', 'aria-controls',
  'aria-current', 'aria-describedby', 'aria-description', 'aria-details',
  'aria-disabled', 'aria-dropeffect', 'aria-errormessage', 'aria-expanded',
  'aria-flowto', 'aria-grabbed', 'aria-haspopup', 'aria-hidden', 'aria-invalid',
  'aria-keyshortcuts', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-live',
  'aria-modal', 'aria-multiline', 'aria-multiselectable', 'aria-orientation',
  'aria-owns', 'aria-placeholder', 'aria-posinset', 'aria-pressed', 'aria-readonly',
  'aria-relevant', 'aria-required', 'aria-roledescription', 'aria-rowcount',
  'aria-rowindex', 'aria-rowindextext', 'aria-rowspan', 'aria-selected',
  'aria-setsize', 'aria-sort', 'aria-valuemax', 'aria-valuemin', 'aria-valuenow',
  'aria-valuetext',
]);

/** Implicit ARIA role for native elements (used for context + name checks). */
export const IMPLICIT_ROLES: Record<string, string> = {
  a: 'link', article: 'article', aside: 'complementary', button: 'button',
  datalist: 'listbox', dd: 'definition', dfn: 'term', dialog: 'dialog',
  fieldset: 'group', figure: 'figure', footer: 'contentinfo', form: 'form',
  h1: 'heading', h2: 'heading', h3: 'heading', h4: 'heading', h5: 'heading',
  h6: 'heading', header: 'banner', hr: 'separator', img: 'img', li: 'listitem',
  main: 'main', menu: 'list', nav: 'navigation', ol: 'list', optgroup: 'group',
  option: 'option', output: 'status', progress: 'progressbar', section: 'region',
  select: 'combobox', summary: 'button', table: 'table', tbody: 'rowgroup',
  td: 'cell', textarea: 'textbox', tfoot: 'rowgroup', th: 'columnheader',
  thead: 'rowgroup', tr: 'row', ul: 'list',
};

/** Elements focusable without an explicit tabindex. */
export const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, iframe, [tabindex], [contenteditable="true"]';
