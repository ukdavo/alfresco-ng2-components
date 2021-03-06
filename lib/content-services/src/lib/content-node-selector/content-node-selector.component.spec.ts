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

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentNodeSelectorComponent } from './content-node-selector.component';
import { Node } from '@alfresco/js-api';
import { ContentNodeSelectorPanelComponent } from '@alfresco/adf-content-services';
import { By } from '@angular/platform-browser';
import { setupTestBed, SitesService } from '@alfresco/adf-core';
import { of } from 'rxjs';
import { ContentTestingModule } from '../testing/content.testing.module';
import { DocumentListService } from '../document-list/services/document-list.service';
import { DocumentListComponent } from '../document-list/components/document-list.component';
import { ShareDataRow } from '../document-list';
import { TranslateModule } from '@ngx-translate/core';

describe('ContentNodeSelectorDialogComponent', () => {

    let component: ContentNodeSelectorComponent;
    let fixture: ComponentFixture<ContentNodeSelectorComponent>;
    const data: any = {
        title: 'Choose along citizen...',
        actionName: 'choose',
        select: new EventEmitter<Node>(),
        rowFilter: (shareDataRow: ShareDataRow) => shareDataRow.node.entry.name === 'impossible-name',
        imageResolver: () => 'piccolo',
        currentFolderId: 'cat-girl-nuku-nuku',
        showLocalUploadButton: true
    };

    setupTestBed({
        imports: [
            TranslateModule.forRoot(),
            ContentTestingModule
        ],
        providers: [
            { provide: MAT_DIALOG_DATA, useValue: data }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    beforeEach(() => {
        const documentListService: DocumentListService = TestBed.inject(DocumentListService);
        const sitesService: SitesService = TestBed.inject(SitesService);
        spyOn(documentListService, 'getFolder').and.returnValue(of({ list: [] }));
        spyOn(documentListService, 'getFolderNode').and.returnValue(of({ entry: {} }));
        spyOn(sitesService, 'getSites').and.returnValue(of({ list: { entries: [] } }));

        fixture = TestBed.createComponent(ContentNodeSelectorComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('Data injecting with the "Material dialog way"', () => {

        it('should show the INJECTED title', () => {
            const titleElement = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-title"]'));
            expect(titleElement).not.toBeNull();
            expect(titleElement.nativeElement.innerText).toBe('Choose along citizen...');
        });

        it('should have the INJECTED actionName on the name of the choose button', () => {
            const actionButton = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-choose"]'));
            expect(component.buttonActionName).toBe('NODE_SELECTOR.CHOOSE');
            expect(actionButton).not.toBeNull();
            expect(actionButton.nativeElement.innerText).toBe('NODE_SELECTOR.CHOOSE');
        });

        it('should pass through the injected currentFolderId to the documentList', () => {
            const documentList = fixture.debugElement.query(By.directive(DocumentListComponent));
            expect(documentList).not.toBeNull('Document list should be shown');
            expect(documentList.componentInstance.currentFolderId).toBe('cat-girl-nuku-nuku');
        });

        it('should pass through the injected rowFilter to the documentList', () => {
            const documentList = fixture.debugElement.query(By.directive(DocumentListComponent));
            expect(documentList).not.toBeNull('Document list should be shown');
            expect(documentList.componentInstance.rowFilter({
                node: {
                    entry: new Node({
                        name: 'impossible-name',
                        id: 'name'
                    })
                }
            }))
                .toBe(data.rowFilter(<ShareDataRow> {
                    node: {
                        entry: new Node({
                            name: 'impossible-name',
                            id: 'name'
                        })
                    }
                }));
        });

        it('should pass through the injected imageResolver to the documentList', () => {
            const documentList = fixture.debugElement.query(By.directive(DocumentListComponent));
            expect(documentList).not.toBeNull('Document list should be shown');
            expect(documentList.componentInstance.imageResolver).toBe(data.imageResolver);
        });
   });

    describe('Cancel button', () => {

        it('should complete the data stream when user click "CANCEL"', () => {
            let cancelButton;
            data.select.subscribe(
                () => {
                },
                () => {
                },
                () => {
                    cancelButton = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-cancel"]'));
                    expect(cancelButton).not.toBeNull();
                });

            cancelButton = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-cancel"]'));
            cancelButton.triggerEventHandler('click', {});
        });

        it('should not be shown if dialogRef is NOT injected', () => {
            const closeButton = fixture.debugElement.query(By.css('[content-node-selector-actions-cancel]'));
            expect(closeButton).toBeNull();
        });
    });

    describe('Action button for the chosen node', () => {

        it('should be disabled by default', () => {
            fixture.detectChanges();

            const actionButton = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-choose"]'));
            expect(actionButton.nativeElement.disabled).toBeTruthy();
        });

        it('should be enabled when a node is chosen', () => {
            component.onSelect([new Node({ id: 'fake' })]);
            fixture.detectChanges();

            const actionButton = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-choose"]'));
            expect(actionButton.nativeElement.disabled).toBeFalsy();
        });

        it('should be disabled when no node chosen', () => {
            component.onSelect([new Node({ id: 'fake' })]);
            fixture.detectChanges();

            const actionButtonWithNodeSelected = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-choose"]'));

            expect(actionButtonWithNodeSelected.nativeElement.disabled).toBe(false);

            component.onSelect([]);
            fixture.detectChanges();

            const actionButtonWithoutNodeSelected = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-choose"]'));

            expect(actionButtonWithoutNodeSelected.nativeElement.disabled).toBe(true);
        });
    });

    describe('Title', () => {

        it('should be updated when a site is chosen', () => {
            const fakeSiteTitle = 'My fake site';
            const contentNodePanel = fixture.debugElement.query(By.directive(ContentNodeSelectorPanelComponent));
            contentNodePanel.componentInstance.siteChange.emit(fakeSiteTitle);
            fixture.detectChanges();

            const titleElement = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-title"]'));
            expect(titleElement).not.toBeNull();
            expect(titleElement.nativeElement.innerText).toBe('NODE_SELECTOR.CHOOSE_ITEM');
       });
   });

    describe('Upload button', () => {

        it('should be able to show upload button if showLocalUploadButton set to true', () => {
            const adfUploadButton = fixture.debugElement.query(By.css('adf-upload-button'));

            expect(adfUploadButton).not.toBeNull();
            expect(adfUploadButton.nativeElement.innerText).toEqual('file_uploadFORM.FIELD.UPLOAD');
        });

        it('should not be able to show upload button if showLocalUploadButton set to false', () => {
            component.data.showLocalUploadButton = false;
            fixture.detectChanges();
            const adfUploadButton = fixture.debugElement.query(By.css('adf-upload-button span'));

            expect(adfUploadButton).toBeNull();
        });
    });
});
