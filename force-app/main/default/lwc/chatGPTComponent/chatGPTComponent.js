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

import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getQueryData from '@salesforce/apex/ChatGPTHandler.getQueryData';
import getChatHistory from '@salesforce/apex/ChatGPTHandler.getChatHistory';
import USER_ID from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import USER_NAME from '@salesforce/schema/User.Name';
import USER_PHOTO_URL from '@salesforce/schema/User.FullPhotoUrl';
import CHAT_LOGO from '@salesforce/resourceUrl/ChatGPT_Logo';
import ChatGPTSettingsComponentModel from 'c/chatGPTSettingsComponent';
import ChatGPTClearHistoryConfirmationComponentModal from 'c/chatGPTClearHistoryConfirmationComponent';

export default class ChatGPTComponent extends LightningElement {
    @track messages = [];
    @track message = '';
    @track showSpinner = false;
    @track hideSpinner = true;
    @track disabledButton = false;
    @track userName;
    @track userPhotoUrl;
    @track chatGPTLogo = CHAT_LOGO;

    channelName = '/event/ChatGPTEvent__e';
    subscription = {};
    messageId = 0;

    /*subscribeOnEvent() {
        const messageCallback = response => {
            let parsedResult = JSON.parse(response.data.payload.amb_sf_chatgpt__message__c);
            this.messages.unshift({
                id: this.messageId++,
                member: this.userName,
                value: parsedResult[0].message,
                chatLogo: this.userPhotoUrl,
                time: parsedResult[0].time
            });
            this.messages.unshift({
                id: this.messageId++,
                member: 'ai',
                value: parsedResult[1].message,
                chatLogo: this.chatGPTLogo,
                time: parsedResult[1].time
            });
            this.changeSpinnerState(false);
        };

        subscribe(this.channelName, -1, messageCallback);
    }
*/
    @wire(getRecord, {
        recordId: USER_ID, 
        fields: [USER_NAME, USER_PHOTO_URL]
    }) wireUser({error, data}) {
        if (error) {
            console.log(error);
            this.showToast({
                title: 'Error!',
                message: 'Something went wrong.',
                variant: 'error'
            });
        } else if (data) {
            this.userName = data.fields.Name.value;
            this.userPhotoUrl = data.fields.FullPhotoUrl.value;

            getChatHistory({ userId: USER_ID })
                .then(result => {
                    if (result) {
                        let parsedResult = JSON.parse(result);
                        for (let i = 0; i < parsedResult.length; i++) {
                            if (i % 2 === 0) {
                                this.messages.unshift({
                                    id: this.messageId++,
                                    member: this.userName,
                                    value: parsedResult[i].message,
                                    chatLogo: this.userPhotoUrl,
                                    time: parsedResult[i].time
                                });
                            } else {
                                this.messages.unshift({
                                    id: this.messageId++,
                                    member: 'ai',
                                    value: parsedResult[i].message,
                                    chatLogo: this.chatGPTLogo,
                                    time: parsedResult[i].time
                                });
                            }
                        }
                    }
                })
                .catch(error => {
                    if (error.body.message === 'Script-thrown exception') {
                        this.disabledButton = true;
                    }
                    this.showToast({
                        title: 'Error!',
                        message: 'Interaction with OpenAI API does not installed properly. Please, ask your administrator provide OpenAI API KEY.',
                        variant: 'error'
                    });
                    console.log(error);
                })

            //this.subscribeOnEvent();
        }   
    }

    handleSendButton() {
        const textAreaValue = this.template.querySelector('lightning-textarea').value;
        
        if (textAreaValue.length > 0) {
            this.changeSpinnerState(true);
            const dispatchTime = new Date();

            let messageItem = {
                message: textAreaValue,
                time: dispatchTime
            }

            getQueryData({messageItem: messageItem, browserItemHours: dispatchTime.getHours(), userId: USER_ID})
                .then(result => {
                    let parsedResult = JSON.parse(result);
                    this.messages.unshift({
                        id: this.messageId++,
                        member: this.userName,
                        value: textAreaValue,
                        chatLogo: this.userPhotoUrl,
                        time: dispatchTime
                    });
                    this.messages.unshift({
                        id: this.messageId++,
                        member: 'ai',
                        value: parsedResult.message,
                        chatLogo: this.chatGPTLogo,
                        time: parsedResult.time
                    });
                    this.changeSpinnerState(false);
                })
                .catch(error => { 
                    this.changeSpinnerState(false);
                    this.showToast({
                        title: 'Error!',
                        message: 'Something went wrong.',
                        variant: 'error'
                    });
                    console.log(error)
                })
        } else {
            this.showToast({
                title: 'Error!',
                message: 'A message can not be empty.',
                variant: 'error'
            });
        }
    }

    async handleClickClearHistoryButton() {
        const result = await ChatGPTClearHistoryConfirmationComponentModal.open({
            userId: USER_ID,
            size: 'small'
        });
        if (result === 'success') {
            this.messages = [];
        }
    }

    async handleClickSettingsButton() {
        const result = await ChatGPTSettingsComponentModel.open({
            userId: USER_ID,
            size: 'medium'
        });
    }

    handleKeyPress(event) {
        if (event.keyCode === 10) {
            this.handleSendButton();
        }
    }

    handleChangeTextArea(event) {
        this.message = event.target.value;
    }

    showToast(toastEventObject) {
        const event = new ShowToastEvent(toastEventObject);
        this.dispatchEvent(event);
    }

    changeSpinnerState(state) {
        this.showSpinner = state;
        this.hideSpinner = !state;
    }

    get messagesLength() {
        return this.messages.length;
    }

    get disableButton() {
        return this.disabledButton || this.message.trim() === '';
    }

}