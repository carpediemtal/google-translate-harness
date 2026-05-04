/**
 * background.ts
 */

chrome.runtime.onInstalled.addListener(() => {
  const dc = chrome.declarativeContent;
  if (dc) {
    dc.onPageChanged.removeRules(undefined, () => {
      dc.onPageChanged.addRules([{
        conditions: [
          new dc.PageStateMatcher({
            pageUrl: { hostContains: 'translate.google.' },
          }) as any
        ],
        actions: [new dc.ShowPageAction() as any]
      }]);
    });
  }
});

interface Listeners {
  [key: string]: (opt: any, sender: chrome.runtime.MessageSender) => Promise<any> | any;
}

const KS4GT_BP = {
  init() {
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this));
    return this;
  },

  listeners: {
    userSettings(opt: any, _sender: chrome.runtime.MessageSender) {
      return KS4GT_BP.getUserSettings(opt && opt.search);
    },
    defaultSettings(opt: any, _sender: chrome.runtime.MessageSender) {
      return KS4GT_BP.getDefaultSettings(opt.baseName);
    },
    platformInfo(_opt: any, _sender: chrome.runtime.MessageSender) {
      return KS4GT_BP.getPlatformInfo();
    }
  } as Listeners,

  onMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    const promises = new Map<string, Promise<any>>();

    if (!message) {
      sendResponse({});
      return;
    }

    if (typeof message === 'string') {
      message = { message: null };
    }

    Object.entries(message).forEach(([req, opt]) => {
      const f = (this.listeners as Listeners)[req];
      if (f) {
        const result = f.call(this, opt, sender);
        promises.set(req, Promise.resolve(result));
      }
    });

    Promise.all(promises.values()).then((res) => {
      const ret: { [key: string]: any } = {};
      let i = 0;
      promises.forEach((_, k) => {
        ret[k] = res[i++];
      });
      sendResponse(ret);
    });

    return true;
  },

  getUserSettings(search?: string | string[] | { [key: string]: any }) {
    return this.getStorage(search || 'userSettings');
  },

  getStorage(search: string | string[] | { [key: string]: any }) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(search, (items) => {
        let result: any = items || {};
        if (typeof search === 'string') {
          result = result[search];
        }
        resolve(result);
      });
    });
  },

  async getDefaultSettings(baseName: string) {
    const url = chrome.runtime.getURL(`dev/${baseName}.min.json`);
    const res = await fetch(url);
    return res.json();
  },

  getPlatformInfo(): Promise<chrome.runtime.PlatformInfo> {
    return new Promise((resolve) => {
      chrome.runtime.getPlatformInfo((pi) => {
        resolve(pi);
      });
    });
  }
};

KS4GT_BP.init();
