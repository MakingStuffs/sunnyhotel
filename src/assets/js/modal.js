'use strict';
import 'babel-polyfill';
import {
    msQuery
} from 'making-stuffs-queries';

const contactButton = msQuery('#contactButton');
const closeButton = msQuery('#close');
const form = msQuery('form');

function modalToggle() {
    const modal = msQuery('.modal');
    const main = msQuery('main');
    if (this === contactButton) {
        main.classList.add('sleep');
        modal.classList.add('active');
    } else {
        modal.classList.remove('active');
        main.classList.remove('sleep');
    }
}

/* 
    Field validation function
    1. regex for names and subject allowing letters, hyphens and spaces
    3. regex for email following as close to email structure as possible
    4. regex for textarea allowing normal grammatical characters
    5. skip submit button
    6. account for textarea elem
    7. reset regex on each iteratin of loop
    8. check if field is empty 
    9. Check field against regex if it isn't empty
    10. push errors to error array
    11. if there are errors return the array
    12. else return true (as in passed validation)
*/
const validateFields = async (fieldset) => {

    const textRegex = /^[a-zA-Z]+(([ -][a-zA-Z ])?[a-zA-Z]*)*$/;
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const textareaRegex = /[{}<>]+/g;
    const fields = fieldset.children;
    let errors = [];

    for (let field of fields) {

        textRegex.lastIndex = 0;
        emailRegex.lastIndex = 0;
        textareaRegex.lastIndex = 0;

        if (field.type === 'submit') continue;

        if (!field.value) {
            errors.push({
                field: field.name,
                error: 'empty'
            });
            continue;
        }

        if (field.type === 'text' && !textRegex.test(field.value)) {
            errors.push({
                field: field.name,
                error: 'illegal character'
            });
            continue;
        } else

        if (field.type === 'email' && !emailRegex.test(field.value)) {
            errors.push({
                field: field.name,
                error: 'illegal character'
            });
        } else

        if (field.tagName === 'TEXTAREA' && textareaRegex.test(field.value)) {
            errors.push({
                field: field.name,
                error: 'illegal character'
            });
            continue;
        }

    }

    return errors[0] ? errors : true;
}

/*
    Error handler
    1. take an object of errors
    2. find each error's corresponding element 
    3. Highlight it in red
    4. construct a message
    5. append the message to the contact form
    6. enable the contact form
*/
const errorHandler = async (errors) => {
    const outputHead = msQuery('h3', msQuery('.outcome-head'));
    const outputContent = msQuery('.outcome-content');
    const outputClose = msQuery('.outcome-footer');
    const output = msQuery('.outcome');
    const blackout = msQuery('.blackout');
    const fields = msQuery('fieldset');
    const loader = msQuery('.loader');

    loader.classList.remove('alive');
    fields.disabled = true;
    blackout.classList.remove('kill');
    output.style = 'transform: translate(-50%, -50%);';
    outputHead.style = 'background-color: #CA3C25;';
    outputHead.textContent = 'There\'s been an error';
    outputContent.innerHTML = '<p>The following elements have issues with their input: </p>';

    for (let field of errors) {

        if (field.field !== 'submit') {
            let elem = msQuery(`[name="${field.field}"]`);
            elem.style.boxShadow = '0 0 0 0.2rem red';
        }

        outputContent.innerHTML += `<p>${field.field}: <strong>${field.error}</strong></p>`;
    }

    const closeOutcome = () => {
        const loader = msQuery('.loader');
        fields.disabled = false;
        output.style = 'transform: translate(-50%, -200%);';
        loader.classList.remove('alive');
        blackout.classList.add('kill');
        outputClose.removeEventListener('click', closeOutcome);
    }

    outputClose.addEventListener('click', closeOutcome);
}

const successHandler = () => {

}

const submitHandler = async (e) => {
    e.preventDefault();
    const loader = msQuery('.loader');
    const blackout = msQuery('.blackout');
    const fields = msQuery('fieldset');
    const modalContent = msQuery('.modal-content');
    const validation = await validateFields(fields);

    modalContent.style.overflowY = 'hidden';
    if (validation !== true) {
        return errorHandler(validation)
    };

    loader.classList.add('alive');
    blackout.classList.remove('kill');

    try {
        const reply = await fetch('http://localhost:8080/send-mail', {
            method: 'POST',
            body: new FormData(form)
        });
        const data = await reply.json();
    } catch (err) {
        return errorHandler([{
            field: 'submit',
            error: 'Server error'
        }])
    }
}

form.addEventListener('submit', e => submitHandler(e))
closeButton.addEventListener('click', modalToggle);
contactButton.addEventListener('click', modalToggle);