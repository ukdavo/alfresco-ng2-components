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

import { MatDialog } from '@angular/material/dialog';
import { EventEmitter, Injectable, Output, Directive } from '@angular/core';
import { TranslationService } from '@alfresco/adf-core';
import { Subject, Observable } from 'rxjs';
import { AttachFileWidgetDialogComponentData } from './attach-file-widget-dialog-component.interface';
import { Node } from '@alfresco/js-api';
import { AttachFileWidgetDialogComponent } from './attach-file-widget-dialog.component';

@Directive()
@Injectable({
    providedIn: 'root'
})
// tslint:disable-next-line: directive-class-suffix
export class AttachFileWidgetDialogService {

    /** Emitted when an error occurs. */
    @Output()
    error: EventEmitter<any> = new EventEmitter<any>();

    constructor(private dialog: MatDialog,
                private translation: TranslationService) {
    }

    /**
     * Opens a dialog to choose a file to upload.
     * @param action Name of the action to show in the title
     * @param contentEntry Item to upload
     * @returns Information about the chosen file(s)
     */
    openLogin(ecmHost: string, actionName?: string, context?: string): Observable<Node[]> {
        const selected = new Subject<Node[]>();
        selected.subscribe({
            complete: this.close.bind(this)
        });

        const data: AttachFileWidgetDialogComponentData = {
            title : this.getLoginTitleTranslation(ecmHost),
            actionName,
            selected,
            ecmHost,
            context,
            isSelectionValid: (entry: Node) => entry.isFile,
            showFilesInResult: true
        };

        this.openLoginDialog(data, 'adf-attach-file-widget-dialog', '630px');
        return selected;
    }

    private openLoginDialog(data: AttachFileWidgetDialogComponentData, currentPanelClass: string, chosenWidth: string) {
        this.dialog.open(AttachFileWidgetDialogComponent, { data, panelClass: currentPanelClass, width: chosenWidth });
    }

    /** Closes the currently open dialog. */
    close() {
        this.dialog.closeAll();
    }

    private getLoginTitleTranslation(ecmHost: string): string {
        return this.translation.instant(`ATTACH-FILE.DIALOG.LOGIN`, { ecmHost });
    }
}
