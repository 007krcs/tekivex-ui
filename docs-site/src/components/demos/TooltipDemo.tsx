import { TkxTooltip, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

export function TooltipPlacements() {
  return (
    <Preview label="Hover or focus to open">
      <TkxTooltip label="Tooltip on top" placement="top">
        <TkxButton size="sm">top</TkxButton>
      </TkxTooltip>
      <TkxTooltip label="Tooltip on right" placement="right">
        <TkxButton size="sm">right</TkxButton>
      </TkxTooltip>
      <TkxTooltip label="Tooltip on bottom" placement="bottom">
        <TkxButton size="sm">bottom</TkxButton>
      </TkxTooltip>
      <TkxTooltip label="Tooltip on left" placement="left">
        <TkxButton size="sm">left</TkxButton>
      </TkxTooltip>
    </Preview>
  );
}

export function TooltipMultiline() {
  return (
    <Preview label="Multiline content">
      <TkxTooltip
        label={
          <>
            <strong>Keyboard shortcut</strong>
            <br />
            <span style={{ opacity: 0.8 }}>Hold Shift to open in a new tab.</span>
          </>
        }
      >
        <TkxButton>Hover me</TkxButton>
      </TkxTooltip>
    </Preview>
  );
}
