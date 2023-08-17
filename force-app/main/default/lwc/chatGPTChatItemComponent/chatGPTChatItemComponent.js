import { LightningElement, api } from 'lwc';

export default class ChatGPTChatItemComponent extends LightningElement {
    @api member;
    @api message;
    @api chatLogo;
    @api time;

    get classes() {
        return this.member === 'ai' ? 'container containerAI' : 'container';
    }

    get isUser() {
        return this.member !== 'ai';
    }

    get formattedTime() {
        let formattedTime = '';
        let date = new Date(this.time);
        let currentDate = new Date();
        let minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

        if (date.getDay() === currentDate.getDay()) {
            formattedTime = `Today, ${date.getHours()}:${minutes}`;
        } else if ((currentDate.getDate() - date.getDate() === 1) && (date.getMonth() === currentDate.getMonth())) {
            formattedTime = `Yesterday, ${date.getHours()}:${minutes}`;
        } else {
            formattedTime = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}, ${date.getHours()}:${minutes}`;
        }

        return formattedTime;
    }
}