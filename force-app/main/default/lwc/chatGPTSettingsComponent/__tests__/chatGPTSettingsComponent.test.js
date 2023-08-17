import { createElement } from "lwc";
import ChatGPTSettingsComponent from "c/chatGPTSettingsComponent";
import { getPicklistValuesByRecordType, getObjectInfo } from "lightning/uiObjectInfoApi";
import getSettings from "@salesforce/apex/ChatGPTSettingsHandler.getSettings";
import updateSettings from "@salesforce/apex/ChatGPTSettingsHandler.updateSettings";

const mockGetObjectInfo = require("./data/getObjectInfo.json");
const mockGetPicklistValuesByRecordType = require("./data/getPicklistValuesByRecordType.json");
const mockGetSettings = require("./data/getSettings.json");

jest.mock(
  "@salesforce/apex/ChatGPTSettingsHandler.getSettings",
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);

describe("c-chat-gpt-settings-component", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  async function flushPromises() {
    return Promise.resolve();
  }

  it("displays correct data", async () => {
    const element = createElement("c-chat-gpt-settings-component", {
      is: ChatGPTSettingsComponent
    });
    document.body.appendChild(element);

    getSettings.mockResolvedValue(mockGetSettings);
    getObjectInfo.emit(mockGetObjectInfo);
    getPicklistValuesByRecordType.emit(mockGetPicklistValuesByRecordType);

    return flushPromises().then(() => {
      const inputsEl = element.shadowRoot.querySelector("lightning-input");
      expect(inputsEl.value).toBe(1.1);
    });
  });

  it("displays data after onchange event", async () => {
    const element = createElement("c-chat-gpt-settings-component", {
      is: ChatGPTSettingsComponent
    });
    document.body.appendChild(element);

    getSettings.mockResolvedValue(mockGetSettings);
    getObjectInfo.emit(mockGetObjectInfo);
    getPicklistValuesByRecordType.emit(mockGetPicklistValuesByRecordType);

    return flushPromises().then(() => {
      const comboxEl = element.shadowRoot.querySelector("lightning-combobox");
      comboxEl.value = "/v1/completions";
      comboxEl.dispatchEvent(
        new CustomEvent("change", { detail: { value: comboxEl.value } })
      );
      expect(comboxEl.value).toBe("/v1/completions");
    });
  });

it("displays data after onchange events input elements", async () => {
    const element = createElement("c-chat-gpt-settings-component", {
      is: ChatGPTSettingsComponent
    });
    document.body.appendChild(element);

    getSettings.mockResolvedValue(mockGetSettings);
    getObjectInfo.emit(mockGetObjectInfo);
    getPicklistValuesByRecordType.emit(mockGetPicklistValuesByRecordType);

    return flushPromises().then(() => {
      const inputEls = element.shadowRoot.querySelectorAll("lightning-input");
      inputEls.forEach((item) => {
        item.value = 1;
        item.dispatchEvent(
          new CustomEvent("change", { detail: { value: item.value } })
        );
        expect(item.value).toBe(1);
      });
    });
});

it("test click save button", async () => {
    const element = createElement("c-chat-gpt-settings-component", {
      is: ChatGPTSettingsComponent
    });
    document.body.appendChild(element);

    const handler = jest.fn();
    element.addEventListener('formsaved', handler);

    getSettings.mockResolvedValue(mockGetSettings);
    getObjectInfo.emit(mockGetObjectInfo);
    getPicklistValuesByRecordType.emit(mockGetPicklistValuesByRecordType);

    return flushPromises().then(() => {
        const buttonEls = element.shadowRoot.querySelectorAll("lightning-button");
        buttonEls.forEach((item) => {
            if (item.label === 'Save') {
                item.dispatchEvent(new CustomEvent("click"));
            }
        });
        expect(buttonEls).not.toBeNull();
      });
});
});
