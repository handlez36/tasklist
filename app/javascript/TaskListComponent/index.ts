import { Component } from '@angular/core';
import template from "./template.html";

@Component({
    selector: 'task-list',
    template: template
})
export class TaskListComponent {
    constructor() {
        console.log("TaskListComponent#constructor");
    }
}