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

@isTest
public with sharing class ChatGPTSettingsHandlerTest {
    
    @isTest
    public static void testGetSettings() {
        OpenAISettings__c settingsItem = new OpenAISettings__c(Name = 'Settings', BaseURL__c = '/v1/chat/completions', Model__c = 'gpt-4');    
        insert settingsItem;

        OpenAISettings__c recievedSettingsItem = ChatGPTSettingsHandler.getSettings(UserInfo.getUserId());

        System.assertEquals(settingsItem.Id, recievedSettingsItem.Id);
    }

    @isTest
    public static void testGetSettingsWithNoSettingsRecord() {
        OpenAISettings__c recievedSettingsItem = ChatGPTSettingsHandler.getSettings(UserInfo.getUserId());

        System.assert(recievedSettingsItem.Id != null || recievedSettingsItem.Id != '');
    }

    @isTest
    public static void testUpdateSettings() {
        OpenAISettings__c settingsItem = new OpenAISettings__c(Name = 'Settings', BaseURL__c = '/v1/completions', Model__c = 'text-davinci-003');
        insert settingsItem;

        settingsItem.Temperature__c = 1.0;
        ChatGPTSettingsHandler.updateSettings(JSON.serialize(settingsItem));

        settingsItem = [SELECT Id, Temperature__c FROM OpenAISettings__c LIMIT 1];
        System.assertEquals(1.0, settingsItem.Temperature__c);
    }

}