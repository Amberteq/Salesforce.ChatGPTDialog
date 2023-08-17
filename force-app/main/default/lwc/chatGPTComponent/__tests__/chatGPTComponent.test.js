import { createElement } from 'lwc';
import ChatGPTComponent from 'c/chatGPTComponent';
import { getRecord } from 'lightning/uiRecordApi';
import getChatHistory from '@salesforce/apex/ChatGPTHandler.getChatHistory';
import clearHistory from '@salesforce/apex/ChatGPTHandler.clearHistory';
import getQueryData from '@salesforce/apex/ChatGPTHandler.getQueryData';

const mockGetRecord = require("./data/getRecord.json");
const mockGetChatHistory = require("./data/getChatHistory.json");
const mockClearHistory = 'success';
const mockGetQueryData = require("./data/getQueryData.json");

jest.mock(
    "@salesforce/apex/ChatGPTHandler.getChatHistory",
    () => {
      return {
        default: jest.fn()
      };
    },

    { virtual: true }
);

jest.mock(
    "@salesforce/apex/ChatGPTHandler.clearHistory",
    () => {
      return {
        default: jest.fn()
      };
    },

    { virtual: true }
);

jest.mock(
    "@salesforce/apex/ChatGPTHandler.getQueryData",
    () => {
      return {
        default: jest.fn()
      };
    },

    { virtual: true }
);

describe('c-chat-gpt-component', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    async function flushPromises() {
        return Promise.resolve();
    }

    it('displays chat history', () => {
        const element = createElement('c-chat-gpt-component', {
            is: ChatGPTComponent
        });
        document.body.appendChild(element);

        getChatHistory.mockResolvedValue(JSON.stringify(mockGetChatHistory));
        getRecord.emit(mockGetRecord);

        return flushPromises().then(() => {
            const childEl = element.shadowRoot.querySelector('c-chat-g-p-t-chat-item-component');
            expect(childEl).not.toBeNull();
        });
    });

    it('test click delete chat history button', () => {
        const element = createElement('c-chat-gpt-component', {
            is: ChatGPTComponent
        });
        document.body.appendChild(element);

        getChatHistory.mockResolvedValue(JSON.stringify(mockGetChatHistory));
        getRecord.emit(mockGetRecord);
        clearHistory.mockResolvedValue(mockClearHistory);

        return flushPromises().then(() => {
            const imgEl = element.shadowRoot.querySelector('.trashbin_img');
            imgEl.dispatchEvent(new CustomEvent("click"));
            return flushPromises().then(() => {
                const childEl = element.shadowRoot.querySelector('c-chat-g-p-t-chat-item-component');
                expect(childEl).toBeNull();
            });
        });
    });

    it('test click send button', () => {
        const element = createElement('c-chat-gpt-component', {
            is: ChatGPTComponent
        });
        document.body.appendChild(element);

        getChatHistory.mockResolvedValue(JSON.stringify(mockGetChatHistory));
        getRecord.emit(mockGetRecord);
        getQueryData.mockResolvedValue(JSON.stringify(mockGetQueryData));

        const textAreaEl = element.shadowRoot.querySelector('lightning-textarea');
        textAreaEl.value = 'Hi!';
        const buttonEl = element.shadowRoot.querySelector('button');
        buttonEl.dispatchEvent(new CustomEvent("click"));
        console.log(element.shadowRoot.querySelectorAll('c-chat-g-p-t-chat-item-component').length);

        return flushPromises().then(() => {
            const childEl = element.shadowRoot.querySelectorAll('c-chat-g-p-t-chat-item-component');
            expect(childEl.length).toBeGreaterThan(2);
        });
    });
});