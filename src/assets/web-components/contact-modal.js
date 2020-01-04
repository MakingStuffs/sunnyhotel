import {
    msQuery,
    msCreate,
    msAppend
} from 'making-stuffs-queries';

class ContactModal extends HTMLElement {

    // Set HTML attributes to watch for a change in JS
    static get observedAttributes() {
        return ['open', 'loading'];
    }

    // Handle their change 
    attributeChangedCallback(attr, oldValue, newValue) {
        if (oldValue !== newValue) {
            // Change the JS attribute's value to match the HTML attribute
            return this[attr] = this.hasAttribute(attr);
        }
    }

    constructor() {
        super();

        // Bind 'this' to the close function a la react
        this.close = this.close.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.emitEvent = this.emitEvent.bind(this);
        this.responseHandler = this.responseHandler.bind(this);

        // Create elements to use within app
        this.loader = msCreate('span', {
            class: 'loader'
        });
        this.blackout = msCreate('span', {
            class: 'blackout'
        });
    }

    connectedCallback() {
        if (this.isConnected) {
            // Make a shadow DOM
            const shadow = this.attachShadow({
                mode: 'open'
            });

            // Assign template to this element
            const template = msQuery('#contact-template');
            const node = document.importNode(template.content, true);
            shadow.append(node);

            // Set variables to use within app
            this.form = msQuery('form', this.shadowRoot);
            this.fields = msQuery('fieldset', this.shadowRoot);
            this.content = msQuery('.modal-content', this.shadowRoot);
            this.closeBtn = msQuery('#close', this.shadowRoot);

            // Add event listeners
            this.form.addEventListener('submit', e => this.submitForm(e));
            this.closeBtn.addEventListener('click', this.close);
            this.addEventListener('contact-loaded', () => {
                this.loading = false;
            });

            // Open then modal
            this.open = this.open;
        }

    }

    disconnectedCallback() {
        // Remove event listeners to cleanup
        this.closeBtn.removeEventListener('click', this.close);
        this.form.removeEventListener('submit', this.submitForm);
        this.removeEventListener('contact-loaded', () => {
            this.loading = false;
        });
    }

    // Make a getter to check if the element has the HTML attribute 'open'
    get open() {
        return this.hasAttribute('open');
    }

    // Setter to change the HTML attribute if it is different to the custom elem in JS
    set open(isOpen) {
        this.shadowRoot.querySelector('.wrapper').classList.toggle('open', isOpen);
        this.shadowRoot.querySelector('.wrapper').setAttribute('aria-hidden', !isOpen);

        if (isOpen) {
            this._wasFocused = document.activeElement;
            this.setAttribute('open', '');
            this.addEventListener('keydown', this._watchEscape);
            this.focus();
        } else {
            this._wasFocused && this._wasFocused.focus && this._wasFocused.focus();
            this.removeAttribute('open');
            this.removeEventListener('keydown', this._watchEscape);
            this.close();
        }
    }

    get loading() {
        return this.hasAttribute('loading');
    }

    set loading(isLoading) {
        if (isLoading) {
            this.setAttribute('loading', '');
            this.addEventListener('response-ready', this.responseHandler);
            msAppend([this.loader, this.blackout], this.shadowRoot);
        } else {
            this.removeEventListener('response-ready', this.responseHandler);
            this.removeAttribute('loading');
            setTimeout(() => {
                this.loader.classList = 'loader';
                this.loader.remove();
                this.blackout.remove();
                this.fields.disabled = false;
            }, 1500);
        }
    }

    async submitForm(e) {
        e.preventDefault();

        // Setup recaptcha field
        grecaptcha.ready(function () {
            grecaptcha.execute('6LfxgcsUAAAAACq6d-R8izsfMbDymuSabaewqrAM', {
                action: 'submit'
            }).then(async function (token) {
                const reply = await fetch('http://localhost:5000/auth', {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        token: token
                    })
                });
                const data = await reply.json();
                if(!data.success) {
                    return alert('It seems that Google thinks you are a bot');
                }
            });
        });

        // Disable the form to stop double submission
        this.fields.disabled = true;

        if (!this.loading) {
            this.loading = true;
            const validated = await this.validateFields();
            if (validated === true) {
                this.sendForm();
            } else {
                ContactModal.prototype.response = validated;
                return setTimeout(() => this.emitEvent('response-ready'), 2000);
            }
        } else {
            return;
        }
    }

    async validateFields() {
        const fields = this.fields.children;
        let errors = [];
        for (let field of fields) {

            if (field.getAttribute('type') === 'submit') continue;

            const input = field.hasAttribute('fieldType') ? msQuery(field.getAttribute('fieldType'), field.shadowRoot) : msQuery('input', field.shadowRoot);
            const regex = new RegExp(field.getAttribute('regex'));

            if (field.hasAttribute('failed')) {
                continue;
            }

            if (!input.value) {
                errors.push({
                    field: field.getAttribute('name'),
                    error: 'Must be at least 3 characters'
                });
                continue;
            }

            if (!regex.test(input.value)) {
                errors.push({
                    field: field.getAttribute('name'),
                    error: 'Illegal character detected'
                });
                continue;
            }
        }

        return errors[0] ? errors : true;
    }

    async sendForm() {
        const postBody = {};
        try {
            for (let field of this.fields.children) {

                if (field.type === 'submit') continue;

                const input = field.hasAttribute('fieldType') ? msQuery(field.getAttribute('fieldType'), field.shadowRoot) : msQuery('input', field.shadowRoot);

                if (!input.value || !input.name) continue;

                postBody[input.name] = input.value;
            }
            const url = this.form.getAttribute('action');
            const reply = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(postBody),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await reply.json();
            ContactModal.prototype.response = data;
            return this.emitEvent('response-ready');
        } catch (err) {
            ContactModal.prototype.response = err;
            return this.emitEvent('response-ready');
        }
    }

    emitEvent(event) {
        const customEvent = new CustomEvent(event)
        return this.dispatchEvent(customEvent);
    }

    responseHandler() {
        if (this.response[0] && this.response[0].error) {
            this.loader.classList.add('fail');
            this.formResponder();
            ContactModal.prototype.response = undefined;
            this.loading = false;
            return;
        } else if (this.response.success) {
            this.loader.classList.add('success');
            this.form.reset();
            ContactModal.prototype.response = undefined;
            this.loading = false;
            return;
        } else {
            this.loader.classList.add('fail');
            ContactModal.prototype.response = undefined;
            this.loading = false;
            return;
        }
    }

    formResponder() {
        for (let err of this.response) {
            msQuery(`[name="${err.field}"]`, this.shadowRoot).setAttribute('failed', '');
        }
    }
    // Define the watch escape event to close the modal 
    // If someone presses escape -- for accessibility
    _watchEscape(event) {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    // Make the close function which was bound to 'this'
    close() {
        if (this.open !== false) {
            this.open = false;
        }
        const closeEvent = new CustomEvent('modal-closed');
        this.dispatchEvent(closeEvent);
    }
}

