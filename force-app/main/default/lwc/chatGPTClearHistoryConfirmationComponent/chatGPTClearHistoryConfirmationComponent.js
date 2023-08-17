import { LightningElement, api } from 'lwc';
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