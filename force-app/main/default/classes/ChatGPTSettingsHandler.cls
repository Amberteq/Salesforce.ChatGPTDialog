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

public with sharing class ChatGPTSettingsHandler {
    
    /**
     * This method retrieves the settings from the OpenAISettings__c object
     * and returns it as an OpenAISettings__c object. 
     * If no settings are found, it creates a default settings object and inserts it.
     * @param userId String with user Id
     * @return OpenAISettings__c record
     */
    @AuraEnabled 
    public static OpenAISettings__c getSettings(String userId){
        try {
            List<OpenAISettings__c> settings = new List<OpenAISettings__c>();

            settings = [
                SELECT Id, Name, BaseURL__c, Model__c, Temperature__c, MaxTokenSize__c, LengthOfDaysToKeepHistory__c
                FROM OpenAISettings__c 
                WHERE OwnerId = :userId
            ];

            if (settings.isEmpty()) {
                settings.add(new OpenAISettings__c(
                    Name = 'Settings', 
                    BaseURL__c = '/v1/chat/completions', 
                    Model__c = 'gpt-4',
                    MaxTokenSize__c = 1000,
                    Temperature__c = 0,
                    LengthOfDaysToKeepHistory__c = 3
                ));
                insert settings;
            }
            return settings[0];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * This method takes a JSON string as a parameter and
     * deserializes it into an OpenAISettings__c object. 
     * It then updates the object with the new values.
     * @param settingsItemJSON String with JSON OpenAiSettings__c record
     */
    @AuraEnabled
    public static void updateSettings(String settingsItemJSON){
        try {
            OpenAISettings__c settingsItem = (OpenAISettings__c) JSON.deserialize(settingsItemJSON, OpenAISettings__c.class);
            update settingsItem;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}