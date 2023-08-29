public with sharing class Constants {
    public static final String SETTINGS_ITEM_CHAT_INFO_QUERY = 'SELECT Id, ChatHistory__c, DateToDeleteChatHistory__c, LengthOfDaysToKeepHistory__c FROM OpenAISettings__c';
    public static final String SCHEDULE_TIME_BATCH = '0 00 00 * * ?';
    public static final String DELETE_CHAT_HISTORY_BATCH_JOB_NAME = 'ChatGPT Delete Chat History Batch Job';
    public static final String DELETE_CHAT_HISTORY_BATCH_JOB_TEST_NAME = 'ChatGPT Delete Chat History Batch Job from test';
    public static final String API_KEY_NAME = 'OpenAI API Key';
}