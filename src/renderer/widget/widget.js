const STATE_META = {
  idle: { label: 'Ready', icon: '✎', expanded: false },
  listening: { label: 'Listening', icon: '◎', expanded: true },
  fixing: { label: 'Fixing…', icon: '⋯', expanded: true },
  fixed: { label: 'Fixed', icon: '✓', expanded: true },
  error: { label: 'Error', icon: '!', expanded: true },
};

const DRAG_THRESHOLD_PX = 6;

document.addEventListener('DOMContentLoaded', () => {
  const widget = document.getElementById('widget');
  const icon = document.getElementById('widget-icon');
  const label = document.getElementById('widget-label');
  if (!widget || !icon || !label) return;

  let pointerDown = false;
  let startX = 0;
  let startY = 0;
  let dragged = false;

  function applyState(state, message) {
    const meta = STATE_META[state] ?? STATE_META.idle;
    widget.className = `widget widget--${state} ${meta.expanded ? 'widget--expanded' : 'widget--compact'}`;
    icon.textContent = meta.icon;
    label.textContent = message ?? meta.label;
    label.hidden = !meta.expanded;
    widget.title = state === 'idle' ? 'Ctrl+Shift+F to fix (or click)' : meta.label;
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
    if (pointerDown && !dragged && window.stylefix?.triggerFix) {
      void window.stylefix.triggerFix();
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
