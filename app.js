(function () {
  const themeToggle = document.getElementById('themeToggle');
  const THEME_STORAGE_KEY = 'commDrillTrainer:theme';
  function loadThemePreference() {
    try {
      const stored = window.localStorage?.getItem(THEME_STORAGE_KEY);
      if (stored === 'light') return false;
      if (stored === 'dark') return true;
    } catch (e) {
      // Ignore storage issues
    }
    return true;
  }
  function persistThemePreference(darkMode) {
    try {
      window.localStorage?.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch (e) {
      // Ignore storage issues
    }
  }
  let isDarkMode = loadThemePreference();

  function syncThemeToggle() {
    if (themeToggle) {
      themeToggle.checked = isDarkMode;
    }
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('bg-dark', isDarkMode);
    document.body.classList.toggle('text-light', isDarkMode);
    document.body.classList.toggle('bg-light', !isDarkMode);
    document.body.classList.toggle('text-dark', !isDarkMode);
    syncThemeToggle();
  }

  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      isDarkMode = themeToggle.checked;
      applyTheme();
      persistThemePreference(isDarkMode);
    });
  }

  applyTheme();

  const PRESETS = {
    wing: {
      label: 'Wings',
      scheme: 'CABDEFGHIJKLMNOPQRSTUVWX',
      buffer: 'O',
    },
    edge: {
      label: 'Edges',
      scheme: 'CI AQ BM DE JP LF UK WS VO XG TN RH',
      buffer: 'U',
    },
    corner: {
      label: 'Corners',
      scheme: 'CMJ DIF BQN AER PVK GLU WOT XSH',
      buffer: 'U',
    },
    center: {
      label: 'Centers',
      scheme: 'ABCD EFGH IJKL MNOP QRST UVWX',
      buffer: 'O',
    },
    'x-center': {
      label: 'X-center',
      scheme: 'ABCD EFGH IJKL MNOP QRST UVWX',
      buffer: 'O',
    },
    't-center': {
      label: 'T-center',
      scheme: 'ABCD EFGH IJKL MNOP QRST UVWX',
      buffer: 'O',
    },
    obliques: {
      label: 'Obliques',
      scheme: 'ABCD EFGH IJKL MNOP QRST UVWX',
      buffer: 'O',
    },
    midges: {
      label: 'Midges',
      scheme: 'CI AQ BM DE JP LF UK WS VO XG TN RH',
      buffer: 'U',
    },
    custom: {
      label: 'Custom',
      scheme: '',
      buffer: '',
    },
  };
  const SCHEME_PRESETS = {
    Speffz: {
      edge: 'CI AQ BM DE JP LF UK WS VO XG TN RH',
      midges: 'CI AQ BM DE JP LF UK WS VO XG TN RH',
      corner: 'CMJ DIF BQN AER PVK GLU WOT XSH',
      wing: 'CABDEFGHIJKLMNOPQRSTUVWX',
      'x-center': 'ABCD EFGH IJKL MNOP QRST UVWX',
      't-center': 'ABCD EFGH IJKL MNOP QRST UVWX',
      obliques: 'ABCD EFGH IJKL MNOP QRST UVWX',
    },
    Nam: {
      edge: 'UV OI EZ AY KN JG WP BH SM DL CT RF',
      midges: 'UV OI EZ AY KN JG WP BH SM DL CT RF',
      corner: 'UVJ OIF ERN AZY MDL HKW CSG BPT',
      wing: 'OABCDEFGHIJKLMNPRSTUVWYZ',
      'x-center': 'AEOU ZFGH IJKL VNMP YRST BCDW',
      't-center': 'AEOU ZFGH IJKL VNMP YRST BCDW',
      obliques: 'AEOU ZFGH IJKL VNMP YRST BCDW',
    },
  };

  const pieceSelect = document.getElementById('pieceType');
  const methodSelect = document.getElementById('method');
  const bufferInput = document.getElementById('buffer');
  const schemeInput = document.getElementById('scheme');
  const requiredPairsInput = document.getElementById('requiredPairs');
  const randomizeOrientationRow = document.getElementById('randomizeOrientationRow');
  const randomizeOrientationGroup = document.getElementById('randomizeOrientationGroup');
  const shiftCycleGroup = document.getElementById('shiftCycleGroup');
  const randomizeOrientationToggle = document.getElementById('randomizeOrientation');
  const shiftCycleToggle = document.getElementById('shiftCycle');
  const schemePresetSelect = document.getElementById('schemePresetSelect');
  const applySchemePresetBtn = document.getElementById('applySchemePresetBtn');
  const includeInversesToggle = document.getElementById('includeInverses');
  const errorBox = document.getElementById('errorBox');
  const startButton = document.getElementById('startBtn');
  const focusOverlay = document.getElementById('focusOverlay');
  const focusPairsContainer = document.getElementById('focusPairs');
  const focusCopyBtn = document.getElementById('focusCopyBtn');
  const exitFocusBtn = document.getElementById('exitFocusBtn');
  const focusNextBtn = document.getElementById('focusNextBtn');

  const STORAGE_PREFIX = 'commDrillTrainer';
  const schemeStorageKey = (type) => `${STORAGE_PREFIX}:scheme:${type}`;
  const bufferStorageKey = (type) => `${STORAGE_PREFIX}:buffer:${type}`;
  const pairStorageKey = (type) => `${STORAGE_PREFIX}:pairs:${type}`;
  const inverseStorageKey = (type) => `${STORAGE_PREFIX}:pairs_inverse:${type}`;
  const orientationStorageKey = (type) => `${STORAGE_PREFIX}:orientation:${type}`;
  const shiftStorageKey = (type) => `${STORAGE_PREFIX}:shift:${type}`;
  const pieceStorageKey = `${STORAGE_PREFIX}:pieceType`;
  const schemePresetStorageKey = `${STORAGE_PREFIX}:schemePreset`;

  let lastFocusCopyText = '';
  let copyResetTimeout = null;

  function showError(message) {
    const text = message instanceof Error ? message.message : String(message);
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(text);
    }
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(text);
      return;
    }
    if (errorBox) {
      errorBox.textContent = text;
      errorBox.classList.remove('d-none');
    }
  }

  function safeGetItem(key) {
    try {
      return window.localStorage?.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSetItem(key, value) {
    try {
      window.localStorage?.setItem(key, value);
    } catch (e) {
      // Ignore storage issues (e.g., privacy mode)
    }
  }

  function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function randomShiftArray(array) {
    if (!Array.isArray(array) || array.length === 0) {
      return array;
    }
    const offset = Math.floor(Math.random() * array.length);
    if (offset === 0) {
      return array.slice();
    }
    return array.slice(offset).concat(array.slice(0, offset));
  }

  const schemeSettings = {};
  const bufferSettings = {};
  const pairSettings = {};
  const inverseSettings = {};
  const orientationSettings = {};
  const shiftSettings = {};
  Object.keys(PRESETS).forEach((type) => {
    schemeSettings[type] = safeGetItem(schemeStorageKey(type)) || PRESETS[type].scheme;
    bufferSettings[type] = safeGetItem(bufferStorageKey(type)) || PRESETS[type].buffer;
    pairSettings[type] = safeGetItem(pairStorageKey(type)) || '';
    const storedInverse = safeGetItem(inverseStorageKey(type));
    inverseSettings[type] = storedInverse === null ? 'true' : storedInverse;
    const storedOrientation = safeGetItem(orientationStorageKey(type));
    orientationSettings[type] = storedOrientation === null ? 'true' : storedOrientation;
    const storedShift = safeGetItem(shiftStorageKey(type));
    shiftSettings[type] = storedShift === null ? 'true' : storedShift;
  });

  function uniqueLettersFromSchemeText(text) {
    if (!text) return [];
    const upper = text.toUpperCase();
    const seen = new Set();
    const letters = [];
    for (const ch of upper) {
      if (!/[A-Z]/.test(ch)) continue;
      if (seen.has(ch)) continue;
      seen.add(ch);
      letters.push(ch);
    }
    return letters;
  }

  function populateBufferOptions(type, preferredLetter) {
    if (!bufferInput) return;
    const schemeText = schemeInput.value || '';
    const letters = uniqueLettersFromSchemeText(schemeText);
    bufferInput.innerHTML = '';
    letters.forEach((letter) => {
      const option = document.createElement('option');
      option.value = letter;
      option.textContent = letter;
      bufferInput.appendChild(option);
    });

    let desired = (preferredLetter || bufferSettings[type] || '').toUpperCase();
    if (!letters.includes(desired)) {
      const presetDefault = PRESETS[type]?.buffer?.toUpperCase();
      if (presetDefault && letters.includes(presetDefault)) {
        desired = presetDefault;
      } else {
        desired = letters[0] || '';
      }
    }

    bufferInput.disabled = letters.length === 0;
    bufferInput.value = desired || '';

    if (desired) {
      bufferSettings[type] = desired;
      safeSetItem(bufferStorageKey(type), desired);
    }
  }

  function normalizeSchemeBlocks(rawScheme) {
    if (!rawScheme) return [];
    let blocks = rawScheme
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (blocks.length === 1 && blocks[0].length > 1) {
      blocks = blocks[0].split('').filter(Boolean);
    }
    return blocks;
  }

  function buildLetterMeta(blocks, bufferLetter) {
    if (!blocks.length) {
      throw new Error('Letter scheme cannot be empty.');
    }
    const letterToMeta = {};
    let bufferBlockIdx = blocks.findIndex((block) => block.includes(bufferLetter));
    if (bufferBlockIdx === -1) {
      throw new Error(`Buffer letter "${bufferLetter}" not found in the scheme.`);
    }
    const trimmedStart = bufferBlockIdx + 1;
    if (trimmedStart >= blocks.length) {
      throw new Error('No pieces remain after trimming with the buffer.');
    }
    blocks.forEach((block, idx) => {
      [...block].forEach((letter) => {
        letterToMeta[letter] = {
          blockIdx: idx,
          usable: idx >= trimmedStart,
        };
      });
    });
    return { letterToMeta, bufferBlockIdx, trimmedStart };
  }

  function parseRequiredPairs(schemeText, bufferLetter, includeInverses) {
    if (!requiredPairsInput) return [];
    const raw = requiredPairsInput.value.trim().toUpperCase();
    if (!raw) return [];
    const tokens = raw.split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    const blocks = normalizeSchemeBlocks(schemeText);
    const { letterToMeta, bufferBlockIdx } = buildLetterMeta(blocks, bufferLetter);
    const pairs = [];
    for (const token of tokens) {
      if (token.length !== 2) {
        throw new Error(`Pair "${token}" must contain exactly two letters.`);
      }
      const [first, second] = token.split('');
      if (first === second) {
        throw new Error(`Pair "${token}" cannot repeat the same letter.`);
      }
      const metaFirst = letterToMeta[first];
      const metaSecond = letterToMeta[second];
      if (!metaFirst) {
        throw new Error(`Letter "${first}" from pair "${token}" is not in the scheme.`);
      }
      if (!metaSecond) {
        throw new Error(`Letter "${second}" from pair "${token}" is not in the scheme.`);
      }
      if (!metaFirst.usable || !metaSecond.usable) {
        throw new Error(`Letters in pair "${token}" must be after the buffer piece.`);
      }
      if (metaFirst.blockIdx === metaSecond.blockIdx) {
        throw new Error(`Letters in pair "${token}" cannot be on the same piece.`);
      }
      if (
        metaFirst.blockIdx === bufferBlockIdx ||
        metaSecond.blockIdx === bufferBlockIdx
      ) {
        throw new Error(`Letters in pair "${token}" cannot include the buffer piece.`);
      }
      pairs.push([first, second]);
      if (includeInverses) {
        pairs.push([second, first]);
      }
    }
    return pairs;
  }

  function ensureChainPair(letters, pair) {
    if (!pair || !letters || letters.length < 2) {
      return letters;
    }
    const idx = letters.findIndex(
      (letter, index) =>
        letter === pair[0] &&
        letters[(index + 1) % letters.length] === pair[1],
    );
    if (idx !== -1) {
      const rotated = letters.slice(idx).concat(letters.slice(0, idx));
      return rotated;
    }
    const remaining = letters
      .filter(
        (letter, index) =>
          !(
            letter === pair[0] &&
            letters[(index + 1) % letters.length] === pair[1]
          ),
      )
      .filter((letter) => letter !== pair[0] && letter !== pair[1]);
    const adjusted = [pair[0], pair[1], ...remaining];
    return adjusted.slice(0, letters.length);
  }


  function autoResizeScheme() {
    if (!schemeInput) return;
    schemeInput.style.height = 'auto';
    schemeInput.style.height = `${schemeInput.scrollHeight}px`;
  }

  function applyPreset(type) {
    const preset = PRESETS[type];
    if (!preset) return;
    const storedScheme = schemeSettings[type];
    schemeInput.value = storedScheme !== undefined ? storedScheme : preset.scheme;
    populateBufferOptions(type, bufferSettings[type]);
    if (schemePresetSelect && applySchemePresetBtn) {
      const isCustom = type === 'custom';
      schemePresetSelect.disabled = isCustom;
      applySchemePresetBtn.disabled = isCustom;
    }
    if (requiredPairsInput) {
      requiredPairsInput.value = pairSettings[type] ?? '';
    }
    if (includeInversesToggle) {
      includeInversesToggle.checked = inverseSettings[type] !== 'false';
    }
    if (randomizeOrientationToggle) {
      randomizeOrientationToggle.checked = orientationSettings[type] !== 'false';
    }
    if (shiftCycleToggle) {
      shiftCycleToggle.checked = shiftSettings[type] !== 'false';
    }
    autoResizeScheme();
  }

  function methodRequiresFixedCount() {
    return methodSelect.value === 'fiveCycle';
  }

  function updateMethodState() {
    const showRandomize = methodRequiresFixedCount();
    if (randomizeOrientationGroup) {
      randomizeOrientationGroup.classList.toggle('d-none', !showRandomize);
    }
    const shouldHideRow = !showRandomize && (!shiftCycleGroup || shiftCycleGroup.classList.contains('d-none'));
    if (randomizeOrientationRow) {
      randomizeOrientationRow.classList.toggle('d-none', shouldHideRow);
    }
  }

  function overlayIsActive() {
    return focusOverlay && !focusOverlay.classList.contains('d-none');
  }

  function generateCurrent() {
    const type = pieceSelect.value;
    const preset = PRESETS[type];
    const method = methodSelect.value;
    const count = 5;
    const buffer = bufferInput.value.trim().toUpperCase();
    const scheme = schemeInput.value.trim().toUpperCase();

    if (buffer.length !== 1) {
      throw new Error('Buffer must be exactly one character.');
    }

    const includeInverses =
      includeInversesToggle && typeof includeInversesToggle.checked === 'boolean'
        ? includeInversesToggle.checked
        : true;
    const requiredPairs = parseRequiredPairs(scheme, buffer, includeInverses);
    const requiredPair = requiredPairs.length ? randomChoice(requiredPairs) : null;

    if (requiredPair && method !== 'fiveCycle' && count < 2) {
      throw new Error('Need at least two letters to include a required pair.');
    }

    const randomizeOrientation =
      randomizeOrientationToggle && method === 'fiveCycle'
        ? randomizeOrientationToggle.checked
        : true;
    const shiftCycleEnabled = shiftCycleToggle ? shiftCycleToggle.checked : true;

    if (method === 'fiveCycle') {
      if (!window.FiveCycle || typeof window.FiveCycle.generateFiveCycle !== 'function') {
        throw new Error('5-cycle generator is unavailable.');
      }
      const result = window.FiveCycle.generateFiveCycle({
        scheme,
        bufferLetter: buffer,
        maxAttempts: 5000,
        randomizeOrientation,
        forcedPair: requiredPair ? requiredPair.join('') : null,
        shiftCycle: shiftCycleEnabled,
      });
      const pairs = result.comm_sequence.map(
        ([first, second]) => `${first}${second}`,
      );
      return {
        method,
        label: preset ? `${preset.label} 5-cycles` : '5-cycles',
        focusPairs: pairs,
      };
    }

    const chainGenerator = window.Chain?.generatePieceLetters;
    if (typeof chainGenerator !== 'function') {
      throw new Error('Chain generator is unavailable.');
    }
    const letters = chainGenerator(count, scheme, buffer, 2000);
    const adjustedLetters = ensureChainPair(letters, requiredPair) || [];
    const shiftedLetters =
      shiftCycleEnabled && adjustedLetters.length
        ? randomShiftArray(adjustedLetters)
        : adjustedLetters.slice();
    const focusPairs =
      shiftedLetters.length === 0
        ? []
        : shiftedLetters.map(
            (letter, idx) => `${letter}${shiftedLetters[(idx + 1) % shiftedLetters.length]}`,
          );
    return {
      method,
      label: preset ? `${preset.label}` : 'Letters',
      letters: shiftedLetters,
      focusPairs,
    };
  }

  function handleGenerate(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    if (errorBox) {
      errorBox.classList.add('d-none');
      errorBox.textContent = '';
    }
    try {
      return generateCurrent();
    } catch (e) {
      showError(e);
      return null;
    }
  }

  function renderFocusOverlay(result) {
    if (!focusOverlay || !focusPairsContainer || !result) {
      return;
    }
    focusPairsContainer.innerHTML = '';
    const pairs = result.focusPairs || [];
    lastFocusCopyText = pairs.join(' ');
    if (focusCopyBtn) {
      focusCopyBtn.disabled = pairs.length === 0;
    }
    if (!pairs.length) {
      const empty = document.createElement('div');
      empty.className = 'text-secondary';
      empty.textContent = 'No letters generated.';
      focusPairsContainer.appendChild(empty);
    } else {
      pairs.forEach((pair) => {
        const node = document.createElement('div');
        node.className = 'focus-pair';
        node.textContent = pair;
        focusPairsContainer.appendChild(node);
      });
    }
    focusOverlay.classList.remove('d-none');
  }

  function hideFocusOverlay() {
    if (!focusOverlay) return;
    focusOverlay.classList.add('d-none');
  }

  async function copyTextToClipboard(text) {
    if (!text) return false;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Ignore and fall back
      }
    }
    try {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.setAttribute('readonly', '');
      temp.style.position = 'fixed';
      temp.style.top = '-9999px';
      document.body.appendChild(temp);
      temp.select();
      temp.setSelectionRange(0, temp.value.length);
      const success = document.execCommand('copy');
      document.body.removeChild(temp);
      return success;
    } catch (err) {
      return false;
    }
  }

  function showCopyFeedback(success) {
    if (!focusCopyBtn) return;
    if (!focusCopyBtn.dataset.defaultLabel) {
      focusCopyBtn.dataset.defaultLabel = focusCopyBtn.textContent || 'Copy';
    }
    focusCopyBtn.textContent = success ? 'Copied!' : 'Copy failed';
    clearTimeout(copyResetTimeout);
    copyResetTimeout = window.setTimeout(() => {
      focusCopyBtn.textContent = focusCopyBtn.dataset.defaultLabel;
    }, 1500);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlayIsActive()) {
      event.preventDefault();
      hideFocusOverlay();
      return;
    }
    if (!overlayIsActive()) {
      return;
    }
    if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      const result = handleGenerate(event);
      if (result) {
        renderFocusOverlay(result);
      }
    }
  });

  const SWIPE_MIN_DISTANCE = 60;
  const SWIPE_MAX_OFF_AXIS = 50;
  const SWIPE_MAX_DURATION_MS = 600;
  let touchStartX = null;
  let touchStartY = null;
  let touchStartTime = 0;

  function shouldIgnoreTouch(target) {
    if (!target) return false;
    if (target.closest('input, textarea, select, button')) {
      return true;
    }
    return target.isContentEditable;
  }

  function handleTouchStart(event) {
    if (event.touches.length !== 1 || shouldIgnoreTouch(event.target)) {
      return;
    }
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
  }

  function resetTouch() {
    touchStartX = null;
    touchStartY = null;
    touchStartTime = 0;
  }

  function handleTouchEnd(event) {
    if (
      touchStartX === null ||
      touchStartY === null ||
      event.changedTouches.length !== 1 ||
      shouldIgnoreTouch(event.target)
    ) {
      resetTouch();
      return;
    }
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const duration = Date.now() - touchStartTime;
    resetTouch();
    const isHorizontal = Math.abs(deltaX) >= SWIPE_MIN_DISTANCE;
    const withinOffAxis = Math.abs(deltaY) <= SWIPE_MAX_OFF_AXIS;
    const withinDuration = duration <= SWIPE_MAX_DURATION_MS;
    if (isHorizontal && withinOffAxis && withinDuration) {
      const result = handleGenerate();
      if (result && overlayIsActive()) {
        renderFocusOverlay(result);
      }
    }
  }

  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });

  if (startButton) {
    startButton.addEventListener('click', () => {
      const result = handleGenerate();
      if (result) {
        renderFocusOverlay(result);
      }
    });
  }

  if (exitFocusBtn) {
    exitFocusBtn.addEventListener('click', () => {
      hideFocusOverlay();
    });
  }

  if (focusOverlay) {
    focusOverlay.addEventListener('click', (event) => {
      if (event.target === focusOverlay) {
        hideFocusOverlay();
      }
    });
    focusOverlay.addEventListener(
      'touchmove',
      (event) => {
        if (overlayIsActive()) {
          event.preventDefault();
        }
      },
      { passive: false },
    );
  }

  if (focusNextBtn) {
    focusNextBtn.addEventListener('click', () => {
      const result = handleGenerate();
      if (result) {
        renderFocusOverlay(result);
      }
    });
  }

  if (focusCopyBtn) {
    focusCopyBtn.addEventListener('click', async () => {
      if (!lastFocusCopyText) {
        showCopyFeedback(false);
        return;
      }
      const success = await copyTextToClipboard(lastFocusCopyText);
      showCopyFeedback(success);
    });
  }

  pieceSelect.addEventListener('change', () => {
    const selectedType = pieceSelect.value;
    safeSetItem(pieceStorageKey, selectedType);
    applyPreset(selectedType);
    updateMethodState();
  });

  methodSelect.addEventListener('change', () => {
    updateMethodState();
  });

  schemeInput.addEventListener('input', () => {
    const currentType = pieceSelect.value;
    const previousBuffer = bufferInput ? bufferInput.value : '';
    schemeSettings[currentType] = schemeInput.value;
    safeSetItem(schemeStorageKey(currentType), schemeSettings[currentType]);
    autoResizeScheme();
    populateBufferOptions(currentType, previousBuffer);
  });

  if (bufferInput) {
    bufferInput.addEventListener('change', () => {
      const currentType = pieceSelect.value;
      bufferSettings[currentType] = bufferInput.value;
      safeSetItem(bufferStorageKey(currentType), bufferSettings[currentType]);
    });
  }

  if (requiredPairsInput) {
    requiredPairsInput.addEventListener('input', () => {
      const currentType = pieceSelect.value;
      pairSettings[currentType] = requiredPairsInput.value;
      safeSetItem(pairStorageKey(currentType), pairSettings[currentType]);
    });
  }

  if (includeInversesToggle) {
    includeInversesToggle.addEventListener('change', () => {
      const currentType = pieceSelect.value;
      inverseSettings[currentType] = includeInversesToggle.checked ? 'true' : 'false';
      safeSetItem(inverseStorageKey(currentType), inverseSettings[currentType]);
    });
  }

  if (randomizeOrientationToggle) {
    randomizeOrientationToggle.addEventListener('change', () => {
      const currentType = pieceSelect.value;
      orientationSettings[currentType] = randomizeOrientationToggle.checked ? 'true' : 'false';
      safeSetItem(orientationStorageKey(currentType), orientationSettings[currentType]);
    });
  }

  if (shiftCycleToggle) {
    shiftCycleToggle.addEventListener('change', () => {
      const currentType = pieceSelect.value;
      shiftSettings[currentType] = shiftCycleToggle.checked ? 'true' : 'false';
      safeSetItem(shiftStorageKey(currentType), shiftSettings[currentType]);
    });
  }

  function applySchemePresetByName(presetName) {
    const presetMap = SCHEME_PRESETS[presetName];
    const currentType = pieceSelect.value;
    if (!presetMap || !presetMap[currentType]) {
      if (errorBox) {
        errorBox.textContent = `${presetName} preset is unavailable for this piece type.`;
        errorBox.classList.remove('d-none');
      }
      return false;
    }
    const presetScheme = presetMap[currentType];
    const previousBuffer = bufferInput ? bufferInput.value : '';
    schemeInput.value = presetScheme;
    schemeSettings[currentType] = presetScheme;
    safeSetItem(schemeStorageKey(currentType), presetScheme);
    autoResizeScheme();
    populateBufferOptions(currentType, previousBuffer);
    if (errorBox) {
      errorBox.classList.add('d-none');
      errorBox.textContent = '';
    }
    return true;
  }

  if (applySchemePresetBtn) {
    applySchemePresetBtn.addEventListener('click', () => {
      const presetName =
        (schemePresetSelect && schemePresetSelect.value) || Object.keys(SCHEME_PRESETS)[0];
      if (!presetName) return;
      safeSetItem(schemePresetStorageKey, presetName);
      applySchemePresetByName(presetName);
    });
  }

  if (schemePresetSelect) {
    schemePresetSelect.addEventListener('change', () => {
      safeSetItem(schemePresetStorageKey, schemePresetSelect.value);
    });
  }

  const storedPieceType = safeGetItem(pieceStorageKey);
  if (storedPieceType && PRESETS[storedPieceType]) {
    pieceSelect.value = storedPieceType;
  }
  const storedPresetName = safeGetItem(schemePresetStorageKey);
  if (storedPresetName && schemePresetSelect) {
    if (SCHEME_PRESETS[storedPresetName]) {
      schemePresetSelect.value = storedPresetName;
    }
  }
  if (focusCopyBtn) {
    focusCopyBtn.disabled = true;
  }
  applyPreset(pieceSelect.value);
  updateMethodState();
  autoResizeScheme();
})();
