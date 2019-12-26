'use strict';
import {
    msQuery
} from 'making-stuffs-queries';

const contactButton = msQuery('#contactButton');

function modalToggle() {
    const modal = msQuery('.modal');
    modal.classList.add('active');
}

contactButton.addEventListener(click, modalToggle);