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

import { Component, Input } from '@angular/core';
import { DataColumn } from '@alfresco/adf-core';

@Component({
    selector: 'adf-search-header',
    templateUrl: './search-header.component.html'
})
export class SearchHeaderComponent {

    @Input()
    col: DataColumn;

    @Output()
    update: EventEmitter<NodePaging> = new EventEmitter();

    category: any = {};

    constructor(private searchHeaderQueryBuilder: SearchHeaderQueryBuilderService) { }

    ngOnInit() {
       this.category = this.searchHeaderQueryBuilder.getCategoryForColumn(this.col.key);

       this.searchHeaderQueryBuilder.executed.subscribe((newNodePaging: NodePaging) => {
            this.update.emit(newNodePaging);
        });

    //    this.searchHeaderQueryBuilder.updated.subscribe((query) => {
    //         console.log(query);
    //     });
    }

    onMenuButtonClick(event: Event) {
        event.stopPropagation();
    }

    onApplyButtonClick() {
        this.searchHeaderQueryBuilder.execute();
    }
}
