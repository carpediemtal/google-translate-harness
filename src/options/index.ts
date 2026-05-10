import './style.css';

const $ = (id: string) => document.getElementById(id);
const $$ = (selector: string) => document.querySelectorAll(selector);

const iterateObject = (obj: any, fn: (key: string, value: any, obj: any) => boolean | void) => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (fn(key, obj[key], obj) === false) {
        return;
      }
    }
  }
};

const KS4GT_OP_view = {
  STATUS_BOX_ID: 'status',
  SAVE_BTN_ID: 'save-btn',
  RESET_BTN_ID: 'reset-btn',
  GROUP_CLS: 'group-wrap',
  ROW_CLS: 'row-wrap',
  RCV_ID_NAME: 'name',
  SHORTCUT_KEY_NAME: 'shortcut-key',
  SHIFT_NAME: 'with-shift',
  NAVI_DISP_NAME: 'navi-disp',

  NAVI_TYPE: {
    atAllTimes: 'at all times',
    whileHovering: 'while hovering',
    none: 'none'
  },

  pivotKey: 'Alt',

  init(config: any = {}) {
    const def = config.defaultSettings || {};
    const custom = config.customSettings || {};
    const pivotKey = config.pivotKey;

    if (pivotKey) {
      this.pivotKey = pivotKey;
    }

    this.drawBase();
    this.drawSettingTools(def, custom);
  },

  drawBase() {
    document.body.insertAdjacentHTML('afterbegin', this.baseHtml());
  },

  drawSettingTools(defaultSettings: any, customSettings: any) {
    const groups: any = {};

    iterateObject(defaultSettings, (name, settings) => {
      const g = settings.group;
      if (!groups[g]) { groups[g] = []; }
      
      const combined = { ...settings, ...customSettings[name] };
      groups[g].push(this.keySettingsHtml(name, combined));

      if (combined.naviDisp && !groups[g].naviDisp) {
        groups[g].naviDisp = combined.naviDisp;
      }
    });

    iterateObject(groups, (groupName, groupValues) => {
      const container = $(`group-${groupName}`);
      if (!container) return;

      container.insertAdjacentHTML('beforeend', groupValues.join(''));
      const naviSelector = container.querySelector(`[name=${this.NAVI_DISP_NAME}]`) as HTMLSelectElement;
      if (naviSelector) {
        naviSelector.value = groupValues.naviDisp || this.NAVI_TYPE.atAllTimes;
      }
    });
  },

  baseHtml() {
    return `
<div class="flex justify-between items-center p-2 border-b bg-gray-50">
  <div class="font-bold text-green-600">Pivot is ${this.pivotKey}</div>
  <div id="${this.RESET_BTN_ID}" class="underline text-yellow-700 cursor-pointer text-sm">reset settings</div>
</div>
<div class="p-4 flex flex-wrap gap-4 items-start" style="min-width: 550px;">
  ${this.groupHtml('lang')}
  ${this.groupHtml('source')}
  ${this.groupHtml('result')}
</div>
<div class="flex justify-between items-center p-2 border-t bg-gray-50 sticky bottom-0">
  <div id="${this.STATUS_BOX_ID}" class="text-sm"></div>
  <button id="${this.SAVE_BTN_ID}" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded">Save</button>
</div>`;
  },

  groupHtml(group: string) {
    return `
<section id="group-${group}" class="border rounded shadow-sm overflow-hidden flex-1 min-w-[250px] ${this.GROUP_CLS}">
  <h1 class="bg-gray-200 p-2 font-bold text-md border-b">
    <span class="capitalize">${group} area</span>
  </h1>
  <div class="p-2 border-b bg-gray-50 flex justify-between items-center ${this.ROW_CLS}">
    <span class="text-xs">show key navigation:</span>
    <select name="${this.NAVI_DISP_NAME}" class="text-xs border rounded p-1">
      <option>${this.NAVI_TYPE.atAllTimes}</option>
      <option>${this.NAVI_TYPE.whileHovering}</option>
      <option>${this.NAVI_TYPE.none}</option>
    </select>
  </div>
</section>`;
  },

  keySettingsHtml(name: string, settings: any) {
    return `
<div class="p-2 border-b last:border-b-0 flex items-center text-sm even:bg-gray-50 ${this.ROW_CLS}">
  <div class="w-20 font-bold mr-2 truncate">
    ${settings.alias || name}
    <input type="hidden" name="${this.RCV_ID_NAME}" value="${name}">
  </div>
  <div class="flex-1 flex items-center gap-1">
    <span class="text-gray-500 text-xs">Pivot +</span>
    <input type="text" name="${this.SHORTCUT_KEY_NAME}" 
      class="w-8 h-8 text-center border rounded focus:border-blue-500 outline-none invalid:bg-red-200"
      value="${settings.shortcutKey || ''}" maxlength="1">
  </div>
  <div class="flex items-center gap-1 ml-4">
    <span class="text-xs text-gray-500">shift:</span>
    <input type="checkbox" name="${this.SHIFT_NAME}" class="rounded"
    ${settings.shift ? 'checked' : ''}>
  </div>
</div>`;
  },

  findAncestor(cls: string, clue: HTMLElement): HTMLElement {
    let elm: HTMLElement | null = clue;
    while (elm && !elm.classList.contains(cls)) {
      elm = elm.parentElement;
    }
    return elm || clue;
  },

  findGroupContained(clue: HTMLElement) { return this.findAncestor(this.GROUP_CLS, clue); },
  findRowContained(clue: HTMLElement) { return this.findAncestor(this.ROW_CLS, clue); },
  getRowItem(name: string, row: HTMLElement) { return row.querySelector(`[name=${name}]`) as HTMLInputElement | HTMLSelectElement; },
  getBrother(name: string, clue: HTMLElement) { return this.getRowItem(name, this.findRowContained(clue)); },
  getResetBtn() { return $(this.RESET_BTN_ID); },
  getSaveBtn() { return $(this.SAVE_BTN_ID); },
  getStatusBox() { return $(this.STATUS_BOX_ID); },

  getRowElementsOfShortcutKeySetting() {
    return Array.from($$(`.${this.ROW_CLS}`)).filter(row => this.getShortcutKeyElm(row as HTMLElement)) as HTMLElement[];
  },

  getAllShortcutKeyElements() {
    return $$(`[name=${this.SHORTCUT_KEY_NAME}]`) as NodeListOf<HTMLInputElement>;
  },

  getRcvIdElm(row: HTMLElement) { return this.getRowItem(this.RCV_ID_NAME, row); },
  getShortcutKeyElm(row: HTMLElement) { return this.getRowItem(this.SHORTCUT_KEY_NAME, row); },
  getShiftElm(row: HTMLElement) { return this.getRowItem(this.SHIFT_NAME, row) as HTMLInputElement; },
  getNaviDispElm(row: HTMLElement) {
    const group = this.findGroupContained(row);
    return group.querySelector(`[name=${this.NAVI_DISP_NAME}]`) as HTMLSelectElement;
  },

  getRcvId(row: HTMLElement) { return (this.getRcvIdElm(row) as HTMLInputElement).value; },
  getShortcutKey(row: HTMLElement) { return (this.getShortcutKeyElm(row) as HTMLInputElement).value; },
  getWithShift(row: HTMLElement) { return !!(this.getShiftElm(row)).checked; },
  getNaviDisp(row: HTMLElement) { return this.getNaviDispElm(row).value; }
};

