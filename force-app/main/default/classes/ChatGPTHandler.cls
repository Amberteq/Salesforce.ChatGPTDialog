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

public with sharing class ChatGPTHandler {

    private static final String API_KEY = OpenAIKey__c.getInstance(Constants.API_KEY_NAME).Key__c;

    /**
     * Return a String, which contains chat history.
     * If Record with chat history does not exist, return empty string
     * @param userId String with user Id
     * @return String 
     */
    @AuraEnabled
    public static String getChatHistory(String userId) {
        try {
            if (API_KEY == null) {
                throw new AuraHandledException('Key__c is null');
            }

            List<OpenAISettings__c> settings = [SELECT Id, ChatHistory__c FROM OpenAISettings__c WHERE OwnerId =: userId WITH SECURITY_ENFORCED];

            if (settings.size() > 0) {
                if (settings[0].ChatHistory__c != null) {
                    return settings[0].ChatHistory__c.unescapeHtml4();
                } 
            }

            return '';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    /**
     * Return response from OpenAI API
     * @param messageItem Map<String, String> with role key and message value
     * @param browserItemHours Integer with value of hours in browser, which called this methods
     * @param userId String with user Id
     * @return String with response from OpenAI API
     */
    @AuraEnabled
    public static String getQueryData(Map<String, String> messageItem, Integer browserItemHours, String userId) {
        System.debug(messageItem);
        try {
            String message = messageItem.get('message');
            System.debug(message);
            OpenAISettings__c settingsItem = getSettingsItem(userId);
            List<Map<String, String>> messagesList = new List<Map<String, String>>();
            String responseMessage = '';
            Integer hoursDifference = browserItemHours - Datetime.now().hourGMT();

            messagesList.add(messageItem);

            Http http = new Http();

            String requestBody = fetchRequestBody(message.normalizeSpace().replace('"', '\''), settingsItem);
            System.debug(requestBody);

            HttpRequest request = new HttpRequest();

            request.setEndpoint('https://api.openai.com' + settingsItem.BaseURL__c);
            request.setMethod('POST');
            request.setHeader('Content-Type', 'application/json');
            request.setHeader('Authorization', 'Bearer ' + API_KEY);
            request.setTimeout(120000);
            request.setBody(requestBody);

            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                JSONParser parser = JSON.createParser(response.getBody());
                while (parser.nextToken() != null) {
                    if (parser.getCurrentName() == 'text' || parser.getCurrentName() == 'content') {
                        parser.nextToken();
                        responseMessage = checkLineBreak(parser.getText());
                        break;
                    }
                }

                messageItem = new Map<String,String>();
                messageItem.put('message', responseMessage);
                messageItem.put('time', String.valueOfGmt(Datetime.now().addHours(hoursDifference)));
                messagesList.add(messageItem);

                if (settingsItem.Id == null) {
                    insert settingsItem;
                }

                updateChatHistory(messagesList, userId);
            } else if(response.getStatusCode() != 200) {
                System.debug('The status code returned was not expected: ' + response.getStatusCode() + ' ' + response.getBody());
                throw new AuraHandledException(response.getBody());
            }

            return JSON.serialize(messageItem);
        } catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

    /**
     * Clear chat history in record
     * @param userId String with user Id
     * @return String with success state of operation
     */
    @AuraEnabled
    public static String clearHistory(String userId) {
        try {
            OpenAISettings__c settingsItem = [
                SELECT 
                    Id, ChatHistory__c 
                FROM 
                    OpenAISettings__c 
                WHERE 
                    OwnerId =: userId
            ][0];

            if (settingsItem.ChatHistory__c != '') {
                settingsItem.ChatHistory__c = '';
                update settingsItem;
            }

            return 'success';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * Update chat history in record
     * @param chatHistoryList List<Map<String, String>> List wiht Map<String, String> with role key and message value
     * @param userId String with user Id
     * @return void
     */
    private static void updateChatHistory(List<Map<String, String>> chatHistoryList, String userId) {
        OpenAISettings__c settingsItem = [SELECT Id, ChatHistory__c FROM OpenAISettings__c WHERE OwnerId =: userId][0];

        if (settingsItem.ChatHistory__c == null) {
            List<Map<String, String>> chatHistory = new List<Map<String, String>>();
            chatHistory.addAll(chatHistoryList);
            settingsItem.ChatHistory__c = JSON.serialize(chatHistory);
        } else {
            List<Map<String, String>> parsedChatHistory = (List<Map<String, String>>) JSON.deserialize(settingsItem.ChatHistory__c.unescapeHtml4(), List<Map<String, String>>.class);
            System.debug(parsedChatHistory);
            parsedChatHistory.addAll(chatHistoryList);
            settingsItem.ChatHistory__c = JSON.serialize(parsedChatHistory);
        }

        update settingsItem;
    }

    /**
     * Fetch the request body for the OpenAI API
     * @param message String with message
     * @param settingsItem OpenAISettings__c object
     * @return String fetched request body
     */
    private static String fetchRequestBody(String message, OpenAISettings__c settingsItem) {
        String requestBody = '{' +
        '"model": "' + settingsItem.Model__c + '", ' +
        createMessageStringToRequestBody(message, settingsItem.BaseURL__c) + 
        '"max_tokens": ' + settingsItem.MaxTokenSize__c + ', ' + 
        '"temperature": ' + settingsItem.Temperature__c + 
        '}';

        return requestBody;
    }

    /**
     * Create a message string for the request body. 
     * @param message String with message
     * @param baseUrl String with url of request endpoint
     * @return String with message part of request
     */
    private static String createMessageStringToRequestBody(String message, String baseUrl) {
        String messageString = '';

        if (baseUrl == '/v1/completions') {
            messageString = '"prompt": "' + message.trim() + '", ';
        } else if (baseUrl == '/v1/chat/completions') {
            messageString = '"messages": [{"role": "system", "content": "You are a helpful assistant."}, ' + 
                    '{"role": "user", "content": "' + message + '"}], ';
        }

        return messageString;
    }

    /**
     * Return the OpenAISettings__c record for a user.
     * @param userId String with user Id
     * @return OpenAISettings__c record
     */
    private static OpenAISettings__c getSettingsItem(String userId) {
        List<OpenAISettings__c> settings = [
            SELECT Id, Name, BaseURL__c, Model__c, MaxTokenSize__c, Temperature__c
            FROM OpenAISettings__c 
            WHERE OwnerId =: userId
            WITH SECURITY_ENFORCED
        ];

        if (settings.size() > 0) {
            return settings[0];
        } else {
            return createSettingsItem();
        }
    }

    /**
     * Create a OpenAISettings__c record
     * @return OpenAISettings__c record
     */
    private static OpenAISettings__c createSettingsItem() {
        OpenAISettings__c settingsItem = new OpenAISettings__c(
            Name = 'Settings', 
            BaseURL__c = '/v1/chat/completions', 
            Model__c = 'gpt-4',
            MaxTokenSize__c = 1000,
            Temperature__c = 0
        );
        return settingsItem;
    }

    /**
     * Remove line breaks in a message if they exist
     * @param message String whith message
     * @return String with message
     */
    public static String checkLineBreak(String message) {
        if (message.startsWith('\n')) {
            return checkLineBreak(message.substringAfter('\n'));
        } else {
            return message;
        }
    }
}




  