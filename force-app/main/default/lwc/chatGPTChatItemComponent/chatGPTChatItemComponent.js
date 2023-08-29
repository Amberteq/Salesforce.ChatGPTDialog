/****** BEGIN LICENSE BLOCK *****
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
The Initial Developer of the Original Code is Amberteq Inc.
Portions created by the Initial Developer are Copyright (C) 2023
the Initial Developer. All Rights Reserved.
***** END LICENSE BLOCK ******/

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