const KS4GT_OP = {
  acceptableKeyRegExp: /^.?$/,
  userSettings: {} as any,
  recievers: {} as any,
  platformInfo: {} as any,
  isReady: false,
  onReady: () => {},

  view: KS4GT_OP_view,

  ready() {
    if (this.isReady) return;
    chrome.runtime.sendMessage({
      defaultSettings: { baseName: 'default_settings' },
      userSettings: null,
      platformInfo: null
    }, (res) => {
      this.recievers = res.defaultSettings || {};
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

    const pivotKey = (this.platformInfo.os === 'mac') ?
      '[Option] or [Control]' : '[Alt]';

    this.view.init({
      defaultSettings: this.recievers,
      customSettings: this.userSettings,
      pivotKey: pivotKey
    });

    this.view.getResetBtn()?.addEventListener('click', this.deleteUserSettings.bind(this));
    this.view.getSaveBtn()?.addEventListener('click', this.saveUserSettings.bind(this));
    this.view.getAllShortcutKeyElements().forEach((elm) => {
      elm.addEventListener('keyup', this.onShortcutKeyChange.bind(this));
    });
  },

  saveUserSettings() {
    const us: any = {};
    const invalidElements = this.validate();
    if (invalidElements.length) {
      let msg = '';
      invalidElements.forEach(elm => msg += elm.validationMessage + '<br>');
      this.showMessage(msg, 'bad');
      return false;
    }

    this.view.getRowElementsOfShortcutKeySetting().forEach(row => {
      const name = this.view.getRcvId(row);
      us[name] = {
        shortcutKey: this.view.getShortcutKey(row),
        shift: this.view.getWithShift(row),
        naviDisp: this.view.getNaviDisp(row)
      };
    });

    chrome.storage.sync.set({ 'userSettings': us }, () => {
      this.showMessage('options saved !', 'good', 1500);
    });
  },

  deleteUserSettings() {
    chrome.storage.sync.remove('userSettings', () => {
      this.showMessage('options are reset.', 'good', 1000, () => {
        location.reload();
      });
    });
  },

  onShortcutKeyChange(evt: KeyboardEvent) {
    const elm = evt.target as HTMLInputElement;
    const row = this.view.findRowContained(elm);
    elm.value = this.correctShortcutKey(elm.value);

    if (this.validate(row).length) {
      this.showMessage(elm.validationMessage, 'bad', 1500);
    } else if (evt.shiftKey) {
      const cb = this.view.getBrother(this.view.SHIFT_NAME, elm) as HTMLInputElement;
      if (cb) cb.checked = true;
    }
  },

  showMessage(msg: string, state?: string | number, lifetime?: number, callback?: () => void) {
    const box = this.view.getStatusBox();
    if (!box) return;

    box.className = 'text-sm'; // base Tailwind classes
    if (typeof state === 'number') {
      lifetime = state;
      state = '';
    }

    if (state === 'good') box.classList.add('text-green-600');
    if (state === 'bad') box.classList.add('text-red-500');
    box.innerHTML = msg;

    if (lifetime) {
      setTimeout(() => {
        box.innerHTML = '';
        box.className = 'text-sm';
        if (callback) callback();
      }, lifetime);
    }
  },

  correctShortcutKey(str: string) {
    return this.toHalf(str.substring(0, 1)).toLowerCase();
  },

  validate(rows?: HTMLElement | HTMLElement[]) {
    const invalidElements: HTMLInputElement[] = [];
    let targetRows: HTMLElement[] = [];

    if (!rows) {
      targetRows = this.view.getRowElementsOfShortcutKeySetting();
    } else if (!Array.isArray(rows)) {
      targetRows = [rows];
    } else {
      targetRows = rows;
    }

    targetRows.forEach(row => {
      const elm = this.view.getShortcutKeyElm(row) as HTMLInputElement;
      const val = elm.value;
      if (!val.match(this.acceptableKeyRegExp)) {
        elm.setCustomValidity('invalid shortcut key.');
        invalidElements.push(elm);
      } else {
        elm.setCustomValidity('');
      }
    });

    return invalidElements;
  },

  toHalf(str: string) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  }
};

KS4GT_OP.init();
