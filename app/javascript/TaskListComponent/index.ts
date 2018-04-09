import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import template from "./template.html";
import 'rxjs/add/operator/map';

@Component({
    selector: 'task-list',
    template: template
})
export class TaskListComponent implements OnInit {
    private baseUrl:string      = "";
    private categories:object   = null;

    constructor(private http: Http) {
        console.log("TaskListComponent#constructor");
        this.baseUrl = "/categories.json"
    }

    ngOnInit() {
        this.http.get(this.baseUrl)
            .map(response => response.json())
            .subscribe( response => this.categories = response["categories"] )
    }
}