class ContactInput extends ContactModal {
    constructor() {
        super();
        this.refresh = this.refresh.bind(this);
        this.tooltip = msCreate('span', {
            class: 'tooltip'
        });
    }
    attributeChangedCallback(attr, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[attr] = this.hasAttribute(attr);
        };
    }
    static get observedAttributes() {
        return ['failed']
    };

    get failed() {
        return this.hasAttribute('failed');
    }

    set failed(didFail) {
        if (didFail) {
            this.elem.blur();
            this.setAttribute('failed', '');
            this.elem.style = 'background: rgba(204,0,0,0.1);';
            this.respondToForm();
        } else {
            this.elem.style = '';
            this.removeAttribute('failed');
            this.tooltip.remove();
        }
    }
    connectedCallback() {
        if (this.isConnected) {
            const style = msCreate('style');
            style.innerHTML = `
              .tooltip {
                background: #322e2e;
                color: white;
                position: absolute;
                font-size: 1rem;
                border-radius: 0.8rem;
                cursor: pointer;
                -webkit-transition: 0.3s;
                transition: 0.3s;
                top: 0%;
                left: 50%;
                content: '';
                -webkit-transform: translate(-50%, -100%);
                        transform: translate(-50%, -100%);
                padding: 0.6rem;
              }
              
              .tooltip::after {
                position: absolute;
                bottom: -1rem;
                left: 50%;
                background-color: #322e2e;
                content: '';
                width: 1rem;
                height: 1rem;
                -webkit-transform: rotate(45deg) translateX(-75%);
                        transform: rotate(45deg) translateX(-75%);
              }
              
              .tooltip:hover {
                -webkit-box-shadow: 0.2rem 0.2rem 0.4rem 0.2rem rgba(204, 0, 0, 0.3);
                        box-shadow: 0.2rem 0.2rem 0.4rem 0.2rem rgba(204, 0, 0, 0.3);
              }
              
              textarea {
                resize: none;
                width: calc(100% - 8rem); }
              
              input,
              textarea {
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                padding: 1rem;
                font-size: 1.5rem;
                border-radius: 1rem 0 1rem 0;
                border: 0.1rem solid rgba(0, 0, 0, 0.3);
                margin: 1rem;
                -webkit-transition: 0.4s;
                transition: 0.4s; }
                input[type=text]:-internal-autofill-selected {
                    background: red;
                }`;
            const shadow = this.attachShadow({
                mode: 'open'
            });
            shadow.append(style);
            this.elem = this.makeInput(this.hasAttribute('fieldType') ? this.getAttribute('fieldType') : 'input');
            msAppend([this.elem], shadow);
            this.elem.addEventListener('click', this.refresh);
            this.elem.addEventListener('focus', this.refresh);
        }
    }
    refresh() {
        this.failed = false;
    }
    disconnectedCallback() {
        this.elem.removeEventListener('click', this.refresh);
        this.elem.removeEventListener('focus', this.refresh);
        this.removeEventListener('click', this.removeTooltip);
    }

    makeInput(type = 'input') {
        const elem = document.createElement(type);
        for (let attr of this.attributes) {
            elem.setAttribute(attr.name, attr.value);
        }
        return elem;
    }

    respondToForm() {
        const err = super.response.filter(ele =>
            ele.field === this.getAttribute('name')
        );
        this.tooltip.innerHTML = err[0].error;
        msAppend([this.tooltip], this.shadowRoot);
        this.tooltip.addEventListener('click', this.removeTooltip);
    }

    removeTooltip() {
        this.remove();
        this.removeEventListener('click', this.removeTooltip);
    }

}

customElements.define('contact-modal', ContactModal);
customElements.define('contact-input', ContactInput);