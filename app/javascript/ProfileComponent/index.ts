import { Component } from '@angular/core';

@Component({
    selector: 'user-profile',
    template: 'template.html'
})
export class ProfileComponent {
    constructor() {
        console.log("ProfileComponent#constructor");
    }
}