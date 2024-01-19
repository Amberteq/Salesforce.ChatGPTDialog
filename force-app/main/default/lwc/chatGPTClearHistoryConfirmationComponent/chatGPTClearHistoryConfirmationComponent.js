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

import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import clearHistory from '@salesforce/apex/ChatGPTHandler.clearHistory';

export default class ChatGPTClearHistoryConfirmationComponent extends LightningModal {
    @api userId;

    handleCancelClick() {
        this.close('canceled');
    }

    handleConfirmClick() {
        clearHistory({ userId: this.userId })
            .then(result => {
                if (result === 'success') {
                    this.messages = [];
                    this.close('success');
                }
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error!',
                    variant: 'error',
                    message: 'Something went wrong!'
                }));
                console.log(error);
            })
    }
}