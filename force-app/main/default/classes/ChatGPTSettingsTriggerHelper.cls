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

public with sharing class ChatGPTSettingsTriggerHelper {
    
    /**
     * Method to set the DateToDeleteChatHistory__c field to the current date plus the value of the LengthOfDaysToKeepHistory__c field
     * @param settings A list of OpenAISettings__c records
     */
    public static void onInsertHandler(List<OpenAISettings__c> settings) {
        for (OpenAISettings__c item : settings) {
            item.DateToDeleteChatHistory__c = Date.today() + (Integer) item.LengthOfDaysToKeepHistory__c;
        }
    }
    
    /**
     * Method to set the DateToDeleteChatHistory__c field to the current date plus the value of the LengthOfDaysToKeepHistory__c field
     * @param newSettingsList A list of OpenAISettings__c records
     * @param idToOldSettingsMap A map of OpenAISettings__c records
     */
    public static void onUpdateHandler(List<OpenAISettings__c> newSettingsList, Map<Id, OpenAISettings__c> idToOldSettingsMap) {
        for (OpenAISettings__c item : newSettingsList) {
            if (item.LengthOfDaysToKeepHistory__c != idToOldSettingsMap.get(item.Id).LengthOfDaysToKeepHistory__c) {
                item.DateToDeleteChatHistory__c = Date.today() + (Integer) item.LengthOfDaysToKeepHistory__c;
            }
        }
    }

}