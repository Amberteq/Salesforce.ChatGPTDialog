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

public class ChatGPTDeleteChatHistoryBatch implements Database.Batchable<SObject> {

    /**
     * Query all OpenAISettings__c records
     */
    public Database.QueryLocator start(Database.BatchableContext BC) {
        return Database.getQueryLocator(Constants.SETTINGS_ITEM_CHAT_INFO_QUERY);
    }

    /**
     *  Iterate through the list of OpenAISettings__c records and update the ChatHistory__c and DateToDeleteChatHistory__c fields
     */
    public void execute(Database.BatchableContext BC, List<OpenAISettings__c> scope) {

        List<OpenAISettings__c> settingsToUpdateList = new List<OpenAISettings__c>();

        if (checkFieldsOnUpdateable()) {
            for (OpenAISettings__c item : scope) {
                if ((item.DateToDeleteChatHistory__c < Date.today()) && (item.ChatHistory__c != '')) {
                    item.ChatHistory__c = '';
                    item.DateToDeleteChatHistory__c = Date.today() + (Integer) item.LengthOfDaysToKeepHistory__c;
                    settingsToUpdateList.add(item);
                }
            }
            update settingsToUpdateList;
        }
    }

    /**
     * Schedule the job if it does not already exist
     */
    public void finish(Database.BatchableContext BC) {
        String jobName = Constants.DELETE_CHAT_HISTORY_BATCH_JOB_NAME;
        List<CronTrigger> jobs = [SELECT Id FROM CronTrigger WHERE CronJobDetail.Name =: jobName];

        if (jobs.size() == 0) {
            DeleteChatHistorySchedule schedule = new DeleteChatHistorySchedule();
            System.schedule(jobName, Constants.SCHEDULE_TIME_BATCH, schedule);
        }
    }

    /**
     * Check if the fields are updateable
     * @return Boolean 
     */
    private Boolean checkFieldsOnUpdateable() {
        return Schema.sObjectType.amb_sf_chatgpt__OpenAISettings__c.fields.amb_sf_chatgpt__DateToDeleteChatHistory__c.isUpdateable() &&
            Schema.sObjectType.amb_sf_chatgpt__OpenAISettings__c.fields.amb_sf_chatgpt__ChatHistory__c.isUpdateable();
    }

}