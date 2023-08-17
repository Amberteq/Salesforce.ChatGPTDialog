import { LightningElement, wire, track, api } from 'lwc';
import getSettings from '@salesforce/apex/ChatGPTSettingsHandler.getSettings';
import updateSettings from '@salesforce/apex/ChatGPTSettingsHandler.updateSettings';
import { getPicklistValuesByRecordType, getObjectInfo } from 'lightning/uiObjectInfoApi';
import LightningModal from 'lightning/modal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ChatGPTSettingsComponent extends LightningModal {

    @api userId;
    objectApiName = 'amb_sf_chatgpt__OpenAISettings__c';
    objectId = '';
    baseUrlFieldApiName = 'amb_sf_chatgpt__BaseURL__c';
    modelFieldApiName = 'amb_sf_chatgpt__Model__c';
    recordTypeId = '';

    @track showSpinner = true;
    @track hideSpinner = false;
    @track dependentPicklistFieldValues = [];
    @track selectedBaseUrl = '';
    @track disabledModelPicklist = true;
    @track selectedModel;

    @track temperature;
    @track maxTokenSize;
    @track lengthOfDaysToKeepHistory;

    @wire(getObjectInfo, { objectApiName: '$objectApiName'})
    objectInfo({error, data}) {
        if (data) {
            this.recordTypeId = data.defaultRecordTypeId;
        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValuesByRecordType , { objectApiName: '$objectApiName', recordTypeId: '$recordTypeId'})
    fetchPicklist({error, data}){
        if (data && data.picklistFieldValues) {
            data.picklistFieldValues[this.baseUrlFieldApiName].values.forEach(baseUrlItem => {
                let dependentArray = [];
                let currentControllerValue = data.picklistFieldValues[this.modelFieldApiName].controllerValues[baseUrlItem.label];
                
                data.picklistFieldValues[this.modelFieldApiName].values.forEach(modelItem => {
                    if (modelItem.validFor[0] === currentControllerValue) {
                        dependentArray.push({
                            label: modelItem.label,
                            value: modelItem.value
                        });
                    }
                });

                this.dependentPicklistFieldValues.push({
                    label: baseUrlItem.label, 
                    value: baseUrlItem.value,
                    dependentArray: dependentArray
                });
            });

            getSettings({ userId: this.userId })
                .then(result => {
                    this.objectId = result.Id;
                    this.selectedBaseUrl = result.amb_sf_chatgpt__BaseURL__c;
                    this.selectedModel = result.amb_sf_chatgpt__Model__c;
                    this.temperature = result.amb_sf_chatgpt__Temperature__c;
                    this.maxTokenSize = result.amb_sf_chatgpt__MaxTokenSize__c;
                    this.lengthOfDaysToKeepHistory = result.amb_sf_chatgpt__LengthOfDaysToKeepHistory__c;
                    this.disabledModelPicklist = false;

                    this.showSpinner = false;
                    this.hideSpinner = true;
                })
                .catch(error => {
                    console.log(error);
                })
        } else if (error) {
            console.log(error);
        }
    }

    changeSpinnerState(state) {
        this.showSpinner = state;
        this.hideSpinner = !state;
    }
    
    handleBaseUrlChange(event) {
        this.selectedBaseUrl = event.detail.value;
        this.disabledModelPicklist = false;
    }

    handleModelChange(event) {
        this.selectedModel = event.detail.value;
    }

    handleTemperatureChange(event) {
        this.temperature = event.detail.value;
    }
    
    handleMaxTokenSizeChange(event) {
        this.maxTokenSize = event.detail.value;
    }

    handleLengthOfDaysChange(event) {
        this.lengthOfDaysToKeepHistory = event.detail.value;
    }

    get baseUrlPicklist() {
        return this.dependentPicklistFieldValues.map(item => {
            return {
                label: item.label,
                value: item.value
            };
        });
    }

    get modelPicklist() {
        let dependentArray = [];

        if (this.dependentPicklistFieldValues.length > 0 && this.selectedBaseUrl) {
            this.dependentPicklistFieldValues.map(item => {
                if (item.value === this.selectedBaseUrl) {
                    dependentArray = item.dependentArray;
                }
            });
        }
        
        return dependentArray;
    }

    handleCancelClick() {
        this.close('canceled');
    }

    handleSaveClick() {
        this.changeSpinnerState(true);
        let settingsItem = {};
        let settingsItemJSON = '';
        
        settingsItem.Id = this.objectId;
        settingsItem.amb_sf_chatgpt__BaseURL__c = this.selectedBaseUrl;
        settingsItem.amb_sf_chatgpt__Model__c = this.selectedModel;

        if (this.temperature) {
            settingsItem.amb_sf_chatgpt__Temperature__c = this.temperature;
        }
        if (this.maxTokenSize) {
            settingsItem.amb_sf_chatgpt__MaxTokenSize__c = this.maxTokenSize;
        }
        if (this.lengthOfDaysToKeepHistory) {
            settingsItem.amb_sf_chatgpt__LengthOfDaysToKeepHistory__c = this.lengthOfDaysToKeepHistory;
        }

        settingsItemJSON = JSON.stringify(settingsItem);

        updateSettings({ settingsItemJSON: settingsItemJSON })
            .then(result => {
                const event = new ShowToastEvent({
                    title: 'Success!',
                    variant: 'success',
                    message: 'The settings are successfully updated'
                });
                this.dispatchEvent(event);
                this.changeSpinnerState(false);
                this.close('success');
            })
            .catch(error => {
                console.log(error);
                const event = new ShowToastEvent({
                    title: 'Error!',
                    variant: 'error',
                    message: 'Something went wrong!'
                });
                this.dispatchEvent(event);
            })
    }

}