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
public with sharing class ChatGPTHandlerTest {

    @TestSetup
    static void makeData(){
        OpenAISettings__c settingsItem = new OpenAISettings__c(Name = 'Test Settings', BaseURL__c = '/v1/chat/completions', Model__c = 'gpt-4');
        insert settingsItem;
    }

    @isTest
    public static void testGetHistoryChat() {
        OpenAISettings__c settingsItem = [SELECT Id, ChatHistory__c FROM OpenAISettings__c LIMIT 1];
        String chatHistory = '';
        Id userId = UserInfo.getUserId();

        settingsItem.ChatHistory__c = 'Test Text';
        update settingsItem;

        chatHistory = ChatGPTHandler.getChatHistory(userId);

        System.assertEquals(settingsItem.ChatHistory__c, chatHistory, 'Chat histories are not the same');
    }

    @isTest
    static void testGetHistoryChatWithEmptyChatHistoryField() {
        String chatHistory = '';
        Id userId = UserInfo.getUserId();

        chatHistory = ChatGPTHandler.getChatHistory(userId);

        System.assert(chatHistory == '', 'Chat History is not empty');
    }

    @isTest
    static void testClearHistory() {
        OpenAISettings__c settingsItem = [SELECT Id, ChatHistory__c FROM OpenAISettings__c LIMIT 1];
        String returnStatus = '';
        Id userId = UserInfo.getUserId();

        settingsItem.ChatHistory__c = 'Test Text';
        update settingsItem;

        returnStatus = ChatGPTHandler.clearHistory(userId);

        System.assert(returnStatus == 'success', 'Return status is not success');
    }

    @isTest
    static void testGetQueryData() {
        Id userId = UserInfo.getUserId();
        Map<String, String> messageItem = new Map<String,String>();
        String response = '';

        messageItem.put('message', 'say Hello!');

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        response = ChatGPTHandler.getQueryData(messageItem, 5, userId);
        Test.stopTest();

        Map<String, String> parsedResponseMap = (Map<String,String>) JSON.deserialize(response, Map<String,String>.class);

        System.assertEquals('test', parsedResponseMap.get('message'), 'Messages are not equal');
    }

    @isTest
    static void testGetQueryDataWithoutSettings() {
        Id userId = UserInfo.getUserId();
        Map<String, String> messageItem = new Map<String,String>();
        String response = '';
        delete [SELECT Id FROM OpenAISettings__c];
        messageItem.put('message', 'say Hello!');

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        response = ChatGPTHandler.getQueryData(messageItem, 5, userId);
        Test.stopTest();

        Map<String, String> parsedResponseMap = (Map<String,String>) JSON.deserialize(response, Map<String,String>.class);

        System.assertEquals('test', parsedResponseMap.get('message'), 'MEssages are not equal');
    }
}