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

global with sharing class PostInstallScripts implements InstallHandler {

    private static final String SCHEDULE_TIME = '0 00 00 * * ?'; 
    
    global void onInstall(InstallContext context) {
        String jobName = 'ChatGPT Delete Chat History Batch Job';

        if (Test.isRunningTest()) {
            jobName += ' from test';
        }

        if (context.previousVersion() == null) {
            OpenAIKey__c custtomSettings = new OpenAIKey__c(Name = 'OpenAI API Key');
            insert custtomSettings;

            DeleteChatHistorySchedule schedule = new DeleteChatHistorySchedule();
            System.schedule(jobName, SCHEDULE_TIME, schedule);
        } else if (context.isUpgrade()) {
            List<CronTrigger> jobs = [SELECT Id FROM CronTrigger WHERE CronJobDetail.Name =: jobName];
            if (jobs.size() == 0) {
                DeleteChatHistorySchedule schedule = new DeleteChatHistorySchedule();
                System.schedule(jobName, SCHEDULE_TIME, schedule);
            }

            if (OpenAIKey__c.getInstance('OpenAI API Key') == null) {
                OpenAIKey__c custtomSettings = new OpenAIKey__c(Name = 'OpenAI API Key');
                insert custtomSettings;
            }
        }
    }

}