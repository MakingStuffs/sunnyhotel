'use strict';
import 'babel-polyfill';
import {
    msQuery,
    msQueryAll
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
*/
const validateFields = async (fieldset) => {
    const textRegex = /^[a-zA-Z]+(([ -][a-zA-Z ])?[a-zA-Z]*)*$/;
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const textareaRegex = /^[a-zA-Z0-9]+(([',. -";:()€£$\$\!\?\/][a-zA-Z 0-9])?[a-zA-Z0-9]*)*$/;
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
            console.log(textRegex.test(field.value));
            errors.push({
                field: field.name,
                error: 'illegal character'
            });
            continue;
        } else if (field.type === 'email' && !emailRegex.test(field.value)) {
            errors.push({
                field: field.name,
                error: 'illegal character'
            });
        } else if (field.tagName === 'TEXTAREA' && !textareaRegex.test(field.value)) {
            errors.push({
                field: field.name,
                error: 'illegal character'
            });
            continue;
        }
    }
    return errors ? errors : 'passed';
}

const submitHandler = async (e) => {
    e.preventDefault();
    const loader = msQuery('.loader');
    const fields = msQuery('fieldset');
    const modalContent = msQuery('.modal-content');
    const validation = await validateFields(fields);
    console.log(validation);
    modalContent.style.overflow = 'hidden';
    loader.classList.add('alive');
    //fields.disabled = true;
    try {
        const reply = await fetch('http://localhost:8080/send-mail', {
            method: 'POST',
            body: new FormData(form)
        });
        const data = await reply.json();
    } catch (err) {
        loader.classList.remove('alive');
        console.log(err);
    }
}

form.addEventListener('submit', e => submitHandler(e))
closeButton.addEventListener('click', modalToggle);
contactButton.addEventListener('click', modalToggle);