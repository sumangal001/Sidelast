const STATE_META = {
  idle: { label: '', icon: '✎', expanded: false },
  listening: { label: 'Copying…', icon: '◎', expanded: true },
  fixing: { label: 'Fixing…', icon: '⋯', expanded: true },
  fixed: { label: 'Fixed', icon: '✓', expanded: true },
  error: { label: 'Error', icon: '!', expanded: true },
};

const DRAG_THRESHOLD_PX = 8;
const DOUBLE_CLICK_MS = 400;

document.addEventListener('DOMContentLoaded', () => {
  const widget = document.getElementById('widget');
  const icon = document.getElementById('widget-icon');
  const label = document.getElementById('widget-label');
  if (!widget || !icon || !label) return;

  let pointerDown = false;
  let startX = 0;
  let startY = 0;
  let dragged = false;
  let lastClickAt = 0;

  function applyState(state, message) {
    const meta = STATE_META[state] ?? STATE_META.idle;
    const text = message ?? meta.label;
    widget.className = `widget widget--${state} ${meta.expanded && text ? 'widget--expanded' : ''}`;
    icon.textContent = meta.icon;
    label.textContent = text;
    label.hidden = !meta.expanded || !text;
    widget.title =
      'Drag anywhere · Click = fix selection · Double-click = type text · Right-click = settings';
  }

  if (window.stylefix?.onStateChange) {
    window.stylefix.onStateChange(({ state, message }) => {
      applyState(state, message);
    });
  } else {
    applyState('idle');
  }

  widget.addEventListener('pointerdown', (event) => {
    pointerDown = true;
    dragged = false;
    startX = event.screenX;
    startY = event.screenY;
  });

  widget.addEventListener('pointermove', (event) => {
    if (!pointerDown) return;
    const dx = Math.abs(event.screenX - startX);
    const dy = Math.abs(event.screenY - startY);
    if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) {
      dragged = true;
    }
  });

  widget.addEventListener('pointerup', () => {
    if (pointerDown && !dragged) {
      const now = Date.now();
      const isDoubleClick = now - lastClickAt < DOUBLE_CLICK_MS;
      lastClickAt = now;

      if (isDoubleClick) {
        window.stylefix?.openComposer?.();
      } else if (window.stylefix?.triggerFix) {
        void window.stylefix.triggerFix();
      }
    }

    pointerDown = false;
    dragged = false;
  });

  widget.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    window.stylefix?.openSettings?.();
  });

  widget.addEventListener('pointercancel', () => {
    pointerDown = false;
    dragged = false;
  });
});
