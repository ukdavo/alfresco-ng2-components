/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    ApiService,
    AppListCloudPage,
    LocalStorageUtil,
    LoginPage,
    ProcessDefinitionsService,
    ProcessInstancesService,
    QueryService,
    TaskFormCloudComponent,
    TaskHeaderCloudPage
} from '@alfresco/adf-testing';
import { browser, protractor } from 'protractor';
import { ProcessCloudDemoPage } from './pages/process-cloud-demo.page';
import { ProcessDetailsCloudDemoPage } from './pages/process-details-cloud-demo.page';
import { TasksCloudDemoPage } from './pages/tasks-cloud-demo.page';
import { NavigationBarPage } from '../core/pages/navigation-bar.page';
import { EditProcessFilterConfiguration } from './config/edit-process-filter.config';
import { ProcessListCloudConfiguration } from './config/process-list-cloud.config';
import {
    ProcessDefinitionCloud,
    ProcessInstanceCloud,
    StartTaskCloudResponseModel
} from '@alfresco/adf-process-services-cloud';

describe('Process filters cloud', () => {

    const loginSSOPage = new LoginPage();
    const navigationBarPage = new NavigationBarPage();
    const appListCloudComponent = new AppListCloudPage();
    const processCloudDemoPage = new ProcessCloudDemoPage();
    const tasksCloudDemoPage = new TasksCloudDemoPage();
    const processDetailsCloudDemoPage = new ProcessDetailsCloudDemoPage();
    const taskHeaderCloudPage = new TaskHeaderCloudPage();
    const taskFormCloudComponent = new TaskFormCloudComponent();

    const apiService = new ApiService();
    const processDefinitionService = new ProcessDefinitionsService(apiService);
    const processInstancesService = new ProcessInstancesService(apiService);
    const queryService = new QueryService(apiService);

    const processListCloudConfigFile = new ProcessListCloudConfiguration().getConfiguration();
    const editProcessFilterConfigFile = new EditProcessFilterConfiguration().getConfiguration();

    let simpleProcessDefinition: ProcessDefinitionCloud;
    let processInstance: ProcessInstanceCloud;
    let taskAssigned: StartTaskCloudResponseModel[];
    let taskName: string;
    const simpleApp = browser.params.resources.ACTIVITI_CLOUD_APPS.SIMPLE_APP.name;

    beforeAll(async () => {
        await apiService.login(browser.params.testConfig.hrUser.email, browser.params.testConfig.hrUser.password);

        simpleProcessDefinition = (await processDefinitionService
            .getProcessDefinitionByName(browser.params.resources.ACTIVITI_CLOUD_APPS.SIMPLE_APP.processes.processstring, simpleApp)).entry;
        processInstance = (await processInstancesService.createProcessInstance(simpleProcessDefinition.key, simpleApp)).entry;
        taskAssigned = (await queryService.getProcessInstanceTasks(processInstance.id, simpleApp)).list.entries;
        taskName = browser.params.resources.ACTIVITI_CLOUD_APPS.SIMPLE_APP.tasks.processstring;

        await loginSSOPage.login(browser.params.testConfig.hrUser.email, browser.params.testConfig.hrUser.password);
        await LocalStorageUtil.setConfigField('adf-edit-process-filter', JSON.stringify(editProcessFilterConfigFile));
        await LocalStorageUtil.setConfigField('adf-cloud-process-list', JSON.stringify(processListCloudConfigFile));
    });

    beforeEach(async () => {
        await navigationBarPage.navigateToProcessServicesCloudPage();
        await appListCloudComponent.checkApsContainer();
        await appListCloudComponent.goToApp(simpleApp);
        await tasksCloudDemoPage.taskListCloudComponent().checkTaskListIsLoaded();
        await processCloudDemoPage.processFilterCloudComponent.clickOnProcessFilters();
    });

    it('[C290040] Should be able to open the Task Details page by clicking on the process name', async () => {
        await processCloudDemoPage.editProcessFilterCloudComponent().openFilter();
        await processCloudDemoPage.editProcessFilterCloudComponent().setAppNameDropDown(simpleApp);
        await processCloudDemoPage.editProcessFilterCloudComponent().setStatusFilterDropDown('RUNNING');
        await processCloudDemoPage.editProcessFilterCloudComponent().setProperty('processInstanceId', processInstance.id);

        await processCloudDemoPage.processListCloudComponent().getDataTable().selectRow('Id', processInstance.id);
        await browser.actions().sendKeys(protractor.Key.ENTER).perform();

        await processDetailsCloudDemoPage.checkTaskIsDisplayed(taskName);
        await browser.navigate().back();

        await tasksCloudDemoPage.taskFilterCloudComponent.clickOnTaskFilters();
        await tasksCloudDemoPage.editTaskFilterCloudComponent().openFilter();
        await tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(taskAssigned[0].entry.name);
        await tasksCloudDemoPage.taskListCloudComponent().selectRow(taskAssigned[0].entry.name);
        await taskHeaderCloudPage.checkTaskPropertyListIsDisplayed();
        await expect(await taskFormCloudComponent.getFormTitle()).toContain(taskName);
        await taskFormCloudComponent.clickCompleteButton();
    });
});
