'use client';

import { forwardRef, type ChangeEvent } from 'react';

export interface TkxHoneypotProps {
  /** Field name used in the rendered hidden input. The backend sees this name
   *  on form submission and rejects any request where the value is non-empty. */
  name?: string;
  /** Optional controlled value — useful for tests. Production hosts can ignore
   *  this and read the value from form data on the server. */
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * Bot-trap field. Bots that auto-fill every form input will populate this
 * field; humans never see it (off-screen, disabled, autocomplete-off,
 * tabIndex=-1, aria-hidden). Server-side: reject any submission where the
 * honeypot field is non-empty.
 *
 * Belt-and-braces: the field uses two layered hiding techniques (visibility
 * hidden + clip-path) so a stylesheet override can't accidentally reveal it.
 */
export const TkxHoneypot = forwardRef<HTMLInputElement, TkxHoneypotProps>(
  function TkxHoneypot({ name = 'website', value = '', onChange }, ref) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: 1,
          height: 1,
          overflow: 'hidden',
          // Defense in depth: clip-path so a forced display:block override
          // still hides the input from sighted users.
          clipPath: 'inset(50%)',
          pointerEvents: 'none',
        }}
        data-tkx-honeypot=""
      >
        <label htmlFor={name}>
          Leave this field blank
          <input
            ref={ref}
            id={name}
            name={name}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange?.(e.target.value)
            }
          />
        </label>
      </div>
    );
  },
);

TkxHoneypot.displayName = 'TkxHoneypot';
