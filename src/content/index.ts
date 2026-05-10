/**
 * content.ts
 */

interface Reciever {
  shortcutKey: string;
  elm?: HTMLElement;
  capElm?: HTMLElement;
  cmd: string;
  clickTarget: { selector: string, idx: number };
  captionTarget?: { selector: string, idx: number };
  alt?: boolean;
  shift?: boolean;
  naviDisp: string;
  alias?: string;
  group: string;
}

const KS4GT_CS = {
  mouseEvent: {} as { [key: string]: MouseEvent },
  altTarget: {} as { [key: string]: { elm: HTMLElement, cmd: string } },
  altShiftTarget: {} as { [key: string]: { elm: HTMLElement, cmd: string } },
  keysRegExp: /^$/ as RegExp,
  userSettings: {} as any,
  defaultSettings: {} as { [key: string]: Reciever },
  platformInfo: {} as any,
  isReady: false,
  onReady: () => {},

  NAVI_TYPE: {
    atAllTimes: 'at all times',
    whileHovering: 'while hovering',
    none: 'none'
  },

  domUpdateObserver: () => {},

  uiVersionConfig: {
    latest: {
      cssFileName: 'content_styles.css',
      defaultSettingsBaseName: 'default_settings',
      domUpdateObserver(this: any) {
        const sourceFooter = document.querySelector('.FFpbKc');
        const resultContainer = document.querySelector('.usGWQd');
        const initializer = new MutationObserver(() => this.debouncedInit());
        resultContainer && initializer.observe(resultContainer, { childList: true });
        sourceFooter && initializer.observe(sourceFooter, { childList: true, subtree: true });

        const langMenuBtns = document.querySelectorAll('.akczyd');
        const captionReseter = new MutationObserver((m) => {
          if (!(m[0].target as HTMLElement).dataset.keyNavi) {
            this.setKeyCaption();
          }
        });
        langMenuBtns.forEach(btn => captionReseter.observe(btn, { subtree: true, attributeFilter: ['data-key-navi'] }));
      },
    },
    '202210': {
      cssFileName: 'content_styles_202210.css',
      defaultSettingsBaseName: 'default_settings202210',
      domUpdateObserver(this: any) {
        const sourceFooter = document.querySelector('.FFpbKc');
        const resultContainer = document.querySelector('.dePhmb');
        const initializer = new MutationObserver(() => this.debouncedInit());
        resultContainer && initializer.observe(resultContainer, { childList: true });
        sourceFooter && initializer.observe(sourceFooter, { childList: true, subtree: true });

        const langMenuBtns = document.querySelectorAll('.szLmtb');
        const captionReseter = new MutationObserver((m) => {
          if (!(m[0].target as HTMLElement).dataset.keyNavi) {
            this.setKeyCaption();
          }
        });
        langMenuBtns.forEach(btn => captionReseter.observe(btn, { subtree: true, attributeFilter: ['data-key-navi'] }));
      },
    },
    '202011': {
      cssFileName: 'content_styles_202011.css',
      defaultSettingsBaseName: 'default_settings202011',
      domUpdateObserver(this: any) {
        const sourceFooter = document.querySelector('.source-or-target-footer');
        const resultContainer = document.querySelector('.tlid-results-container');
        const initializer = new MutationObserver(() => this.debouncedInit());
        resultContainer && initializer.observe(resultContainer, { childList: true });
        sourceFooter && initializer.observe(sourceFooter, { childList: true, subtree: true });
      },
    },
  } as any,

  ready() {
    if (this.isReady) return;

    const version = this.getUiVersion();
    const config = this.uiVersionConfig[version];

    this.injectStyleSheet(chrome.runtime.getURL(`assets/${config.cssFileName}`));
    this.domUpdateObserver = config.domUpdateObserver.bind(this);
    this.observeDomUpdated();
    this.listenKeyEvent();

    chrome.runtime.sendMessage({
      defaultSettings: { baseName: config.defaultSettingsBaseName },
      userSettings: null,
      platformInfo: null
    }, (res) => {
      this.defaultSettings = res.defaultSettings || {};
      this.userSettings = res.userSettings || {};
      this.platformInfo = res.platformInfo || {};
      this.isReady = true;
      this.onReady();
    });
  },

  init() {
    if (!this.isReady) {
      this.onReady = this.init.bind(this);
      this.ready();
      return;
    }

    this.setupMouseEventEmulator();
    this.setupRecievers(this.defaultSettings);
    this.applyUserSettings();
    this.initKeyMaps();
    this.setKeyCaption();
  },

  debounceTimer: null as any,
  debouncedInit() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.init(), 200);
  },

  getUiVersion() {
    if (document.querySelector('.IK3GNd')) return '202210';
    if (document.querySelector('.jfk-button')) return '202011';
    return 'latest';
  },

  observeDomUpdated() {
    this.domUpdateObserver();
  },

  setupRecievers(settingsJson: { [key: string]: Reciever }) {
    Object.entries(settingsJson).forEach(([_, settings]) => {
      const cli = settings.clickTarget;
      const cap = settings.captionTarget;
      settings.elm = document.querySelectorAll(cli.selector)[cli.idx || 0] as HTMLElement;
      if (cap) {
        settings.capElm = document.querySelectorAll(cap.selector)[cap.idx || 0] as HTMLElement;
      }
    });
    this.defaultSettings = settingsJson;
  },

  applyUserSettings() {
    Object.entries(this.userSettings).forEach(([name, setting]: [string, any]) => {
      const rcv = this.defaultSettings[name];
      if (!rcv) return;
      Object.assign(rcv, {
        shortcutKey: setting.shortcutKey?.toLowerCase(),
        shift: setting.shift,
        naviDisp: setting.naviDisp
      });
    });
  },

  setKeyCaption() {
    const altCaption = (this.platformInfo.os === 'mac') ? 'option' : 'alt';

    Object.values(this.defaultSettings).forEach((rcv) => {
      let key = rcv.shortcutKey;
      if (!key) return;

      const elm = rcv.capElm || rcv.elm;
      if (!elm) return;

      switch (rcv.naviDisp) {
        case this.NAVI_TYPE.none:
          return;
        case this.NAVI_TYPE.whileHovering:
          const keyCombs = [];
          if (rcv.alt) keyCombs.push(altCaption);
          if (rcv.shift) keyCombs.push('shift');
          keyCombs.push(key);
          if (!elm.dataset.tooltip) elm.dataset.tooltip = '';
          elm.dataset.tooltip += `(${keyCombs.join(' + ')})`;
          break;
        default:
          if (rcv.shift) key = key.toUpperCase();
          elm.dataset.keyNavi = `(${key})`;
          elm.classList.add('navi');
          break;
      }
    });
  },

  injectStyleSheet(url: string) {
    const lastLink = document.querySelector('link:last-of-type');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    if (lastLink) {
      lastLink.parentNode?.insertBefore(link, lastLink.nextSibling);
    } else {
      document.head.appendChild(link);
    }
  },

  setupMouseEventEmulator() {
    ['mousedown', 'mouseup', 'mouseout', 'mouseover', 'click'].forEach(e => {
      const evt = new MouseEvent(e, { bubbles: true, cancelable: false });
      this.mouseEvent[e] = evt;
    });
  },

  initKeyMaps() {
    this.altTarget = {};
    this.altShiftTarget = {};
    let keys = '';

    Object.values(this.defaultSettings).forEach((rcv) => {
      const key = rcv.shortcutKey;
      if (!key) return;

      const reciever = { elm: rcv.elm!, cmd: rcv.cmd };
      if (rcv.alt && rcv.shift) {
        this.altShiftTarget[key] = reciever;
      } else if (rcv.alt) {
        this.altTarget[key] = reciever;
      }
    });

    for (const key in this.altTarget) keys += key;
    for (const key in this.altShiftTarget) if (!keys.includes(key)) keys += key;
    this.keysRegExp = new RegExp(`^[${keys}]$`, 'i');
  },

  listenKeyEvent() {
    const translateRcv = this.defaultSettings.translate;
    const handler = (evt: KeyboardEvent) => {
      if (evt.repeat) return;

      let rcv: { elm: HTMLElement, cmd: string } | undefined;

      if (evt.shiftKey && evt.key === 'Enter') {
        window.setTimeout(() => translateRcv.elm?.focus(), 0);
        rcv = { elm: translateRcv.elm!, cmd: translateRcv.cmd };
      } else if (evt.key === 'Escape') {
        for (const cand of Object.values(this.defaultSettings)) {
          if (cand.shortcutKey !== 'ESC') continue;
          const elm = document.querySelector(cand.clickTarget.selector) as HTMLElement;
          if (elm && elm.offsetParent) {
            rcv = { elm, cmd: cand.cmd };
            break;
          }
        }
      } else {
        rcv = this.getAssignedReciever(evt);
      }

      if (rcv) {
        this.emulate(rcv.cmd, rcv.elm);
        evt.preventDefault();
        evt.stopPropagation();
      }
    };
    document.addEventListener('keydown', handler, true);
  },

  getAssignedReciever(evt: KeyboardEvent) {
    const pivotKeyPressed = (this.platformInfo.os === 'mac') ?
      evt.altKey || evt.ctrlKey : evt.altKey;

    if (!pivotKeyPressed) return;

    let key = evt.key.toLowerCase();
    if (!key.match(this.keysRegExp)) {
      const code = evt.code;
      if (code.match(/^(Key|Digit|Numpad)/)) {
        const physicalKey = code.slice(-1).toLowerCase();
        if (physicalKey.match(this.keysRegExp)) {
          key = physicalKey;
        } else {
          return;
        }
      }
    }

    return evt.shiftKey ? this.altShiftTarget[key] || this.altTarget[key] : this.altTarget[key];
  },

  emulate(cmd = 'click', elm?: HTMLElement) {
    if (!elm) return;
    const methodName = `emulate${this.camelize(cmd)}`;
    (this as any)[methodName]?.(elm);
  },

  emulateMouseDownUp(elm: HTMLElement) {
    const events = ['mousedown', 'mouseup', 'click'];
    events.forEach(e => {
      const opt = { bubbles: true, cancelable: true, view: window };
      elm.dispatchEvent(new MouseEvent(e, opt));
    });
  },

  emulateClick(elm: HTMLElement) {
    this.emulateMouseDownUp(elm);
  },
  emulateFocus(elm: HTMLElement) { elm.focus(); },

  camelize(str: string) {
    return str.replace(/(?:^|[-_])(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
  }
};

KS4GT_CS.init();
