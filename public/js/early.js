// Loaded before first paint (not deferred): marks that JavaScript runs, so the phone menu
// starts collapsed instead of collapsing after the page appeared (no layout shift).
document.documentElement.classList.add('js');
