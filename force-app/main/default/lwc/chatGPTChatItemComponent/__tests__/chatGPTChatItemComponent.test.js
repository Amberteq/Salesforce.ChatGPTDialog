import { createElement } from 'lwc';
import ChatGPTChatItemComponent from 'c/chatGPTChatItemComponent';

const mockUserData = { fields: {
    member: {
        value: 'Test User'
    },
    message: {
        value: 'Test User Message'
    },
    time: {
        value: new Date()
    }
}};

const mockAIData = { fields: {
    member: {
        value: 'ai'
    },
    message: {
        value: 'Test AI Message'
    }
}};

describe('c-chat-gpt-chat-item-component', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });
    it('displays AI Chat item', () => {
        // Create initial element
        const element = createElement('c-chat-gpt-chat-item-component', {
            is: ChatGPTChatItemComponent
        });

        element.member = mockAIData.fields.member.value;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const usernameEl = element.shadowRoot.querySelector('.container_username_item');
            expect(usernameEl).toBeNull();
        });
    });
    it('displays the correct today time message', () => {
        // Create initial element
        const element = createElement('c-chat-gpt-chat-item-component', {
            is: ChatGPTChatItemComponent
        });

        element.time = mockUserData.fields.time.value;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const timeEl = element.shadowRoot.querySelector('.container_time_item');
            const time = mockUserData.fields.time.value;
            expect(timeEl.value).toBe(`Today, ${time.getHours()}:${time.getMinutes()}`);
        });
    });
    it('displays the correct yesterday time message', () => {
        // Create initial element
        const element = createElement('c-chat-gpt-chat-item-component', {
            is: ChatGPTChatItemComponent
        });
        
        const date = mockUserData.fields.time.value;
        element.time = date.setDate(date.getDate() - 1);
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const timeEl = element.shadowRoot.querySelector('.container_time_item');
            const time = mockUserData.fields.time.value;
            expect(timeEl.value).toBe(`Yesterday, ${time.getHours()}:${time.getMinutes()}`);
        });
    });
    it('displays the correct user message', () => {
        // Create initial element
        const element = createElement('c-chat-gpt-chat-item-component', {
            is: ChatGPTChatItemComponent
        });

        element.member = mockUserData.fields.member.value;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const usernameEl = element.shadowRoot.querySelector('.container_username_item');
            const username = mockUserData.fields.member.value;
            expect(usernameEl.value).toBe(username);
        });
    });
});

