import { TkxField } from 'tekivex-ui';
import { Preview } from '../Preview';

// TkxField wraps any control with label / hint / error chrome and injects
// id + aria-describedby + aria-invalid + aria-required via cloneElement
// (element child) or a function child.

const controlStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1.5px solid var(--sl-color-gray-4, #888)',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  boxSizing: 'border-box',
} as const;

export function FieldBasic() {
  return (
    <Preview label="Wrapping a plain <select>" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 280, maxWidth: 360 }}>
        <TkxField label="Country" hint="Where invoices are issued">
          <select defaultValue="in" style={controlStyle}>
            <option value="in">India</option>
            <option value="us">United States</option>
            <option value="de">Germany</option>
          </select>
        </TkxField>
      </div>
    </Preview>
  );
}

export function FieldValidation() {
  return (
    <Preview label="Required + error" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 280, maxWidth: 360 }}>
        <TkxField label="Email" isRequired error="Enter a valid email address">
          <input type="email" defaultValue="not-an-email" style={controlStyle} />
        </TkxField>
      </div>
    </Preview>
  );
}

export function FieldFunctionChild() {
  return (
    <Preview label="Function child" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 280, maxWidth: 360 }}>
        <TkxField label="Notes" hint="The field props are spread onto the nested textarea">
          {(field) => (
            <div style={{ borderRadius: 10, padding: 4, border: '1px dashed var(--sl-color-gray-4, #888)' }}>
              <textarea {...field} rows={3} placeholder="Write something…" style={{ ...controlStyle, border: 'none', resize: 'vertical' }} />
            </div>
          )}
        </TkxField>
      </div>
    </Preview>
  );
}
