/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
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

import { Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Polyline } from './polyline';
import { RaphaelBase } from './raphael-base';
import { RaphaelService } from './raphael.service';

declare let Raphael: any;

/**
 * Directive selectors without adf- prefix will be deprecated on 3.0.0
 */
@Directive({selector: 'adf-raphael-flow-arrow, raphael-flow-arrow'})
export class RaphaelFlowArrowDirective extends RaphaelBase implements OnInit {
    @Input()
    paper: any;

    @Input()
    flow: any;

    @Output()
    error = new EventEmitter();

    ARROW_WIDTH = 4;
    SEQUENCE_FLOW_STROKE = 1.5;

    constructor(public elementRef: ElementRef,
                raphaelService: RaphaelService) {
        super(elementRef, raphaelService);
    }

    ngOnInit() {

        this.draw(this.flow);
    }

    public draw(flow: any) {
        let line = this.drawLine(flow);
        this.drawArrow(line);
    }

    public drawLine(flow: any) {
        let polyline = new Polyline(flow.id, flow.waypoints, this.SEQUENCE_FLOW_STROKE, this.paper);
        polyline.element = this.paper.path(polyline.path);
        polyline.element.attr({'stroke-width': this.SEQUENCE_FLOW_STROKE});
        polyline.element.attr({'stroke': '#585858'});

        polyline.element.node.id = this.flow.id;

        let lastLineIndex = polyline.getLinesCount() - 1;
        let line = polyline.getLine(lastLineIndex);
        return line;
    }

    public drawArrow(line: any) {
        let doubleArrowWidth = 2 * this.ARROW_WIDTH;
        let width = this.ARROW_WIDTH / 2 + .5;
        let arrowHead: any = this.paper.path('M0 0L-' + width + '-' + doubleArrowWidth + 'L' + width + ' -' + doubleArrowWidth + 'z');

        arrowHead.transform('t' + line.x2 + ',' + line.y2);
        let angle = Raphael.deg(line.angle - Math.PI / 2);
        arrowHead.transform('...r' + angle + ' 0 0');

        arrowHead.attr('fill', '#585858');

        arrowHead.attr('stroke-width', this.SEQUENCE_FLOW_STROKE);
        arrowHead.attr('stroke', '#585858');

    }
}
